import mongoose from "mongoose";

/* ------------------------------------------
   Coupon usage history
------------------------------------------- */
const CouponUsageSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        guestPhoneNumber: {
            type: String,
            default: null,
            trim: true,
        },

        guestEmail: {
            type: String,
            default: null,
            trim: true,
            lowercase: true,
        },

        amountDiscounted: {
            type: Number,
            required: true,
            min: 0,
        },

        usedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Main Coupon Schema
------------------------------------------- */
const CouponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        discountType: {
            type: String,
            enum: ["FLAT", "PERCENTAGE"],
            required: true,
            index: true,
        },

        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },

        maxDiscountAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        minBookingAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // ONE_WAY, RETURN, BOTH
        applicableTripType: {
            type: String,
            enum: ["ONE_WAY", "RETURN", "BOTH"],
            default: "BOTH",
        },

        // ALL, ONLINE_ONLY, OFFLINE_ONLY
        applicableFor: {
            type: String,
            enum: ["ALL", "ONLINE_ONLY", "OFFLINE_ONLY"],
            default: "ALL",
        },

        usageLimitTotal: {
            type: Number,
            default: 0, // 0 = unlimited
            min: 0,
        },

        usageLimitPerUser: {
            type: Number,
            default: 0, // 0 = unlimited
            min: 0,
        },

        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        startsAt: {
            type: Date,
            required: true,
            index: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "EXPIRED"],
            default: "ACTIVE",
            index: true,
        },

        usageHistory: {
            type: [CouponUsageSchema],
            default: [],
        },

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

// Ensure percentage discounts do not exceed 100
CouponSchema.pre("validate", function () {
    if (this.discountType === "PERCENTAGE" && this.discountValue > 100) {
        this.invalidate("discountValue", "Percentage discount cannot exceed 100%");
    }
});

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
