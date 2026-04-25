import connectDB from "@/lib/connectDB";
import Booking from "@/models/booking.model";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    try {
        await connectDB();

        const { bookingId } = params;
        const body = await request.json();
        const actionType = body?.actionType || "NO_REFUND";

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        booking.bookingStatus = "CANCELLED";
        booking.seatStatus = "blocked";
        booking.cancelActionType = actionType;

        if (actionType === "REFUND_ORIGINAL") {
            booking.paymentStatus = "REFUNDED";
        } else if (actionType === "ISSUE_VOUCHER") {
            booking.paymentStatus = "VOUCHER_ISSUED";
        }

        await booking.save();

        return NextResponse.json({
            success: true,
            message: "Booking cancelled successfully",
            data: booking,
        });
    } catch (error) {
        console.error("POST /api/admin/bookings/[bookingId]/cancel error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to cancel booking" },
            { status: 500 }
        );
    }
}