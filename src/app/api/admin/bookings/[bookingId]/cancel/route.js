import { sendBookingCancellation } from "@/lib/emailService";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Schedule from "@/models/schedule.model";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    try {
        await connectDB();

        // ✅ Next.js dynamic params fix
        const { bookingId } = await params;

        const body = await request.json().catch(() => ({}));
        const actionType = body?.actionType || "NO_REFUND";

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        // Optional schedule fetch for bus number + route name in email
        let schedule = null;
        try {
            if (booking?.scheduleId) {
                schedule = await Schedule.findById(booking.scheduleId).lean();
            }
        } catch (scheduleError) {
            console.warn("CANCEL_BOOKING_SCHEDULE_FETCH_ERROR:", scheduleError.message);
        }

        // Detect if this was a manually blocked seat OR a real booking
        const isBlockedSeat =
            String(booking?.seatStatus || "").toLowerCase() === "blocked" ||
            String(booking?.customerName || "").trim().toLowerCase() === "blocked seat" ||
            String(booking?.customerPhone || "").trim().toUpperCase() === "BLOCKED";

        const bookingAmount = Number(
            booking?.finalPayableAmount || booking?.fare || 0
        );

        // Default refund object
        let refund = {
            amount: 0,
            mode: "NO_REFUND",
            success: false,
            processedAt: new Date(),
        };

        // If this is a real booking and refund is selected
        if (!isBlockedSeat && actionType === "REFUND_ORIGINAL") {
            refund = {
                amount: bookingAmount,
                mode: "REFUND_ORIGINAL",
                success: true,
                processedAt: new Date(),
            };
        } else if (!isBlockedSeat && actionType === "ISSUE_VOUCHER") {
            refund = {
                amount: bookingAmount,
                mode: "ISSUE_VOUCHER",
                success: true,
                processedAt: new Date(),
            };
        }

        // =========================
        // ✅ MAIN FIX
        // =========================
        booking.bookingStatus = "CANCELLED";
        booking.cancelActionType = actionType;
        booking.cancelledAt = new Date();
        booking.refund = refund;

        // IMPORTANT:
        // - Blocked seat stays blocked
        // - Real cancelled booking becomes available again
        if (isBlockedSeat) {
            booking.seatStatus = "blocked";
            booking.paymentStatus = "UNPAID";
        } else {
            booking.seatStatus = "cancelled"; // ✅ makes seat available in UI
            if (actionType === "REFUND_ORIGINAL") {
                booking.paymentStatus = "REFUNDED";
            } else if (actionType === "ISSUE_VOUCHER") {
                booking.paymentStatus = "VOUCHER_ISSUED";
            } else {
                // NO_REFUND
                if (booking.paymentStatus === "PAID") {
                    booking.paymentStatus = "PAID";
                } else {
                    booking.paymentStatus = booking.paymentStatus || "UNPAID";
                }
            }
        }

        await booking.save();

        // =========================
        // Email send
        // =========================
        try {
            const recipientEmail =
                booking.contactDetails?.email ||
                booking.customerEmail ||
                "";

            if (recipientEmail && !isBlockedSeat) {
                const bookingObject = booking.toObject();

                await sendBookingCancellation(
                    recipientEmail,
                    booking.contactDetails?.fullName ||
                    booking.customerName ||
                    "Passenger",
                    {
                        ...bookingObject,
                        date: booking.travelDate,
                        travelDate: booking.travelDate,
                        seats: Array.isArray(booking.seats) ? booking.seats : [],
                        fare: booking.fare || 0,
                        finalPayableAmount: booking.finalPayableAmount || 0,

                        // ✅ ensure email shows these also
                        busNumber:
                            bookingObject?.busNumber ||
                            schedule?.busNumber ||
                            bookingObject?.busDetails?.busNumber ||
                            "--",

                        routeName:
                            bookingObject?.routeName ||
                            schedule?.routeName ||
                            bookingObject?.routeDetails?.routeName ||
                            "--",

                        pickupName: booking.pickupName || "",
                        pickupMarathi: booking.pickupMarathi || "",
                        pickupTime: booking.pickupTime || "",

                        dropName: booking.dropName || "",
                        dropMarathi: booking.dropMarathi || "",
                        dropTime: booking.dropTime || "",

                        paymentMethod: booking.paymentMethod || "OFFLINE_UNPAID",
                        paymentStatus: booking.paymentStatus || "UNPAID",

                        // ✅ always send refund object
                        refund,
                    }
                );
            }
        } catch (mailError) {
            console.warn("BOOKING_CANCELLATION_EMAIL_ERROR:", mailError.message);
        }

        return NextResponse.json({
            success: true,
            message: isBlockedSeat
                ? "Blocked seat cancelled successfully"
                : "Booking cancelled successfully",
            data: booking,
        });
    } catch (error) {
        console.error("POST /api/admin/bookings/[bookingId]/cancel error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to cancel booking",
            },
            { status: 500 }
        );
    }
}