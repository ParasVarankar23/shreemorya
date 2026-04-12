import mongoose from "mongoose";

/* ------------------------------------------
   Route Point Snapshot Schema
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
------------------------------------------- */
const SeatRuleSchema = new mongoose.Schema(
    {
        seatNumber: {
            type: Number,
            required: true,
            min: 1,
        },
        ruleType: {
            type: String,
            enum: ["ONLY_LADIES", "ONLY_SENIOR_CITIZEN", "BLOCKED"],
            required: true,
        },
        note: {
            type: String,
            default: "",
            trim: true,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Bus Replacement History Schema
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
        },
        newSeatLayout: {
            type: Number,
            required: true,
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
        replacedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const ScheduleSchema = new mongoose.Schema(
    {
        /* ------------------------------------------
           Bus Snapshot
        ------------------------------------------- */
        busId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            required: true,
            index: true,
        },

        busNumber: {
            type: String,
            required: true,
            trim: true,
            index: true,
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
        },

        seatLayout: {
            type: Number,
            enum: [21, 31, 35, 39],
            required: true,
        },

        /* ------------------------------------------
           Route / Trip Snapshot
        ------------------------------------------- */
        routeName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        tripDirection: {
            type: String,
            enum: ["FORWARD", "RETURN"],
            required: true,
            index: true,
        },

        travelDate: {
            type: Date,
            required: true,
            index: true,
        },

        startPoint: {
            type: String,
            required: true,
            trim: true,
        },

        startTime: {
            type: String,
            required: true,
            trim: true,
        },

        endPoint: {
            type: String,
            required: true,
            trim: true,
        },

        endTime: {
            type: String,
            required: true,
            trim: true,
        },

        pickupPoints: {
            type: [RoutePointSchema],
            default: [],
        },

        dropPoints: {
            type: [RoutePointSchema],
            default: [],
        },

        /* ------------------------------------------
           Fare Snapshot
        ------------------------------------------- */
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

        fareType: {
            type: String,
            enum: ["REGULAR", "SEASONAL", "SPECIAL"],
            default: "REGULAR",
        },

        /* ------------------------------------------
           Seat Rules
        ------------------------------------------- */
        seatRules: {
            type: [SeatRuleSchema],
            default: [],
        },

        /* ------------------------------------------
           Schedule State
        ------------------------------------------- */
        status: {
            type: String,
            enum: ["SCHEDULED", "DEPARTED", "COMPLETED", "CANCELLED"],
            default: "SCHEDULED",
            index: true,
        },

        isBookingOpen: {
            type: Boolean,
            default: true,
            index: true,
        },

        bookingClosedAt: {
            type: Date,
            default: null,
        },

        notes: {
            type: String,
            default: "",
            trim: true,
        },

        /* ------------------------------------------
           Bus Replacement Tracking
        ------------------------------------------- */
        busReplacementHistory: {
            type: [BusReplacementHistorySchema],
            default: [],
        },

        /* ------------------------------------------
           Soft Delete
        ------------------------------------------- */
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        /* ------------------------------------------
           Audit Fields
        ------------------------------------------- */
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
    },
    {
        timestamps: true,
    }
);

/* ------------------------------------------
   Indexes
------------------------------------------- */
ScheduleSchema.index({
    busId: 1,
    travelDate: 1,
    tripDirection: 1,
    isActive: 1,
});

ScheduleSchema.index({
    routeName: 1,
    travelDate: 1,
    tripDirection: 1,
    status: 1,
});

ScheduleSchema.index({
    travelDate: 1,
    isBookingOpen: 1,
    status: 1,
});

export default mongoose.models.Schedule ||
    mongoose.model("Schedule", ScheduleSchema);