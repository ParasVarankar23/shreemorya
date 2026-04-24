import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Payment from "@/models/payment.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

/* ------------------------------------------
   POST /api/admin/bookings/[bookingId]/mark-paid
------------------------------------------- */
export async function POST(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin/Staff only" },
                { status: 403 }
            );
        }

        const { bookingId } = params;
        const body = await request.json();

        const {
            amount = null,
            paymentMethod = "OFFLINE",
            notes = "",
        } = body;

        const booking = await Booking.findById(bookingId);

        if (!booking || !booking.isActive) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        if (booking.bookingStatus === "CANCELLED") {
            return NextResponse.json(
                { success: false, message: "Cannot mark paid for cancelled booking" },
                { status: 400 }
            );
        }

        const oldValues = booking.toObject();

        const paymentAmount =
            amount != null ? Number(amount) : Number(booking.amountDue || 0);

        if (paymentAmount <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment amount must be greater than 0",
                },
                { status: 400 }
            );
        }

        const newAmountPaid = Number(booking.amountPaid || 0) + paymentAmount;
        const finalPayableAmount = Number(booking.finalPayableAmount || 0);

        booking.amountPaid = newAmountPaid;
        booking.amountDue = Math.max(finalPayableAmount - newAmountPaid, 0);
        booking.paymentMethod = paymentMethod;

        if (booking.amountPaid >= finalPayableAmount) {
            booking.paymentStatus = "PAID";
            booking.bookingStatus = "CONFIRMED";
        } else if (booking.amountPaid > 0) {
            booking.paymentStatus = "PARTIAL";
            booking.bookingStatus = "PARTIAL";
        }

        booking.updatedBy = authUser.userId;

        await booking.save();

        const payment = await Payment.create({
            bookingId: booking._id,
            scheduleId: booking.scheduleId,
            userId: booking.userId || null,
            amount: paymentAmount,
            currency: "INR",
            paymentMethod,
            paymentGateway: paymentMethod === "RAZORPAY" ? "RAZORPAY" : "OFFLINE",
            paymentStatus: "CAPTURED",
            transactionType: "BOOKING",
            referenceType: "BOOKING",
            referenceId: booking._id,
            notes,
            createdBy: authUser.userId,
            updatedBy: authUser.userId,
            isActive: true,
        });

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "MARK_BOOKING_PAID",
                entityType: "BOOKING",
                entityId: booking._id,
                entityCode: booking.bookingCode,
                message: `Marked booking ${booking.bookingCode} as paid`,
                oldValues,
                newValues: booking.toObject(),
                metadata: {
                    paymentId: payment._id,
                    paymentAmount,
                },
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log mark paid error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Booking payment updated successfully",
            data: {
                booking,
                payment,
            },
        });
    } catch (error) {
        console.error("POST /api/admin/bookings/[bookingId]/mark-paid error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to mark booking as paid",
            },
            { status: 500 }
        );
    }
}