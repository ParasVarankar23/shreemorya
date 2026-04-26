import { connectDB } from "@/lib/db";
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
        const { scheduleId, seatNumbers, guestPhoneNumber = null, guestEmail = null } = body;

        if (!scheduleId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
            return NextResponse.json(
                { success: false, message: "scheduleId and seatNumbers are required" },
                { status: 400 }
            );
        }

        const normalizedSeats = seatNumbers.map((seat) => String(seat).trim());

        if (hasDuplicates(normalizedSeats)) {
            return NextResponse.json(
                { success: false, message: "Duplicate seat numbers are not allowed" },
                { status: 400 }
            );
        }

        const schedule = await Schedule.findById(scheduleId).lean();

        if (!schedule) {
            return NextResponse.json(
                { success: false, message: "Schedule not found" },
                { status: 404 }
            );
        }

        if (!["SCHEDULED", "ACTIVE"].includes(schedule.status)) {
            return NextResponse.json(
                { success: false, message: "Schedule is not available for booking" },
                { status: 400 }
            );
        }

        const invalidSeat = normalizedSeats.find(
            (seat) => Number(seat) < 1 || Number(seat) > schedule.seatCapacity
        );

        if (invalidSeat) {
            return NextResponse.json(
                { success: false, message: `Invalid seat number: ${invalidSeat}` },
                { status: 400 }
            );
        }

        const blockedSeatSet = new Set(
            (schedule.seatRules || [])
                .filter((rule) => rule.isActive && rule.type === "BLOCKED")
                .map((rule) => String(rule.seatNumber))
        );

        const blockedSeat = normalizedSeats.find((seat) => blockedSeatSet.has(seat));
        if (blockedSeat) {
            return NextResponse.json(
                { success: false, message: `Seat ${blockedSeat} is blocked` },
                { status: 400 }
            );
        }

        const now = new Date();

        const [confirmedBookings, activeHolds] = await Promise.all([
            Booking.find({
                scheduleId,
                bookingStatus: "CONFIRMED",
            })
                .select("passengers")
                .lean(),
            SeatHold.find({
                scheduleId,
                status: "ACTIVE",
                expiresAt: { $gt: now },
            })
                .select("seatNumbers")
                .lean(),
        ]);

        const bookedSeatSet = new Set(
            confirmedBookings.flatMap((booking) =>
                (booking.passengers || []).map((p) => String(p.seatNumber))
            )
        );

        const heldSeatSet = new Set(
            activeHolds.flatMap((hold) => (hold.seatNumbers || []).map((seat) => String(seat)))
        );

        const alreadyBooked = normalizedSeats.find((seat) => bookedSeatSet.has(seat));
        if (alreadyBooked) {
            return NextResponse.json(
                { success: false, message: `Seat ${alreadyBooked} is already booked` },
                { status: 400 }
            );
        }

        const alreadyHeld = normalizedSeats.find((seat) => heldSeatSet.has(seat));
        if (alreadyHeld) {
            return NextResponse.json(
                { success: false, message: `Seat ${alreadyHeld} is temporarily held by another user` },
                { status: 400 }
            );
        }

        const hold = await SeatHold.create({
            scheduleId,
            guestPhoneNumber,
            guestEmail,
            seatNumbers: normalizedSeats,
            holdDurationMinutes: 5,
            source: "ONLINE",
        });

        return NextResponse.json({
            success: true,
            message: "Seats held successfully for 5 minutes",
            data: {
                holdId: hold._id,
                scheduleId: hold.scheduleId,
                seatNumbers: hold.seatNumbers,
                expiresAt: hold.expiresAt,
                holdDurationMinutes: hold.holdDurationMinutes,
            },
        });
    } catch (error) {
        console.error("PUBLIC_SEAT_HOLD_ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Failed to hold seats", error: error.message },
            { status: 500 }
        );
    }
}