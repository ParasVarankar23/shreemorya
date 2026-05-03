import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Schedule from "@/models/schedule.model";
import SeatHold from "@/models/seat-hold.model";
import { getAuthUserFromRequest } from "@/utils/auth";
import { NextResponse } from "next/server";

function hasDuplicates(arr = []) {
    return new Set(arr).size !== arr.length;
}

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { scheduleId, seatNumbers, guestPhoneNumber = null, guestEmail = null, holdDurationMinutes = 5, source = "ONLINE" } = body;

        if (!scheduleId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
            return NextResponse.json({ success: false, message: "scheduleId and seatNumbers are required" }, { status: 400 });
        }

        const normalizedSeats = seatNumbers.map((s) => String(s).trim()).filter(Boolean);

        if (hasDuplicates(normalizedSeats)) {
            return NextResponse.json({ success: false, message: "Duplicate seat numbers are not allowed" }, { status: 400 });
        }

        const schedule = await Schedule.findById(scheduleId).lean();
        if (!schedule) return NextResponse.json({ success: false, message: "Schedule not found" }, { status: 404 });

        if (!["SCHEDULED", "ACTIVE"].includes(schedule.status)) {
            return NextResponse.json({ success: false, message: "Schedule is not available for booking" }, { status: 400 });
        }

        const maxSeats = Number(schedule.seatLayout || 0);
        const invalidSeat = normalizedSeats.find((seat) => Number(seat) < 1 || Number(seat) > maxSeats);
        if (invalidSeat) return NextResponse.json({ success: false, message: `Invalid seat number: ${invalidSeat}` }, { status: 400 });

        // support multiple shapes for seatRules (ruleType vs type, optional isActive)
        const blockedSeatSet = new Set(
            (schedule.seatRules || [])
                .filter((rule) => {
                    const isActive = rule.isActive === undefined ? true : Boolean(rule.isActive);
                    const type = String(rule.type || rule.ruleType || "").toUpperCase();
                    return isActive && type === "BLOCKED";
                })
                .map((rule) => String(rule.seatNumber))
        );
        const blockedSeat = normalizedSeats.find((seat) => blockedSeatSet.has(seat));
        if (blockedSeat) return NextResponse.json({ success: false, message: `Seat ${blockedSeat} is blocked` }, { status: 400 });

        const now = new Date();

        // Attach authenticated user info early so we can allow same-user holds
        let authUser = null;
        try {
            authUser = await getAuthUserFromRequest(request);
        } catch (e) {
            authUser = null;
        }

        const [confirmedBookings, activeHolds] = await Promise.all([
            Booking.find({ scheduleId, bookingStatus: "CONFIRMED" }).select("seatItems seats").lean(),
            SeatHold.find({ scheduleId, status: "ACTIVE", expiresAt: { $gt: now } }).select("seatNumbers guestPhoneNumber userId").lean(),
        ]);

        const bookedSeatSet = new Set(confirmedBookings.flatMap((b) => {
            const seats = Array.isArray(b.seatItems) && b.seatItems.length > 0 ? b.seatItems.map((i) => String(i.seatNo)) : (Array.isArray(b.seats) ? b.seats.map(String) : []);
            return seats;
        }));

        // Build a map of seat => owner info for active holds
        const heldSeatOwnerMap = {};
        for (const h of activeHolds) {
            const ownerId = h.userId ? String(h.userId) : null;
            const guestPhone = h.guestPhoneNumber ? String(h.guestPhoneNumber) : null;
            for (const s of (h.seatNumbers || [])) {
                const seatKey = String(s);
                heldSeatOwnerMap[seatKey] = { ownerId, guestPhone };
            }
        }

        const alreadyBooked = normalizedSeats.find((seat) => bookedSeatSet.has(seat));
        if (alreadyBooked) return NextResponse.json({ success: false, message: `Seat ${alreadyBooked} is already booked` }, { status: 400 });

        // Check held seats: allow seats already held by the same user (or matching guest phone),
        // but reject seats held by other users.
        const seatsToCreate = [];
        for (const seat of normalizedSeats) {
            const owner = heldSeatOwnerMap[String(seat)];
            if (!owner) {
                seatsToCreate.push(seat);
                continue;
            }

            // If authenticated and owns the hold, skip (do not attempt to re-hold)
            if (authUser && owner.ownerId && String(owner.ownerId) === String(authUser.userId)) {
                // skip adding to create list
                continue;
            }

            // If guest phone matches an existing hold's guest phone, allow (treat as same owner)
            if (!authUser && guestPhoneNumber && owner.guestPhone && String(owner.guestPhone) === String(guestPhoneNumber)) {
                continue;
            }

            // Held by someone else -> conflict
            return NextResponse.json({ success: false, message: `Seat ${seat} is temporarily held by another user` }, { status: 400 });
        }

        // If all requested seats are already held by this user, try to return
        // the existing active hold id that owns these seats so callers can
        // use it when creating a booking. Fall back to a no-op response
        // with holdId=null if we can't locate the original hold document.
        if (seatsToCreate.length === 0) {
            let existingHold = null;

            try {
                if (authUser && authUser.userId) {
                    existingHold = await SeatHold.findOne({
                        scheduleId,
                        status: "ACTIVE",
                        userId: authUser.userId,
                        expiresAt: { $gt: now },
                        seatNumbers: { $all: normalizedSeats },
                    }).lean();
                }

                if (!existingHold && guestPhoneNumber) {
                    existingHold = await SeatHold.findOne({
                        scheduleId,
                        status: "ACTIVE",
                        guestPhoneNumber: String(guestPhoneNumber),
                        expiresAt: { $gt: now },
                        seatNumbers: { $all: normalizedSeats },
                    }).lean();
                }
            } catch (e) {
                console.warn("FIND_EXISTING_HOLD_ERROR:", e?.message || e);
                existingHold = null;
            }

            if (existingHold) {
                return NextResponse.json({
                    success: true,
                    message: `Seats already held by you`,
                    data: {
                        holdId: existingHold._id,
                        scheduleId: existingHold.scheduleId,
                        seatNumbers: existingHold.seatNumbers,
                        expiresAt: existingHold.expiresAt,
                        holdDurationMinutes: existingHold.holdDurationMinutes || holdDurationMinutes,
                    },
                });
            }

            return NextResponse.json({ success: true, message: `Seats already held by you`, data: { holdId: null, scheduleId, seatNumbers: normalizedSeats } });
        }

        const resolvedSource = authUser
            ? authUser.role === "admin"
                ? "ADMIN"
                : authUser.role === "staff"
                    ? "STAFF"
                    : "USER"
            : source;

        const holdPayload = {
            scheduleId,
            guestPhoneNumber,
            guestEmail,
            seatNumbers: seatsToCreate,
            holdDurationMinutes,
            source: resolvedSource,
        };

        if (authUser && authUser.userId) {
            holdPayload.userId = authUser.userId;
            holdPayload.createdBy = authUser.userId;
        }

        const hold = await SeatHold.create(holdPayload);

        return NextResponse.json({ success: true, message: `Seats held successfully for ${hold.holdDurationMinutes} minutes`, data: { holdId: hold._id, scheduleId: hold.scheduleId, seatNumbers: hold.seatNumbers, expiresAt: hold.expiresAt, holdDurationMinutes: hold.holdDurationMinutes } });
    } catch (error) {
        console.error("PUBLIC_SEAT_HOLD_ERROR:", error);
        return NextResponse.json({ success: false, message: "Failed to hold seats", error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { holdId } = body;
        if (!holdId) return NextResponse.json({ success: false, message: "holdId is required" }, { status: 400 });

        const found = await SeatHold.findById(holdId);
        if (!found) return NextResponse.json({ success: false, message: "Hold not found" }, { status: 404 });

        found.status = "CANCELLED";
        found.isActive = false;
        await found.save();

        return NextResponse.json({ success: true, message: "Hold released" });
    } catch (error) {
        console.error("PUBLIC_SEAT_HOLD_DELETE_ERROR:", error);
        return NextResponse.json({ success: false, message: "Failed to release hold", error: error.message }, { status: 500 });
    }
}