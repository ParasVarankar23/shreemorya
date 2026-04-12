import mongoose from "mongoose";

/* ------------------------------------------
   Passenger Schema (seat-wise passenger data)
------------------------------------------- */
const PassengerSchema = new mongoose.Schema(
    {
        seatNumber: {
            type: Number,
            required: true,
            min: 1,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true,
        },

        age: {
            type: Number,
            required: true,
            min: 0,
            max: 120,
        },

        // Optional later if needed
        isPrimary: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Contact Details Schema (booking owner)
------------------------------------------- */
const ContactDetailsSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Seat Change History Schema
   Useful when admin replaces bus and seats
   need to be rearranged automatically
------------------------------------------- */
const SeatChangeHistorySchema = new mongoose.Schema(
    {
        oldSeatNumber: {
            type: Number,
            required: true,
            min: 1,
        },

        newSeatNumber: {
            type: Number,
            required: true,
            min: 1,
        },

        changedAt: {
            type: Date,
            default: Date.now,
        },

        reason: {
            type: String,
            default: "",
            trim: true,
        },

        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Cancellation Snapshot Schema
------------------------------------------- */
const CancellationSchema = new mongoose.Schema(
    {
        cancelledAt: {
            type: Date,
            default: null,
        },

        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        reason: {
            type: String,
            default: "",
            trim: true,
        },

        mode: {
            type: String,
            enum: ["NONE", "REFUND", "VOUCHER"],
            default: "NONE",
        },

        refundAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        voucherAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Main Booking Schema
------------------------------------------- */
const BookingSchema = new mongoose.Schema(
    {
        // Human readable booking number
        // Example: 26APR0001
        bookingCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },

        // If logged-in user booked
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        // Guest booking support
        isGuestBooking: {
            type: Boolean,
            default: true,
            index: true,
        },

        // Linked schedule (date-wise actual trip)
        scheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule",
            required: true,
            index: true,
        },

        // Snapshot link to bus
        busId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            required: true,
            index: true,
        },

        // Important for one-way / return schedule direction
        tripDirection: {
            type: String,
            enum: ["FORWARD", "RETURN"],
            default: "FORWARD",
            index: true,
        },

        // Travel date snapshot
        travelDate: {
            type: Date,
            required: true,
            index: true,
        },

        // Boarding and dropping selected by customer
        boardingPoint: {
            type: String,
            required: true,
            trim: true,
        },

        droppingPoint: {
            type: String,
            required: true,
            trim: true,
        },

        // Customer contact info
        contactDetails: {
            type: ContactDetailsSchema,
            required: true,
        },

        // All passengers seat-wise
        passengers: {
            type: [PassengerSchema],
            validate: {
                validator: function (value) {
                    return Array.isArray(value) && value.length > 0;
                },
                message: "At least one passenger is required",
            },
            required: true,
        },

        // Fare snapshot
        farePerSeat: {
            type: Number,
            required: true,
            min: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
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
            required: true,
            min: 0,
        },

        // Applied voucher / coupon refs
        appliedVoucherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Voucher",
            default: null,
            index: true,
        },

        appliedCouponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            default: null,
            index: true,
        },

        // ONLINE / OFFLINE booking source
        bookingSource: {
            type: String,
            enum: ["ONLINE", "OFFLINE", "ADMIN", "STAFF"],
            default: "ONLINE",
            index: true,
        },

        // Booking lifecycle
        bookingStatus: {
            type: String,
            enum: [
                "PENDING",    // created but payment pending
                "CONFIRMED",  // paid / confirmed
                "CANCELLED",  // cancelled by user/admin/staff
                "EXPIRED",    // 5 min expired unpaid
                "FAILED",     // failed booking / failed confirmation
                "COMPLETED",  // after trip finished (future use)
                "NO_SHOW",    // future use
            ],
            default: "PENDING",
            index: true,
        },

        // Payment status snapshot
        paymentStatus: {
            type: String,
            enum: [
                "PENDING",
                "PAID",
                "FAILED",
                "UNPAID",
                "PARTIAL",
                "REFUNDED",
                "VOUCHER_ISSUED",
            ],
            default: "PENDING",
            index: true,
        },

        // Selected payment mode for this booking
        paymentMethod: {
            type: String,
            enum: ["RAZORPAY", "CASH", "UPI", "BANK_TRANSFER", "NONE"],
            default: "RAZORPAY",
            index: true,
        },

        // 5-minute expiry for pending online booking
        expiresAt: {
            type: Date,
            default: null,
            index: true,
        },

        // Important timestamps
        confirmedAt: {
            type: Date,
            default: null,
        },

        completedAt: {
            type: Date,
            default: null,
        },

        // Seat change tracking when bus replaced
        seatChangeHistory: {
            type: [SeatChangeHistorySchema],
            default: [],
        },

        // Cancellation snapshot
        cancellation: {
            type: CancellationSchema,
            default: () => ({}),
        },

        // Optional remarks
        notes: {
            type: String,
            default: "",
            trim: true,
        },

        // Who created / updated (admin/staff useful)
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
BookingSchema.index({ scheduleId: 1, bookingStatus: 1 });
BookingSchema.index({ scheduleId: 1, travelDate: 1 });
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ "contactDetails.phoneNumber": 1 });
BookingSchema.index({ "contactDetails.email": 1 });
BookingSchema.index({ bookingCode: 1 }, { unique: true });
BookingSchema.index({ bookingStatus: 1, paymentStatus: 1 });
BookingSchema.index({ expiresAt: 1 }, { sparse: true });

/* ------------------------------------------
   Pre-save Safety:
   - if userId exists => not guest
   - if no userId => guest
------------------------------------------- */
BookingSchema.pre("save", function (next) {
    if (this.userId) {
        this.isGuestBooking = false;
    } else {
        this.isGuestBooking = true;
    }

    next();
});

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);