import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function POST(req) {
    try {
        await connectDB();

        // Get token from Authorization header
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return errorResponse("Unauthorized. Token missing.", 401);
        }

        const token = authHeader.split(" ")[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return errorResponse("Invalid or expired token", 401);
        }

        const userId = decoded.userId;

        if (!userId) {
            return errorResponse("Invalid token payload", 401);
        }

        const body = await req.json();

        let { oldPassword, newPassword, confirmPassword } = body;

        oldPassword = String(oldPassword || "").trim();
        newPassword = String(newPassword || "").trim();
        confirmPassword = String(confirmPassword || "").trim();

        // Validate required fields
        if (!oldPassword || !newPassword || !confirmPassword) {
            return errorResponse(
                "Old password, new password and confirm password are required",
                400
            );
        }

        // Check confirm password
        if (newPassword !== confirmPassword) {
            return errorResponse("New password and confirm password do not match", 400);
        }

        // Password length
        if (newPassword.length < 6) {
            return errorResponse("New password must be at least 6 characters long", 400);
        }

        // Prevent same password
        if (oldPassword === newPassword) {
            return errorResponse("New password cannot be the same as old password", 400);
        }

        // Find user by token userId
        const user = await User.findById(userId);

        if (!user) {
            return errorResponse("User not found", 404);
        }

        // Guest user cannot change password
        if (user.isGuest) {
            return errorResponse("Guest users cannot change password", 400);
        }

        // If Google-only account with no password
        if (!user.password) {
            return errorResponse(
                "This account does not have a password. Please use Google login.",
                400
            );
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return errorResponse("Old password is incorrect", 401);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Save new password
        user.password = hashedPassword;
        user.authProvider = "local";

        await user.save();

        return successResponse({}, "Password changed successfully", 200);
    } catch (error) {
        console.error("Change Password API Error:", error);
        return errorResponse("Failed to change password", 500, error.message);
    }
}