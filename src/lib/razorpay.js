import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createRazorpayOrder({ amount, receipt, notes = {} }) {
    const options = {
        amount: Math.round(Number(amount) * 100), // rupees to paise
        currency: "INR",
        receipt: String(receipt).slice(0, 40),
        notes,
    };

    return await razorpay.orders.create(options);
}

export function verifyRazorpayPaymentSignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}) {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    return expectedSignature === razorpay_signature;
}

export function verifyRazorpayWebhookSignature(rawBody, signature) {
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

    return expectedSignature === signature;
}

export async function fetchRazorpayPayment(paymentId) {
    return await razorpay.payments.fetch(paymentId);
}