import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
    {
        // Who performed the action
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        userRole: {
            type: String,
            enum: ["admin", "staff", "user", "guest"],
            required: true,
            index: true,
        },

        // Action name
        // Example: CREATE_BUS, UPDATE_SCHEDULE, CANCEL_BOOKING
        action: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            index: true,
        },

        // Which entity was affected
        entityType: {
            type: String,
            enum: [
                "BUS",
                "SCHEDULE",
                "BOOKING",
                "PAYMENT",
                "VOUCHER",
                "COUPON",
                "USER",
                "SEAT_HOLD",
                "NOTIFICATION",
                "FARE",
                "SYSTEM",
            ],
            required: true,
            index: true,
        },

        // The record ID affected
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true,
        },

        // Human-friendly optional reference
        entityCode: {
            type: String,
            default: "",
            trim: true,
            uppercase: true,
            index: true,
        },

        // Optional summary message
        message: {
            type: String,
            default: "",
            trim: true,
        },

        // Old and new values (important for updates)
        oldValues: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        newValues: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        // Extra metadata
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        // Optional request info
        ipAddress: {
            type: String,
            default: "",
            trim: true,
        },

        userAgent: {
            type: String,
            default: "",
            trim: true,
        },

        // Success / failure
        status: {
            type: String,
            enum: ["SUCCESS", "FAILED"],
            default: "SUCCESS",
            index: true,
        },

        // If failed
        errorMessage: {
            type: String,
            default: "",
            trim: true,
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
   Helpful indexes
------------------------------------------- */
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ entityCode: 1, createdAt: -1 });
AuditLogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.AuditLog ||
    mongoose.model("AuditLog", AuditLogSchema);