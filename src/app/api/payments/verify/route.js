import { connectDB } from "@/lib/db";
import {
    fetchRazorpayPayment,
    verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";
import Booking from "@/models/booking.model.model";
import Coupon from "@/models/coupon.model";
import Notification from "@/models/notification.model";
import Payment from "@/models/payment.model";
import Schedule from "@/models/schedule.model";
import SeatHold from "@/models/seat-hold.model";
import Voucher from "@/models/voucher.model";
import { NextResponse } from "next/server";

// Optional-safe import pattern (if you already have email helper)
import { sendBookingConfirmationEmail } from "@/lib/sendEmail";

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const {
            bookingId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = body;

        if (
            !bookingId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "bookingId, razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
                },
                { status: 400 }
            );
        }

        const isValidSignature = verifyRazorpayPaymentSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        if (!isValidSignature) {
            return NextResponse.json(
                { success: false, message: "Invalid Razorpay payment signature" },
                { status: 400 }
            );
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        if (booking.bookingStatus === "CONFIRMED" && booking.paymentStatus === "PAID") {
            return NextResponse.json({
                success: true,
                message: "Booking already verified",
                data: {
                    bookingId: booking._id,
                    bookingCode: booking.bookingCode,
                    bookingStatus: booking.bookingStatus,
                    paymentStatus: booking.paymentStatus,
                },
            });
        }

        if (booking.bookingStatus === "CANCELLED") {
            return NextResponse.json(
                { success: false, message: "Booking is cancelled" },
                { status: 400 }
            );
        }

        if (booking.expiresAt && new Date() > new Date(booking.expiresAt)) {
            return NextResponse.json(
                { success: false, message: "Booking expired before payment verification" },
                { status: 400 }
            );
        }

        const schedule = await Schedule.findById(booking.scheduleId).lean();

        if (!schedule) {
            return NextResponse.json(
                { success: false, message: "Schedule not found" },
                { status: 404 }
            );
        }

        if (!["SCHEDULED", "ACTIVE"].includes(schedule.status)) {
            return NextResponse.json(
                { success: false, message: "Schedule is not available anymore" },
                { status: 400 }
            );
        }

        const requestedSeats = (booking.passengers || []).map((p) => String(p.seatNumber));

        // Re-check confirmed bookings to avoid double booking
        const confirmedBookings = await Booking.find({
            scheduleId: booking.scheduleId,
            bookingStatus: "CONFIRMED",
            _id: { $ne: booking._id },
        })
            .select("passengers")
            .lean();

        const confirmedSeatSet = new Set(
            confirmedBookings.flatMap((b) =>
                (b.passengers || []).map((p) => String(p.seatNumber))
            )
        );

        const conflictingSeat = requestedSeats.find((seat) => confirmedSeatSet.has(seat));

        if (conflictingSeat) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Seat ${conflictingSeat} is already confirmed by another booking`,
                },
                { status: 409 }
            );
        }

        // Re-check blocked seats / rules
        const seatRuleMap = new Map(
            (schedule.seatRules || [])
                .filter((rule) => rule.isActive)
                .map((rule) => [String(rule.seatNumber), rule])
        );

        for (const passenger of booking.passengers || []) {
            const rule = seatRuleMap.get(String(passenger.seatNumber));
            if (!rule) continue;

            if (rule.type === "BLOCKED") {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Seat ${passenger.seatNumber} is blocked now`,
                    },
                    { status: 409 }
                );
            }

            if (rule.type === "LADIES_ONLY" && passenger.gender !== "female") {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Seat ${passenger.seatNumber} is ladies only`,
                    },
                    { status: 409 }
                );
            }

            if (rule.type === "SENIOR_ONLY" && Number(passenger.age) < 60) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Seat ${passenger.seatNumber} is senior only`,
                    },
                    { status: 409 }
                );
            }
        }

        // Fetch payment details from Razorpay (extra safety)
        let razorpayPayment = null;
        try {
            razorpayPayment = await fetchRazorpayPayment(razorpay_payment_id);
        } catch (err) {
            console.warn("Could not fetch Razorpay payment details:", err.message);
        }

        // Update booking
        booking.paymentStatus = "PAID";
        booking.bookingStatus = "CONFIRMED";
        booking.paymentMethod = "RAZORPAY";
        booking.expiresAt = null;
        booking.confirmedAt = new Date();
        await booking.save();

        // Update or create payment record
        let payment = await Payment.findOne({ bookingId: booking._id });

        if (payment) {
            payment.provider = "RAZORPAY";
            payment.method = "ONLINE";
            payment.paymentStatus = "PAID";
            payment.amount = booking.finalPayableAmount;
            payment.currency = "INR";
            payment.gatewayOrderId = razorpay_order_id;
            payment.gatewayPaymentId = razorpay_payment_id;
            payment.gatewaySignature = razorpay_signature;
            payment.gatewayResponse = razorpayPayment || {};
            payment.paidAt = new Date();
            await payment.save();
        } else {
            payment = await Payment.create({
                bookingId: booking._id,
                userId: booking.userId || null,
                provider: "RAZORPAY",
                method: "ONLINE",
                paymentStatus: "PAID",
                amount: booking.finalPayableAmount,
                currency: "INR",
                gatewayOrderId: razorpay_order_id,
                gatewayPaymentId: razorpay_payment_id,
                gatewaySignature: razorpay_signature,
                gatewayResponse: razorpayPayment || {},
                paidAt: new Date(),
            });
        }

        // Convert matching active seat hold to booking
        await SeatHold.updateMany(
            {
                scheduleId: booking.scheduleId,
                status: "ACTIVE",
                expiresAt: { $gt: new Date() },
                seatNumbers: { $all: requestedSeats, $size: requestedSeats.length },
                $or: [
                    {
                        guestPhoneNumber: booking.contactDetails?.phoneNumber || "__NO_PHONE__",
                    },
                    {
                        guestEmail:
                            booking.contactDetails?.email?.toLowerCase() || "__NO_EMAIL__",
                    },
                ],
            },
            {
                $set: {
                    status: "CONVERTED_TO_BOOKING",
                    convertedBookingId: booking._id,
                },
            }
        );

        // Apply voucher usage after successful payment
        if (booking.appliedVoucherId && booking.voucherAppliedAmount > 0) {
            const voucher = await Voucher.findById(booking.appliedVoucherId);

            if (voucher) {
                voucher.remainingAmount = Math.max(
                    0,
                    Number(voucher.remainingAmount || 0) - Number(booking.voucherAppliedAmount || 0)
                );

                if (voucher.remainingAmount === 0) {
                    voucher.status = "USED";
                } else {
                    voucher.status = "PARTIALLY_USED";
                }

                voucher.usedBookings = voucher.usedBookings || [];
                voucher.usedBookings.push({
                    bookingId: booking._id,
                    amountUsed: booking.voucherAppliedAmount,
                    usedAt: new Date(),
                });

                await voucher.save();
            }
        }

        // Apply coupon usage after successful payment
        if (booking.appliedCouponId && booking.couponAppliedAmount > 0) {
            await Coupon.findByIdAndUpdate(booking.appliedCouponId, {
                $inc: { usedCount: 1 },
            });
        }

        // Notification
        await Notification.create({
            userId: booking.userId || null,
            guestEmail: booking.contactDetails?.email || null,
            guestPhoneNumber: booking.contactDetails?.phoneNumber || null,
            title: "Booking Confirmed",
            message: `Your booking ${booking.bookingCode} is confirmed.`,
            type: "BOOKING",
            channel: "IN_APP",
            relatedBookingId: booking._id,
        });

        // Email (optional-safe)
        try {
            if (booking.contactDetails?.email) {
                await sendBookingConfirmationEmail({
                    booking,
                    schedule,
                    payment,
                });
            }
        } catch (emailError) {
            console.warn("BOOKING_CONFIRMATION_EMAIL_ERROR:", emailError.message);
        }

        return NextResponse.json({
            success: true,
            message: "Payment verified and booking confirmed successfully",
            data: {
                bookingId: booking._id,
                bookingCode: booking.bookingCode,
                bookingStatus: booking.bookingStatus,
                paymentStatus: booking.paymentStatus,
                paymentId: payment._id,
            },
        });
    } catch (error) {
        console.error("PAYMENTS_VERIFY_ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Failed to verify payment", error: error.message },
            { status: 500 }
        );
    }
}