import { connectDB } from "@/lib/db";
import { createRazorpayOrder } from "@/lib/razorpay";
import Booking from "@/models/booking.model";
import Payment from "@/models/payment.model";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connectDB();

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
                },
                { status: 500 }
            );
        }

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

        if (!["ONLINE", "RAZORPAY"].includes(booking.paymentMethod)) {
            return NextResponse.json(
                { success: false, message: "Only online bookings can create Razorpay order" },
                { status: 400 }
            );
        }

        if (booking.paymentStatus === "PAID") {
            return NextResponse.json(
                { success: false, message: "Booking is already paid" },
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

        const finalAmount = Number(booking.finalPayableAmount || 0);

        if (finalAmount < 0) {
            return NextResponse.json(
                { success: false, message: "Invalid payable amount" },
                { status: 400 }
            );
        }

        if (finalAmount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Final payable amount is 0. No Razorpay order required.",
                },
                { status: 400 }
            );
        }

        const razorpayOrder = await createRazorpayOrder({
            amount: finalAmount,
            receipt: booking.bookingCode || `booking_${booking._id}`,
            notes: {
                bookingId: String(booking._id),
                bookingCode: booking.bookingCode || "",
            },
        });

        let payment = await Payment.findOne({ bookingId: booking._id });

        if (payment) {
            payment.provider = "RAZORPAY";
            payment.method = "ONLINE";
            payment.paymentStatus = "CREATED";
            payment.gatewayOrderId = razorpayOrder.id;
            payment.amount = finalAmount;
            payment.currency = razorpayOrder.currency || "INR";
            payment.gatewayResponse = razorpayOrder;
            await payment.save();
        } else {
            payment = await Payment.create({
                bookingId: booking._id,
                userId: booking.userId || null,
                provider: "RAZORPAY",
                method: "ONLINE",
                paymentStatus: "CREATED",
                amount: finalAmount,
                currency: razorpayOrder.currency || "INR",
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
                amount: finalAmount,
                currency: razorpayOrder.currency || "INR",
                razorpayOrderId: razorpayOrder.id,
                razorpayAmount: razorpayOrder.amount,
                razorpayCurrency: razorpayOrder.currency || "INR",
                key: process.env.RAZORPAY_KEY_ID,
                paymentId: payment._id,
            },
        });
    } catch (error) {
        console.error("PAYMENTS_CREATE_ORDER_ERROR:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create Razorpay order",
                error: error.message,
            },
            { status: 500 }
        );
    }
}