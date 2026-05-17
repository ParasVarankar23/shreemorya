import mongoose from "mongoose";

/* =====================================================
   FARE SCHEMA
===================================================== */

const FareSchema = new mongoose.Schema(
    {
        /* =====================================================
           BUS / ROUTE SNAPSHOT
        ===================================================== */

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

        /* =====================================================
           PICKUP POINT SNAPSHOT
        ===================================================== */

        pickupPointName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        pickupPointOrder: {
            type: Number,
            required: false,
            default: null,
            min: 1,
        },

        pickupPointTime: {
            type: String,
            default: "",
            trim: true,
        },

        /* =====================================================
           DROP POINT SNAPSHOT
        ===================================================== */

        dropPointName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        dropPointOrder: {
            type: Number,
            required: false,
            default: null,
            min: 1,
        },

        dropPointTime: {
            type: String,
            default: "",
            trim: true,
        },

        /* =====================================================
           FARE DETAILS
        ===================================================== */

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

        /* =====================================================
           BULK / GROUP TRACKING
        ===================================================== */

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

        /* =====================================================
           OPTIONAL LABELS
        ===================================================== */

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

        /* =====================================================
           STATUS
        ===================================================== */

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

        /* =====================================================
           AUDIT FIELDS
        ===================================================== */

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

/* =====================================================
   INDEXES
===================================================== */

FareSchema.index({
    busId: 1,
    tripDirection: 1,
    validFrom: 1,
    validTill: 1,
    status: 1,
    isActive: 1,
});

FareSchema.index({
    routeName: 1,
    tripDirection: 1,
    pickupPointName: 1,
    dropPointName: 1,
    validFrom: 1,
    validTill: 1,
});

FareSchema.index({
    parentRuleGroupId: 1,
});

/* =====================================================
   AUTO EXPIRE MIDDLEWARE
===================================================== */

FareSchema.pre("save", function () {
    const now = new Date();

    if (
        this.validTill &&
        this.validTill < now &&
        this.status !== "INACTIVE"
    ) {
        this.status = "EXPIRED";
    }
});

/* =====================================================
   SAFE MODEL EXPORT
===================================================== */

const Fare =
    mongoose.models.Fare ||
    mongoose.model("Fare", FareSchema);

export default Fare;