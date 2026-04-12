import mongoose from "mongoose";

/* ------------------------------------------
   Pickup / Drop Point Schema
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
        landmark: {
            type: String,
            default: "",
            trim: true,
        },
        order: {
            type: Number,
            required: true,
            min: 1,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Trip Definition (forward / return)
------------------------------------------- */
const TripSchema = new mongoose.Schema(
    {
        routeName: {
            type: String,
            required: true,
            trim: true,
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
            validate: {
                validator: function (value) {
                    return !value || value.length <= 150;
                },
                message: "pickupPoints cannot exceed 150 entries",
            },
        },
        dropPoints: {
            type: [RoutePointSchema],
            default: [],
            validate: {
                validator: function (value) {
                    return !value || value.length <= 150;
                },
                message: "dropPoints cannot exceed 150 entries",
            },
        },
        baseFare: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Bus Master Schema
------------------------------------------- */
const BusSchema = new mongoose.Schema(
    {
        busNumber: {
            type: String,
            required: true,
            unique: true,
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
        },

        seatLayout: {
            type: Number,
            enum: [21, 22, 31, 35, 39],
            required: true,
        },

        totalSeats: {
            type: Number,
            required: true,
            min: 1,
        },

        cabinSeatCount: {
            type: Number,
            default: 0,
            min: 0,
            max: 10,
        },

        cabinSeats: {
            type: [Number],
            default: [],
            validate: {
                validator: function (value) {
                    return !value || value.length <= 10;
                },
                message: "cabinSeats cannot exceed 10 seats",
            },
        },

        tripType: {
            type: String,
            enum: ["ONE_WAY", "RETURN"],
            default: "ONE_WAY",
        },

        forwardTrip: {
            type: TripSchema,
            required: true,
        },

        returnTrip: {
            type: TripSchema,
            default: null,
        },

        amenities: {
            type: [String],
            default: [],
        },

        operatorNotes: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "MAINTENANCE"],
            default: "ACTIVE",
            index: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
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

// Keep totalSeats in sync with seatLayout & handle ONE_WAY
BusSchema.pre("validate", function () {
    if (this.seatLayout && (!this.totalSeats || this.totalSeats !== this.seatLayout)) {
        this.totalSeats = this.seatLayout;
    }

    if (this.tripType === "ONE_WAY") {
        this.returnTrip = null;
    }
});

BusSchema.index({ busNumber: 1 }, { unique: true });
BusSchema.index({ status: 1, busType: 1 });

export default mongoose.models.Bus || mongoose.model("Bus", BusSchema);
