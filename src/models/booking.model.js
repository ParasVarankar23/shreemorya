import mongoose from "mongoose";

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

        seats: {
            type: [String],
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
        },
        pickupMarathi: {
            type: String,
            default: "",
        },
        pickupTime: {
            type: String,
            default: "",
        },

        dropName: {
            type: String,
            default: "",
        },
        dropMarathi: {
            type: String,
            default: "",
        },
        dropTime: {
            type: String,
            default: "",
        },

        fare: {
            type: Number,
            default: 0,
        },

        finalPayableAmount: {
            type: Number,
            default: 0,
        },

        seatStatus: {
            type: String,
            enum: ["booked", "blocked"],
            default: "booked",
        },

        bookingStatus: {
            type: String,
            enum: ["CONFIRMED", "CANCELLED"],
            default: "CONFIRMED",
        },

        paymentStatus: {
            type: String,
            enum: ["PAID", "UNPAID", "REFUNDED", "VOUCHER_ISSUED"],
            default: "UNPAID",
        },

        paymentMethod: {
            type: String,
            enum: ["ONLINE", "OFFLINE_CASH", "OFFLINE_UPI", "OFFLINE_UNPAID"],
            default: "OFFLINE_UNPAID",
        },

        cancelActionType: {
            type: String,
            enum: ["", "REFUND_ORIGINAL", "ISSUE_VOUCHER", "NO_REFUND"],
            default: "",
        },
    },
    { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);