import mongoose from "mongoose";

/* ------------------------------------------
   Route Point Schema
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
   Trip Schema
------------------------------------------- */
const TripSchema = new mongoose.Schema(
    {
        from: {
            type: String,
            required: true,
            trim: true,
        },
        to: {
            type: String,
            required: true,
            trim: true,
        },
        departureTime: {
            type: String,
            required: true,
            trim: true,
        },
        arrivalTime: {
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
    },
    { _id: false }
);

/* ------------------------------------------
   Fare Config Snapshot
------------------------------------------- */
const FareConfigSchema = new mongoose.Schema(
    {
        route: {
            type: String,
            default: "",
            trim: true,
        },
        busType: {
            type: String,
            enum: ["AC", "NON_AC", "AC_SLEEPER", "NON_AC_SLEEPER"],
            default: "NON_AC",
        },
        defaultAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { _id: false }
);

/* ------------------------------------------
   Bus Schema
------------------------------------------- */
const BusSchema = new mongoose.Schema(
    {
        busNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },

        busName: {
            type: String,
            required: true,
            trim: true,
        },

        busType: {
            type: String,
            enum: ["AC", "NON_AC", "AC_SLEEPER", "NON_AC_SLEEPER"],
            required: true,
            index: true,
        },

        seatLayout: {
            type: Number,
            enum: [21, 32, 35, 39],
            required: true,
            index: true,
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

        routeName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        routeCode: {
            type: String,
            default: "",
            trim: true,
            index: true,
        },

        tripType: {
            type: String,
            enum: ["ONE_WAY", "RETURN"],
            default: "ONE_WAY",
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

        fareConfig: {
            type: FareConfigSchema,
            default: () => ({
                route: "",
                busType: "NON_AC",
                defaultAmount: 0,
            }),
        },

        amenities: {
            type: [String],
            default: [],
        },

        notes: {
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

/* ------------------------------------------
   Hooks
------------------------------------------- */
BusSchema.pre("validate", function (next) {
    if (this.seatLayout && (!this.totalSeats || this.totalSeats !== this.seatLayout)) {
        this.totalSeats = this.seatLayout;
    }

    if (this.tripType === "ONE_WAY") {
        this.returnTrip = null;
    }

    if (this.cabinSeatCount > 10) {
        this.cabinSeatCount = 10;
    }

    if (Array.isArray(this.cabinSeats) && this.cabinSeats.length > 10) {
        this.cabinSeats = this.cabinSeats.slice(0, 10);
    }

    next();
});

BusSchema.index({ busNumber: 1 }, { unique: true });
BusSchema.index({ status: 1, busType: 1, seatLayout: 1 });
BusSchema.index({ routeName: 1, routeCode: 1 });

export default mongoose.models.Bus || mongoose.model("Bus", BusSchema);