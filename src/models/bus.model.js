import mongoose from "mongoose";

const PointSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        nameMr: { type: String, default: "", trim: true },
        time: { type: String, default: "", trim: true },
        order: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const TripSchema = new mongoose.Schema(
    {
        from: { type: String, required: true, trim: true },
        departureTime: { type: String, default: "", trim: true },
        to: { type: String, required: true, trim: true },
        arrivalTime: { type: String, default: "", trim: true },

        pickupPoints: {
            type: [PointSchema],
            default: [],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length <= 150,
                message: "Maximum 150 pickup points allowed",
            },
        },

        dropPoints: {
            type: [PointSchema],
            default: [],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length <= 150,
                message: "Maximum 150 drop points allowed",
            },
        },
    },
    { _id: false }
);

const CabinSchema = new mongoose.Schema(
    {
        label: { type: String, required: true, trim: true },
        seatIds: { type: [String], default: [] }, // optional
    },
    { _id: false }
);

const FareRuleSchema = new mongoose.Schema(
    {
        tripDirection: {
            type: String,
            enum: ["FORWARD", "RETURN"],
            required: true,
            default: "FORWARD",
        },

        pickup: { type: String, required: true, trim: true },
        pickupMr: { type: String, default: "", trim: true },
        pickupOrder: { type: Number, required: true, min: 1 },

        drop: { type: String, required: true, trim: true },
        dropMr: { type: String, default: "", trim: true },
        dropOrder: { type: Number, required: true, min: 1 },

        fare: { type: Number, required: true, min: 0 },

        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },

        applyToNextPickups: { type: Boolean, default: false },
        applyToPreviousDrops: { type: Boolean, default: false },

        isActive: { type: Boolean, default: true },
    },
    { _id: true }
);

const BusSchema = new mongoose.Schema(
    {
        busNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true,
        },

        busName: {
            type: String,
            required: true,
            trim: true,
        },

        busType: {
            type: String,
            enum: ["NON_AC", "AC", "SLEEPER", "SEMI_SLEEPER", "SEATER"],
            required: true,
            default: "NON_AC",
            index: true,
        },

        seatLayout: {
            type: Number,
            enum: [21, 32, 35, 39],
            required: true,
            index: true,
        },

        tripType: {
            type: String,
            enum: ["ONE_WAY", "RETURN"],
            required: true,
            default: "ONE_WAY",
            index: true,
        },

        routeName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        autoGenerateReturn: {
            type: Boolean,
            default: true,
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE",
            index: true,
        },

        forwardTrip: {
            type: TripSchema,
            required: true,
        },

        returnTrip: {
            type: TripSchema,
            default: null,
        },

        cabins: {
            type: [CabinSchema],
            default: [],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length <= 10,
                message: "Maximum 10 cabins allowed",
            },
        },

        fareRules: {
            type: [FareRuleSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

BusSchema.index({ busNumber: 1 });
BusSchema.index({ routeName: 1, tripType: 1, status: 1 });
BusSchema.index({ "fareRules.tripDirection": 1, "fareRules.startDate": 1, "fareRules.endDate": 1 });

export default mongoose.models.Bus || mongoose.model("Bus", BusSchema);