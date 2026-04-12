import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        // If logged-in user
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        // For guest booking notifications
        guestPhoneNumber: {
            type: String,
            default: null,
            trim: true,
            index: true,
        },

        guestEmail: {
            type: String,
            default: null,
            trim: true,
            lowercase: true,
            index: true,
        },

        // Title + message
        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        // Notification category
        type: {
            type: String,
            enum: [
                "BOOKING",
                "PAYMENT",
                "VOUCHER",
                "COUPON",
                "SCHEDULE",
                "SEAT_CHANGE",
                "SYSTEM",
            ],
            default: "SYSTEM",
            index: true,
        },

        // Delivery channel
        channel: {
            type: String,
            enum: ["IN_APP", "EMAIL", "SMS", "WHATSAPP"],
            default: "IN_APP",
            index: true,
        },

        // Related entity references (optional)
        relatedBookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
            index: true,
        },

        relatedPaymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null,
        },

        relatedVoucherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Voucher",
            default: null,
        },

        relatedCouponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            default: null,
        },

        relatedScheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule",
            default: null,
        },

        // Read state (for in-app UI)
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },

        readAt: {
            type: Date,
            default: null,
        },

        // Sent state (for email/sms/whatsapp tracking)
        isSent: {
            type: Boolean,
            default: false,
            index: true,
        },

        sentAt: {
            type: Date,
            default: null,
        },

        // Optional delivery error tracking
        sendError: {
            type: String,
            default: "",
            trim: true,
        },

        // Priority (future-ready)
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "MEDIUM",
            index: true,
        },

        // Optional metadata for frontend
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        // Who created this (admin/staff/system)
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Soft active
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

/* ------------------------------------------
   Helpful Indexes
------------------------------------------- */
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ guestPhoneNumber: 1, createdAt: -1 });
NotificationSchema.index({ guestEmail: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, channel: 1, createdAt: -1 });
NotificationSchema.index({ relatedBookingId: 1 });

export default mongoose.models.Notification ||
    mongoose.model("Notification", NotificationSchema);