import mongoose from "mongoose";

const SeatHoldSchema = new mongoose.Schema(
    {
        scheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule",
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

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

        seatNumbers: {
            type: [String],
            required: true,
            validate: {
                validator: function (value) {
                    return Array.isArray(value) && value.length > 0;
                },
                message: "At least one seat number is required",
            },
        },

        holdDurationMinutes: {
            type: Number,
            default: 5,
            min: 1,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: ["ACTIVE", "EXPIRED", "CANCELLED", "CONVERTED_TO_BOOKING"],
            default: "ACTIVE",
            index: true,
        },

        convertedBookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
            index: true,
        },

        source: {
            type: String,
            enum: ["ONLINE", "USER", "STAFF", "ADMIN"],
            default: "ONLINE",
            index: true,
        },

        notes: {
            type: String,
            default: "",
            trim: true,
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

SeatHoldSchema.index({ scheduleId: 1, status: 1, expiresAt: 1 });
SeatHoldSchema.index({ userId: 1, status: 1 });
SeatHoldSchema.index({ guestPhoneNumber: 1, status: 1 });
SeatHoldSchema.index({ guestEmail: 1, status: 1 });
SeatHoldSchema.index({ convertedBookingId: 1 }, { sparse: true });

SeatHoldSchema.pre("validate", function () {
    if (!this.expiresAt) {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + (this.holdDurationMinutes || 5));
        this.expiresAt = expiry;
    }
});

export default mongoose.models.SeatHold || mongoose.model("SeatHold", SeatHoldSchema);

