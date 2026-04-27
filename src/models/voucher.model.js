import mongoose from "mongoose";

/* ------------------------------------------
   Voucher usage history
   Tracks where voucher amount was used
------------------------------------------- */
const VoucherUsageSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },

        amountUsed: {
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
   Main Voucher Schema
------------------------------------------- */
const VoucherSchema = new mongoose.Schema(
    {
        // Human readable voucher code
        // Example: VCH26APR0001
        voucherCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },

        // If voucher belongs to logged-in user
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        // If voucher belongs to guest booking
        guestPhoneNumber: {
            type: String,
            default: null,
            trim: true,
            index: true,
        },

        // Guest full name (if issued for a guest booking)
        guestName: {
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

        // Booking from which voucher was created
        sourceBookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            index: true,
        },

        // Original voucher amount
        originalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        // Remaining usable amount
        remainingAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        // Voucher lifecycle
        status: {
            type: String,
            enum: [
                "ACTIVE",         // fully unused
                "PARTIALLY_USED", // some amount used
                "USED",           // fully consumed
                "EXPIRED",        // expiry crossed
                "CANCELLED",      // manually cancelled
            ],
            default: "ACTIVE",
            index: true,
        },

        // Why voucher was issued
        issueReason: {
            type: String,
            default: "Booking cancellation voucher",
            trim: true,
        },

        // Expiry date
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        // Usage history
        usedBookings: {
            type: [VoucherUsageSchema],
            default: [],
        },

        // Admin/staff note
        notes: {
            type: String,
            default: "",
            trim: true,
        },

        // Who issued voucher
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Optional soft active
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
VoucherSchema.index({ voucherCode: 1 }, { unique: true });
VoucherSchema.index({ userId: 1, status: 1 });
VoucherSchema.index({ guestPhoneNumber: 1, status: 1 });
VoucherSchema.index({ guestEmail: 1, status: 1 });
VoucherSchema.index({ sourceBookingId: 1 }, { unique: true });
VoucherSchema.index({ status: 1, expiresAt: 1 });

/* ------------------------------------------
    Pre-save:
    Ensure status is auto-adjusted based on
    remainingAmount and expiry
------------------------------------------- */
VoucherSchema.pre("save", function () {
    const now = new Date();

    if (this.expiresAt && this.expiresAt <= now && this.status !== "USED") {
        this.status = "EXPIRED";
    } else if (this.remainingAmount <= 0) {
        this.status = "USED";
        this.remainingAmount = 0;
    } else if (this.remainingAmount < this.originalAmount) {
        this.status = "PARTIALLY_USED";
    } else if (this.remainingAmount === this.originalAmount) {
        this.status = "ACTIVE";
    }
});

export default mongoose.models.Voucher || mongoose.model("Voucher", VoucherSchema);