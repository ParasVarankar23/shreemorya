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
