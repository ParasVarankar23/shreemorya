import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/booking.model";
import Payment from "@/models/payment.model";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { bookingId } = body;

        if (!bookingId) {
            return NextResponse.json(
                { success: false, message: "bookingId is required" },
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

        if (booking.bookingSource !== "ONLINE") {
            return NextResponse.json(
                { success: false, message: "Only online bookings can create Razorpay order" },
                { status: 400 }
            );
        }

        if (booking.paymentMethod !== "RAZORPAY") {
            return NextResponse.json(
                { success: false, message: "Booking payment method is not Razorpay" },
                { status: 400 }
            );
        }

        if (booking.bookingStatus === "CONFIRMED") {
            return NextResponse.json(
                { success: false, message: "Booking is already confirmed" },
                { status: 400 }
            );
        }

        if (booking.bookingStatus === "CANCELLED") {
            return NextResponse.json(
                { success: false, message: "Booking is cancelled" },
                { status: 400 }
            );
        }

        if (booking.expiresAt && new Date() > new Date(booking.expiresAt)) {
            return NextResponse.json(
                { success: false, message: "Booking expired. Please book again." },
                { status: 400 }
            );
        }

        if (!booking.finalPayableAmount || booking.finalPayableAmount < 0) {
            return NextResponse.json(
                { success: false, message: "Invalid payable amount" },
                { status: 400 }
            );
        }

        // If fully covered by voucher/coupon, no Razorpay needed
        if (booking.finalPayableAmount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Final payable amount is 0. No Razorpay order needed. Confirm directly in verify-free flow (optional).",
                },
                { status: 400 }
            );
        }

        const razorpayOrder = await createRazorpayOrder({
            amount: booking.finalPayableAmount,
            receipt: booking.bookingCode,
            notes: {
                bookingId: String(booking._id),
                bookingCode: booking.bookingCode,
            },
        });

        let payment = await Payment.findOne({ bookingId: booking._id });

        if (payment) {
            payment.provider = "RAZORPAY";
            payment.method = "ONLINE";
            payment.paymentStatus = "CREATED";
            payment.gatewayOrderId = razorpayOrder.id;
            payment.amount = booking.finalPayableAmount;
            payment.currency = "INR";
            payment.gatewayResponse = razorpayOrder;
            await payment.save();
        } else {
            payment = await Payment.create({
                bookingId: booking._id,
                userId: booking.userId || null,
                provider: "RAZORPAY",
                method: "ONLINE",
                paymentStatus: "CREATED",
                amount: booking.finalPayableAmount,
                currency: "INR",
                gatewayOrderId: razorpayOrder.id,
                gatewayResponse: razorpayOrder,
            });
        }

        return NextResponse.json({
            success: true,
            message: "Razorpay order created successfully",
            data: {
                bookingId: booking._id,
                bookingCode: booking.bookingCode,
                amount: booking.finalPayableAmount,
                currency: "INR",
                razorpayOrderId: razorpayOrder.id,
                razorpayAmount: razorpayOrder.amount,
                razorpayCurrency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID,
                paymentId: payment._id,
            },
        });
    } catch (error) {
        console.error("PAYMENTS_CREATE_ORDER_ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Failed to create Razorpay order", error: error.message },
            { status: 500 }
        );
    }
}