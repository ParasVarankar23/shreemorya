import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        // Payment provider / source
        provider: {
            type: String,
            enum: ["RAZORPAY", "CASH", "UPI", "BANK_TRANSFER", "MANUAL"],
            required: true,
            default: "RAZORPAY",
            index: true,
        },

        // Online or Offline
        method: {
            type: String,
            enum: ["ONLINE", "OFFLINE"],
            required: true,
            default: "ONLINE",
            index: true,
        },

        // Payment lifecycle
        paymentStatus: {
            type: String,
            enum: [
                "PENDING",   // booking created, payment not started yet
                "CREATED",   // Razorpay order created
                "PAID",      // payment successful
                "FAILED",    // payment failed
                "PARTIAL",   // partially paid (future use)
                "REFUNDED",  // fully refunded
                "CANCELLED", // payment cancelled / expired
            ],
            default: "PENDING",
            index: true,
        },

        // Amount info
        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true,
        },

        // Booking financial snapshot (very useful for audit / reports)
        totalAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        voucherAppliedAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        couponAppliedAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        finalPayableAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Razorpay / Gateway IDs
        gatewayOrderId: {
            type: String,
            default: null,
            index: true,
        },

        gatewayPaymentId: {
            type: String,
            default: null,
            index: true,
        },

        gatewaySignature: {
            type: String,
            default: null,
        },

        // Generic external reference for offline/manual payment
        transactionId: {
            type: String,
            default: null,
            trim: true,
            index: true,
        },

        // Example:
        // UPI ref no / bank txn no / manual slip no / Razorpay receipt id
        referenceNumber: {
            type: String,
            default: null,
            trim: true,
        },

        // Gateway responses / webhook payloads
        gatewayResponse: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        webhookEvents: [
            {
                eventType: {
                    type: String,
                    default: "",
                },
                payload: {
                    type: mongoose.Schema.Types.Mixed,
                    default: {},
                },
                receivedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Refund section
        refundStatus: {
            type: String,
            enum: ["NONE", "INITIATED", "PROCESSED", "FAILED"],
            default: "NONE",
            index: true,
        },

        refundAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        refundReferenceId: {
            type: String,
            default: null,
            trim: true,
        },

        refundResponse: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        refundedAt: {
            type: Date,
            default: null,
        },

        // For voucher instead of refund (optional but useful)
        settlementMode: {
            type: String,
            enum: ["NONE", "REFUND", "VOUCHER"],
            default: "NONE",
            index: true,
        },

        settlementAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Timestamps of payment flow
        initiatedAt: {
            type: Date,
            default: Date.now,
        },

        paidAt: {
            type: Date,
            default: null,
        },

        failedAt: {
            type: Date,
            default: null,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },

        // Who handled payment (admin/staff for offline cases)
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Manual note / remarks
        notes: {
            type: String,
            default: "",
            trim: true,
        },

        // Soft status
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Helpful indexes
PaymentSchema.index({ bookingId: 1, provider: 1 });
PaymentSchema.index({ paymentStatus: 1, createdAt: -1 });
PaymentSchema.index({ provider: 1, paymentStatus: 1 });
PaymentSchema.index({ gatewayOrderId: 1 }, { sparse: true });
PaymentSchema.index({ gatewayPaymentId: 1 }, { sparse: true });
PaymentSchema.index({ transactionId: 1 }, { sparse: true });

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);