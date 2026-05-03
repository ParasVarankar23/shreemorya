import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import { NextResponse } from "next/server";

/**
 * Public endpoint that returns occupied seats for a schedule/date.
 * Response: { success: true, data: [ { seatNo, passengerGender, status, bookingId } ] }
 */
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const scheduleId = searchParams.get("scheduleId");
        const date = searchParams.get("date");

        if (!scheduleId || !date) {
            return NextResponse.json({ success: false, message: "scheduleId and date are required" }, { status: 400 });
        }

        const bookings = await Booking.find({ scheduleId, travelDate: date }).lean();

        const occupied = [];

        for (const booking of bookings) {
            const seatItems = Array.isArray(booking?.seatItems) && booking.seatItems.length > 0
                ? booking.seatItems
                : (Array.isArray(booking?.seats) ? booking.seats.map((s) => ({ seatNo: String(s), passengerGender: "", seatStatus: String(booking?.seatStatus || "booked") })) : []);

            for (const item of seatItems) {
                const seatNo = String(item?.seatNo || "");
                const seatStatus = String(item?.seatStatus || "booked").toLowerCase();
                if (!seatNo) continue;
                if (!["booked", "blocked"].includes(seatStatus)) continue;

                occupied.push({
                    seatNo,
                    passengerGender: String(item?.passengerGender || "").toLowerCase(),
                    status: seatStatus,
                    bookingId: String(booking?._id || ""),
                });
            }
        }

        return NextResponse.json({ success: true, data: occupied });
    } catch (err) {
        console.error("GET /api/bookings/occupied error:", err);
        return NextResponse.json({ success: false, message: err?.message || "Failed to load occupied seats" }, { status: 500 });
    }
}
