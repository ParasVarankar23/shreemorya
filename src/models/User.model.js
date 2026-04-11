import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
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
            default: null,
            unique: true,
            sparse: true,
        },

        phoneNumber: {
            type: String,
            trim: true,
            default: null,
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

        role: {
            type: String,
            enum: ["user", "guest", "admin", "staff"],
            default: "user",
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
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);