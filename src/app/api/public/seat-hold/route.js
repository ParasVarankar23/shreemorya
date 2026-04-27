import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Schedule from "@/models/schedule.model";
import SeatHold from "@/models/seat-hold.model";
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

        const [confirmedBookings, activeHolds] = await Promise.all([
            Booking.find({ scheduleId, bookingStatus: "CONFIRMED" }).select("seatItems seats").lean(),
            SeatHold.find({ scheduleId, status: "ACTIVE", expiresAt: { $gt: now } }).select("seatNumbers").lean(),
        ]);

        const bookedSeatSet = new Set(confirmedBookings.flatMap((b) => {
            const seats = Array.isArray(b.seatItems) && b.seatItems.length > 0 ? b.seatItems.map((i) => String(i.seatNo)) : (Array.isArray(b.seats) ? b.seats.map(String) : []);
            return seats;
        }));

        const heldSeatSet = new Set(activeHolds.flatMap((h) => (h.seatNumbers || []).map(String)));

        const alreadyBooked = normalizedSeats.find((seat) => bookedSeatSet.has(seat));
        if (alreadyBooked) return NextResponse.json({ success: false, message: `Seat ${alreadyBooked} is already booked` }, { status: 400 });

        const alreadyHeld = normalizedSeats.find((seat) => heldSeatSet.has(seat));
        if (alreadyHeld) return NextResponse.json({ success: false, message: `Seat ${alreadyHeld} is temporarily held by another user` }, { status: 400 });

        const hold = await SeatHold.create({ scheduleId, guestPhoneNumber, guestEmail, seatNumbers: normalizedSeats, holdDurationMinutes, source });

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