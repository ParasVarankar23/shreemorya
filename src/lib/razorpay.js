import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.warn(
        "Razorpay keys are missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
    );
}

export const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * Convert INR rupees to paise
 * Example: 700 => 70000
 */
export function toPaise(amountInRupees) {
    const amount = Number(amountInRupees);

    if (Number.isNaN(amount) || amount < 0) {
        throw new Error("Invalid amount passed to toPaise");
    }

    return Math.round(amount * 100);
}

/**
 * Convert paise to INR rupees
 * Example: 70000 => 700
 */
export function fromPaise(amountInPaise) {
    const amount = Number(amountInPaise);

    if (Number.isNaN(amount) || amount < 0) {
        throw new Error("Invalid amount passed to fromPaise");
    }

    return amount / 100;
}

/**
 * Create Razorpay order
 */
export async function createRazorpayOrder({
    amount, // in INR
    currency = "INR",
    receipt,
    notes = {},
}) {
    if (!amount || Number(amount) <= 0) {
        throw new Error("Amount must be greater than 0");
    }

    if (!receipt) {
        throw new Error("Receipt is required for Razorpay order");
    }

    const options = {
        amount: toPaise(amount), // Razorpay expects paise
        currency,
        receipt,
        notes,
    };

    return razorpayInstance.orders.create(options);
}

/**
 * Verify Razorpay payment signature after checkout success
 */
export function verifyRazorpayPaymentSignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}) {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return false;
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    return expectedSignature === razorpay_signature;
}

/**
 * Verify Razorpay webhook signature
 * @param {string|Buffer} rawBody Raw request body
 * @param {string} receivedSignature Value from x-razorpay-signature header
 */
export function verifyRazorpayWebhookSignature(rawBody, receivedSignature) {
    if (!RAZORPAY_WEBHOOK_SECRET) {
        throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
    }

    if (!rawBody || !receivedSignature) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

    return expectedSignature === receivedSignature;
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchRazorpayPayment(paymentId) {
    if (!paymentId) {
        throw new Error("paymentId is required");
    }

    return razorpayInstance.payments.fetch(paymentId);
}

/**
 * Fetch order details from Razorpay
 */
export async function fetchRazorpayOrder(orderId) {
    if (!orderId) {
        throw new Error("orderId is required");
    }

    return razorpayInstance.orders.fetch(orderId);
}

/**
 * Refund a payment (full or partial)
 * amount is in INR
 */
export async function refundRazorpayPayment(paymentId, amount = null, notes = {}) {
    if (!paymentId) {
        throw new Error("paymentId is required");
    }

    const payload = {
        notes,
    };

    if (amount !== null && amount !== undefined) {
        payload.amount = toPaise(amount);
    }

    return razorpayInstance.payments.refund(paymentId, payload);
}