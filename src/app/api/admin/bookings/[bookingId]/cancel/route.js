import { sendBookingCancellation } from "@/lib/emailService";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    try {
        await connectDB();

        const { bookingId } = await params;
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

        try {
            const recipientEmail = booking.contactDetails?.email || booking.customerEmail || "";

            if (recipientEmail) {
                await sendBookingCancellation(recipientEmail, booking.contactDetails?.fullName || booking.customerName || "Passenger", {
                    ...booking.toObject(),
                    date: booking.travelDate,
                    seats: Array.isArray(booking.seats) ? booking.seats : [],
                    refund: actionType === "REFUND_ORIGINAL"
                        ? { amount: Number(booking.finalPayableAmount || booking.fare || 0), success: true }
                        : null,
                });
            }
        } catch (mailError) {
            console.warn("BOOKING_CANCELLATION_EMAIL_ERROR:", mailError.message);
        }

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