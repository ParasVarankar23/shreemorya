import connectDB from "@/lib/connectDB";
import Booking from "@/models/booking.model";
import { NextResponse } from "next/server";

export async function POST(_, { params }) {
    try {
        await connectDB();

        const { bookingId } = params;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        booking.paymentStatus = "PAID";
        await booking.save();

        return NextResponse.json({
            success: true,
            message: "Booking marked as paid",
            data: booking,
        });
    } catch (error) {
        console.error("POST /api/admin/bookings/[bookingId]/mark-paid error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to mark paid" },
            { status: 500 }
        );
    }
}