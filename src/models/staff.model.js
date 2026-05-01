import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
            unique: true,
        },

        phoneNumber: {
            type: String,
            trim: true,
            default: undefined,
            unique: true,
            sparse: true,
        },

        password: {
            type: String,
            default: null,
        },

        profileImage: {
            type: String,
            default: "",
        },

        profileImagePublicId: {
            type: String,
            default: "",
        },

        gender: {
            type: String,
            enum: ["male", "female", "other", ""],
            default: "",
        },

        dateOfBirth: {
            type: String,
            default: "",
        },

        address: {
            type: String,
            default: "",
            trim: true,
        },

        city: {
            type: String,
            default: "",
            trim: true,
        },

        state: {
            type: String,
            default: "",
            trim: true,
        },

        pincode: {
            type: String,
            default: "",
            trim: true,
        },

        authProvider: {
            type: String,
            enum: ["local", "google", "guest"],
            default: "local",
        },

        googleId: {
            type: String,
            default: null,
        },

        isGuest: {
            type: Boolean,
            default: false,
        },

        resetOtp: {
            type: String,
            default: null,
        },

        resetOtpExpires: {
            type: Date,
            default: null,
        },

        sessionId: {
            type: String,
            default: "",
            index: true,
        },

        position: {
            type: String,
            enum: ["Driver", "Cleaner", "Booking Staff", "Office Staff"],
            default: "Office Staff",
        },

        role: {
            type: String,
            enum: ["staff"],
            default: "staff",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
