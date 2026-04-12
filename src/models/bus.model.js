import mongoose from "mongoose";

/* ------------------------------------------
   Point Schema (pickup / drop points)
------------------------------------------- */
const RoutePointSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        time: {
            type: String,
            default: "",
            trim: true,
        },

        fareOffset: {
            type: Number,
            default: 0,
            min: 0,
        },

        order: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Seat Rule Schema
   For ladies only / senior / blocked seats
------------------------------------------- */
const SeatRuleSchema = new mongoose.Schema(
    {
        seatNumber: {
            type: Number,
            required: true,
            min: 1,
        },

        type: {
            type: String,
            enum: ["NORMAL", "LADIES_ONLY", "SENIOR_ONLY", "BLOCKED"],
            default: "NORMAL",
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        reason: {
            type: String,
            default: "",
            trim: true,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Bus Replacement History
------------------------------------------- */
const BusReplacementHistorySchema = new mongoose.Schema(
    {
        oldBusId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            required: true,
        },

        newBusId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            required: true,
        },

        oldSeatLayout: {
            type: Number,
            required: true,
            min: 1,
        },

        newSeatLayout: {
            type: Number,
            required: true,
            min: 1,
        },

        replacedAt: {
            type: Date,
            default: Date.now,
        },

        reason: {
            type: String,
            default: "",
            trim: true,
        },

        replacedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Main Schedule Schema
------------------------------------------- */
const ScheduleSchema = new mongoose.Schema(
    {
        // Which bus template is assigned for this date
        busId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            required: true,
            index: true,
        },

        // Helpful snapshot fields (avoid too many joins)
        busNumber: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        busName: {
            type: String,
            required: true,
            trim: true,
        },

        busType: {
            type: String,
            enum: ["AC", "NON_AC"],
            required: true,
            index: true,
        },

        seatLayout: {
            type: Number,
            required: true,
            enum: [21, 31, 35, 39],
        },

        // Route / direction
        routeName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        tripDirection: {
            type: String,
            enum: ["FORWARD", "RETURN"],
            default: "FORWARD",
            index: true,
        },

        // Date of travel
        travelDate: {
            type: Date,
            required: true,
            index: true,
        },

        // Actual start/end snapshot for this date
        startPoint: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        startTime: {
            type: String,
            required: true,
            trim: true, // "06:00"
        },

        endPoint: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        endTime: {
            type: String,
            required: true,
            trim: true, // "10:30"
        },

        // Date-wise actual pickup/drop points
        pickupPoints: {
            type: [RoutePointSchema],
            default: [],
        },

        dropPoints: {
            type: [RoutePointSchema],
            default: [],
        },

        // Fare snapshot for this schedule
        baseFare: {
            type: Number,
            required: true,
            min: 0,
        },

        effectiveFare: {
            type: Number,
            required: true,
            min: 0,
        },

        // Whether season fare applied
        fareType: {
            type: String,
            enum: ["REGULAR", "SEASONAL", "SPECIAL"],
            default: "REGULAR",
            index: true,
        },

        // Seat rules for this date
        seatRules: {
            type: [SeatRuleSchema],
            default: [],
        },

        // Schedule status
        status: {
            type: String,
            enum: [
                "SCHEDULED", // available for booking
                "ACTIVE",    // journey started / running
                "COMPLETED", // trip finished
                "CANCELLED", // cancelled trip
                "CLOSED",    // booking closed manually
            ],
            default: "SCHEDULED",
            index: true,
        },

        // Booking open/close control
        isBookingOpen: {
            type: Boolean,
            default: true,
            index: true,
        },

        bookingClosedAt: {
            type: Date,
            default: null,
        },

        // If bus replaced later
        busReplacementHistory: {
            type: [BusReplacementHistorySchema],
            default: [],
        },

        // Optional notes
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
   Prevent duplicate same bus + same direction + same date
------------------------------------------- */
ScheduleSchema.index(
    { busId: 1, travelDate: 1, tripDirection: 1 },
    { unique: true }
);

/* ------------------------------------------
   Search / listing indexes
------------------------------------------- */
ScheduleSchema.index({ travelDate: 1, startPoint: 1, endPoint: 1 });
ScheduleSchema.index({ routeName: 1, travelDate: 1, tripDirection: 1 });
ScheduleSchema.index({ status: 1, isBookingOpen: 1, travelDate: 1 });

export default mongoose.models.Schedule ||
    mongoose.model("Schedule", ScheduleSchema);