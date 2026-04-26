import { connectDB } from "@/lib/db";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import Booking from "@/models/booking.model";
import Notification from "@/models/Notification.model";
import Payment from "@/models/payment.model";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connectDB();

        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json(
                { success: false, message: "Missing Razorpay signature header" },
                { status: 400 }
            );
        }

        const isValid = verifyRazorpayWebhookSignature(rawBody, signature);

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: "Invalid webhook signature" },
                { status: 400 }
            );
        }

        const event = JSON.parse(rawBody);
        const eventType = event.event;
        const payload = event.payload || {};

        // payment.captured
        if (eventType === "payment.captured") {
            const paymentEntity = payload.payment?.entity;

            if (paymentEntity?.id) {
                const payment = await Payment.findOne({
                    gatewayPaymentId: paymentEntity.id,
                });

                if (payment) {
                    payment.paymentStatus = "PAID";
                    payment.gatewayResponse = paymentEntity;
                    if (!payment.paidAt) {
                        payment.paidAt = new Date();
                    }
                    await payment.save();

                    await Booking.findByIdAndUpdate(payment.bookingId, {
                        $set: {
                            paymentStatus: "PAID",
                        },
                    });
                }
            }
        }

        // payment.failed
        if (eventType === "payment.failed") {
            const paymentEntity = payload.payment?.entity;

            if (paymentEntity?.id) {
                const payment = await Payment.findOne({
                    $or: [
                        { gatewayPaymentId: paymentEntity.id },
                        { gatewayOrderId: paymentEntity.order_id },
                    ],
                });

                if (payment) {
                    payment.paymentStatus = "FAILED";
                    payment.gatewayResponse = paymentEntity;
                    await payment.save();

                    const booking = await Booking.findById(payment.bookingId);

                    if (booking && booking.bookingStatus !== "CONFIRMED") {
                        booking.paymentStatus = "FAILED";
                        await booking.save();

                        await Notification.create({
                            userId: booking.userId || null,
                            guestEmail: booking.contactDetails?.email || null,
                            guestPhoneNumber: booking.contactDetails?.phoneNumber || null,
                            title: "Payment Failed",
                            message: `Payment failed for booking ${booking.bookingCode}. Please try again.`,
                            type: "PAYMENT",
                            channel: "IN_APP",
                            relatedBookingId: booking._id,
                        });
                    }
                }
            }
        }

        // refund.processed
        if (eventType === "refund.processed") {
            const refundEntity = payload.refund?.entity;

            if (refundEntity?.payment_id) {
                const payment = await Payment.findOne({
                    gatewayPaymentId: refundEntity.payment_id,
                });

                if (payment) {
                    payment.refundStatus = "PROCESSED";
                    payment.refundAmount = (refundEntity.amount || 0) / 100;
                    payment.refundReferenceId = refundEntity.id;
                    payment.refundedAt = new Date();
                    payment.refundResponse = refundEntity;
                    await payment.save();

                    await Notification.create({
                        title: "Refund Processed",
                        message: `Refund processed for payment ${payment.gatewayPaymentId}`,
                        type: "PAYMENT",
                        channel: "IN_APP",
                        relatedBookingId: payment.bookingId,
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Webhook processed successfully",
        });
    } catch (error) {
        console.error("PAYMENTS_WEBHOOK_ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Webhook processing failed", error: error.message },
            { status: 500 }
        );
    }
}