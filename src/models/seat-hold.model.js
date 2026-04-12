import mongoose from "mongoose";

const SeatHoldSchema = new mongoose.Schema(
    {
        // Linked schedule (date-wise trip)
        scheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule",
            required: true,
            index: true,
        },

        // If logged-in user is holding seats
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        // Guest contact info (important for guest booking flow)
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

        // Seats temporarily locked
        seatNumbers: {
            type: [Number],
            required: true,
            validate: {
                validator: function (value) {
                    return Array.isArray(value) && value.length > 0;
                },
                message: "At least one seat number is required",
            },
        },

        // How long hold is valid
        holdDurationMinutes: {
            type: Number,
            default: 5,
            min: 1,
        },

        // Expiry time
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        // Hold lifecycle
        status: {
            type: String,
            enum: [
                "ACTIVE",               // currently locked
                "EXPIRED",              // expired after 5 mins
                "CANCELLED",            // manually cancelled
                "CONVERTED_TO_BOOKING", // payment success -> booking confirmed
            ],
            default: "ACTIVE",
            index: true,
        },

        // If converted after payment success
        convertedBookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
            index: true,
        },

        // Booking flow source
        source: {
            type: String,
            enum: ["ONLINE", "USER", "STAFF", "ADMIN"],
            default: "ONLINE",
            index: true,
        },

        // Optional note
        notes: {
            type: String,
            default: "",
            trim: true,
        },

        // Audit fields
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

        // Soft active flag
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
SeatHoldSchema.index({ scheduleId: 1, status: 1, expiresAt: 1 });
SeatHoldSchema.index({ userId: 1, status: 1 });
SeatHoldSchema.index({ guestPhoneNumber: 1, status: 1 });
SeatHoldSchema.index({ guestEmail: 1, status: 1 });
SeatHoldSchema.index({ convertedBookingId: 1 }, { sparse: true });

/* ------------------------------------------
    Auto-calculate expiresAt before validation
    if not explicitly passed
------------------------------------------- */
SeatHoldSchema.pre("validate", function () {
    if (!this.expiresAt) {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + (this.holdDurationMinutes || 5));
        this.expiresAt = expiry;
    }
});

export default mongoose.models.SeatHold || mongoose.model("SeatHold", SeatHoldSchema);