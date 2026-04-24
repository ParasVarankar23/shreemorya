import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Payment from "@/models/payment.model";
import Voucher from "@/models/voucher.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

function generateVoucherCode() {
    return `VCH-${Date.now()}`;
}

/* ------------------------------------------
   POST /api/admin/bookings/[bookingId]/cancel
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
            cancelReason = "Cancelled by admin",
            issueVoucher = false,
            voucherAmount = null,
            voucherExpiryDate = null,
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
                { success: false, message: "Booking already cancelled" },
                { status: 400 }
            );
        }

        const oldValues = booking.toObject();

        let createdVoucher = null;

        // Create voucher instead of refund (your business rule)
        if (issueVoucher) {
            const finalVoucherAmount =
                voucherAmount != null
                    ? Number(voucherAmount)
                    : Number(booking.amountPaid || 0);

            if (finalVoucherAmount > 0) {
                createdVoucher = await Voucher.create({
                    voucherCode: generateVoucherCode(),
                    bookingId: booking._id,
                    userId: booking.userId || null,
                    guestPhoneNumber: booking.customerPhone || "",
                    guestEmail: booking.customerEmail || "",
                    originalAmount: finalVoucherAmount,
                    remainingAmount: finalVoucherAmount,
                    usedAmount: 0,
                    expiryDate: voucherExpiryDate
                        ? new Date(voucherExpiryDate)
                        : (() => {
                            const d = new Date();
                            d.setMonth(d.getMonth() + 6);
                            return d;
                        })(),
                    status: "ACTIVE",
                    issuedReason: cancelReason,
                    createdBy: authUser.userId,
                    updatedBy: authUser.userId,
                    isActive: true,
                });
            }
        }

        booking.bookingStatus = "CANCELLED";
        booking.paymentStatus =
            Number(booking.amountPaid || 0) > 0 ? booking.paymentStatus : "UNPAID";
        booking.cancellationReason = cancelReason;
        booking.cancelledAt = new Date();
        booking.cancelledBy = authUser.userId;

        if (createdVoucher) {
            booking.voucherIssued = true;
            booking.voucherId = createdVoucher._id;
        }

        booking.updatedBy = authUser.userId;

        await booking.save();

        // Optional payment transaction record for voucher issuance
        if (createdVoucher) {
            await Payment.create({
                bookingId: booking._id,
                scheduleId: booking.scheduleId,
                userId: booking.userId || null,
                amount: createdVoucher.originalAmount,
                currency: "INR",
                paymentMethod: "VOUCHER",
                paymentGateway: "INTERNAL",
                paymentStatus: "CAPTURED",
                transactionType: "VOUCHER_ISSUED",
                referenceType: "VOUCHER",
                referenceId: createdVoucher._id,
                createdBy: authUser.userId,
                updatedBy: authUser.userId,
                isActive: true,
            });
        }

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "CANCEL_BOOKING",
                entityType: "BOOKING",
                entityId: booking._id,
                entityCode: booking.bookingCode,
                message: `Cancelled booking ${booking.bookingCode}`,
                oldValues,
                newValues: booking.toObject(),
                metadata: {
                    voucherIssued: !!createdVoucher,
                    voucherId: createdVoucher?._id || null,
                },
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log cancel booking error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: createdVoucher
                ? "Booking cancelled and voucher issued successfully"
                : "Booking cancelled successfully",
            data: {
                booking,
                voucher: createdVoucher,
            },
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