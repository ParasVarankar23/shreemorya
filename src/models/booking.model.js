import mongoose from "mongoose";

const RefundSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            default: 0,
            min: 0,
        },
        mode: {
            type: String,
            default: "NO_REFUND",
            trim: true,
        },
        success: {
            type: Boolean,
            default: false,
        },
        processedAt: {
            type: Date,
            default: null,
        },
    },
    { _id: false }
);

const SeatItemSchema = new mongoose.Schema(
    {
        seatNo: {
            type: String,
            required: true,
            trim: true,
        },
        ticketNo: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },
        passengerName: {
            type: String,
            default: "",
            trim: true,
        },
        passengerGender: {
            type: String,
            enum: ["male", "female", "other", ""],
            default: "",
        },
        fare: {
            type: Number,
            default: 0,
            min: 0,
        },
        seatStatus: {
            type: String,
            enum: ["booked", "blocked", "cancelled"],
            default: "booked",
            index: true,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
        cancelActionType: {
            type: String,
            enum: ["", "REFUND_ORIGINAL", "ISSUE_VOUCHER", "NO_REFUND"],
            default: "",
        },
        refund: {
            type: RefundSchema,
            default: null,
        },
    },
    { _id: false }
);

const BookingSchema = new mongoose.Schema(
    {
        scheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule",
            required: true,
            index: true,
        },

        travelDate: {
            type: String,
            required: true,
            index: true,
        },

        // OLD field can keep temporarily for backward compatibility
        seats: {
            type: [String],
            default: [],
        },

        // NEW
        seatItems: {
            type: [SeatItemSchema],
            required: true,
            default: [],
        },

        bookingCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        customerName: {
            type: String,
            required: true,
            trim: true,
        },

        customerPhone: {
            type: String,
            required: true,
            trim: true,
        },

        customerEmail: {
            type: String,
            default: "",
            trim: true,
        },

        pickupName: {
            type: String,
            default: "",
            trim: true,
        },
        pickupMarathi: {
            type: String,
            default: "",
            trim: true,
        },
        pickupTime: {
            type: String,
            default: "",
            trim: true,
        },

        dropName: {
            type: String,
            default: "",
            trim: true,
        },
        dropMarathi: {
            type: String,
            default: "",
            trim: true,
        },
        dropTime: {
            type: String,
            default: "",
            trim: true,
        },

        fare: {
            type: Number,
            default: 0,
            min: 0,
        },

        finalPayableAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        bookingStatus: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "PARTIAL_CANCELLED", "CANCELLED"],
            default: "CONFIRMED",
            index: true,
        },

        paymentStatus: {
            type: String,
            enum: ["PAID", "UNPAID", "PARTIAL_REFUNDED", "REFUNDED", "FAILED", "VOUCHER_ISSUED"],
            default: "UNPAID",
            index: true,
        },

        paymentMethod: {
            type: String,
            enum: ["ONLINE", "OFFLINE_CASH", "OFFLINE_UPI", "OFFLINE_UNPAID"],
            default: "OFFLINE_UNPAID",
            index: true,
        },

        cancelActionType: {
            type: String,
            enum: ["", "REFUND_ORIGINAL", "ISSUE_VOUCHER", "NO_REFUND"],
            default: "",
        },

        refund: {
            type: RefundSchema,
            default: null,
        },

        paymentId: {
            type: String,
            default: "",
            trim: true,
        },

        expiresAt: {
            type: Date,
            default: null,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

BookingSchema.index({ scheduleId: 1, travelDate: 1 });
BookingSchema.index({ scheduleId: 1, travelDate: 1, bookingStatus: 1 });
BookingSchema.index({ scheduleId: 1, travelDate: 1, "seatItems.seatNo": 1 });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);