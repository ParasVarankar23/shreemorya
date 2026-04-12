import mongoose from "mongoose";

const FareSchema = new mongoose.Schema(
    {
        /* ------------------------------------------
           Bus / Route Snapshot
        ------------------------------------------- */
        busId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            required: true,
            index: true,
        },

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

        /* ------------------------------------------
           Pickup Point Snapshot
        ------------------------------------------- */
        pickupPointName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        pickupPointOrder: {
            type: Number,
            required: true,
            min: 1,
            index: true,
        },

        pickupPointTime: {
            type: String,
            default: "",
            trim: true,
        },

        /* ------------------------------------------
           Drop Point Snapshot
        ------------------------------------------- */
        dropPointName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        dropPointOrder: {
            type: Number,
            required: true,
            min: 1,
            index: true,
        },

        dropPointTime: {
            type: String,
            default: "",
            trim: true,
        },

        /* ------------------------------------------
           Fare Details
        ------------------------------------------- */
        fareAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        fareType: {
            type: String,
            enum: ["REGULAR", "SEASONAL", "SPECIAL"],
            default: "REGULAR",
            index: true,
        },

        validFrom: {
            type: Date,
            required: true,
            index: true,
        },

        validTill: {
            type: Date,
            required: true,
            index: true,
        },

        /* ------------------------------------------
           Grouping / Bulk Create Tracking
           Example:
           Admin creates one UI rule and system creates
           multiple exact pair rows
        ------------------------------------------- */
        applyNextPickups: {
            type: Boolean,
            default: false,
        },

        applyNextDrops: {
            type: Boolean,
            default: false,
        },

        parentRuleGroupId: {
            type: String,
            default: "",
            trim: true,
            index: true,
        },

        /* ------------------------------------------
           Optional Labels
        ------------------------------------------- */
        label: {
            type: String,
            default: "",
            trim: true,
        },

        reason: {
            type: String,
            default: "",
            trim: true,
        },

        /* ------------------------------------------
           Status
        ------------------------------------------- */
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "EXPIRED"],
            default: "ACTIVE",
            index: true,
        },

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
   Compound Indexes
------------------------------------------- */

// Fast search for fare lookup during booking
FareSchema.index({
    busId: 1,
    tripDirection: 1,
    pickupPointOrder: 1,
    dropPointOrder: 1,
    validFrom: 1,
    validTill: 1,
    status: 1,
    isActive: 1,
});

// Search by route + pickup/drop names
FareSchema.index({
    routeName: 1,
    tripDirection: 1,
    pickupPointName: 1,
    dropPointName: 1,
    validFrom: 1,
    validTill: 1,
});

// Group-based operations
FareSchema.index({
    parentRuleGroupId: 1,
});

// Optional auto-expire flag update before save
FareSchema.pre("save", function () {
    const now = new Date();

    if (this.validTill && this.validTill < now && this.status !== "INACTIVE") {
        this.status = "EXPIRED";
    }
});

export default mongoose.models.Fare || mongoose.model("Fare", FareSchema);