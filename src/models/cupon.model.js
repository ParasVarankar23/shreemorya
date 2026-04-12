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
        // Human-readable coupon code
        // Example: SUMMER100 / NEWUSER10 / MAY25
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

        // Discount type
        discountType: {
            type: String,
            enum: ["FLAT", "PERCENTAGE"],
            required: true,
            index: true,
        },

        // If FLAT => ₹ amount
        // If PERCENTAGE => % value
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },

        // For percentage discount, optional max cap
        maxDiscountAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Minimum booking amount required
        minBookingAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Total overall usage limit
        usageLimit: {
            type: Number,
            default: 0, // 0 = unlimited
            min: 0,
        },

        // Current total usage count
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Per user/guest usage limit
        perUserLimit: {
            type: Number,
            default: 1,
            min: 1,
        },

        // Coupon validity window
        validFrom: {
            type: Date,
            required: true,
            index: true,
        },

        validTill: {
            type: Date,
            required: true,
            index: true,
        },

        // Status
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "EXPIRED", "DISABLED"],
            default: "ACTIVE",
            index: true,
        },

        // Optional restrictions
        applicableRoles: {
            type: [String],
            enum: ["guest", "user", "staff", "admin"],
            default: ["guest", "user"],
        },

        applicableBookingSources: {
            type: [String],
            enum: ["ONLINE", "OFFLINE", "ADMIN", "STAFF"],
            default: ["ONLINE"],
        },

        // Optional route/date control (future-ready)
        applicableRouteNames: {
            type: [String],
            default: [],
        },

        applicableBusTypes: {
            type: [String],
            enum: ["AC", "NON_AC"],
            default: [],
        },

        // Optional first booking only logic (future use)
        isFirstBookingOnly: {
            type: Boolean,
            default: false,
        },

        // Usage history
        usageHistory: {
            type: [CouponUsageSchema],
            default: [],
        },

        // Admin note
        notes: {
            type: String,
            default: "",
            trim: true,
        },

        // Who created coupon
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
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ status: 1, validFrom: 1, validTill: 1 });
CouponSchema.index({ discountType: 1, status: 1 });

/* ------------------------------------------
    Auto-expire status based on validTill
------------------------------------------- */
CouponSchema.pre("save", function () {
    const now = new Date();

    if (this.validTill && this.validTill < now && this.status !== "DISABLED") {
        this.status = "EXPIRED";
    }
});

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);