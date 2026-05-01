import {
    sendPasswordResetOtpEmail,
    sendPasswordResetSuccessEmail,
} from "@/lib/emailService";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import Staff from "@/models/staff.model";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import bcrypt from "bcryptjs";

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();
        let { step, email, otp, newPassword, confirmPassword } = body;

        step = String(step || "").trim();
        email = String(email || "").trim().toLowerCase();
        otp = String(otp || "").trim();
        newPassword = String(newPassword || "").trim();
        confirmPassword = String(confirmPassword || "").trim();

        // ==========================================
        // STEP 1: SEND OTP
        // ==========================================
        if (step === "send-otp") {
            if (!email) {
                return errorResponse("Email is required", 400);
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return errorResponse("Please enter a valid email address", 400);
            }

            // Try User then Staff
            let user = await User.findOne({ email });
            let isStaff = false;

            if (!user) {
                user = await Staff.findOne({ email });
                if (user) isStaff = true;
            }

            if (!user) {
                return errorResponse("No account found with this email", 404);
            }

            if (!isStaff && user.isGuest) {
                return errorResponse("Guest users cannot reset password", 400);
            }

            if (!user.email) {
                return errorResponse("This account does not have a valid email", 400);
            }

            const generatedOtp = generateOtp();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            user.resetOtp = generatedOtp;
            user.resetOtpExpires = otpExpiry;
            await user.save();

            await sendPasswordResetOtpEmail({
                to: user.email,
                fullName: user.fullName,
                otp: generatedOtp,
            });

            return successResponse(
                {
                    email: user.email,
                    nextStep: "verify-otp",
                },
                "OTP sent successfully to your email",
                200
            );
        }

        // ==========================================
        // STEP 2: VERIFY OTP
        // ==========================================
        if (step === "verify-otp") {
            if (!email || !otp) {
                return errorResponse("Email and OTP are required", 400);
            }

            // Try User then Staff
            let user = await User.findOne({ email });
            let isStaff = false;

            if (!user) {
                user = await Staff.findOne({ email });
                if (user) isStaff = true;
            }

            if (!user) {
                return errorResponse("No account found with this email", 404);
            }

            if (!user.resetOtp || !user.resetOtpExpires) {
                return errorResponse("OTP not found. Please request a new OTP", 400);
            }

            if (user.resetOtp !== otp) {
                return errorResponse("Invalid OTP", 400);
            }

            if (new Date() > new Date(user.resetOtpExpires)) {
                return errorResponse("OTP has expired. Please request a new OTP", 400);
            }

            return successResponse(
                {
                    email: user.email,
                    nextStep: "reset-password",
                },
                "OTP verified successfully",
                200
            );
        }

        // ==========================================
        // STEP 3: RESET PASSWORD
        // ==========================================
        if (step === "reset-password") {
            if (!email || !otp || !newPassword || !confirmPassword) {
                return errorResponse(
                    "Email, OTP, new password and confirm password are required",
                    400
                );
            }

            if (newPassword !== confirmPassword) {
                return errorResponse("New password and confirm password do not match", 400);
            }

            if (newPassword.length < 6) {
                return errorResponse("Password must be at least 6 characters long", 400);
            }

            // Try User then Staff
            let user = await User.findOne({ email });
            let isStaff = false;

            if (!user) {
                user = await Staff.findOne({ email });
                if (user) isStaff = true;
            }

            if (!user) {
                return errorResponse("No account found with this email", 404);
            }

            if (!isStaff && user.isGuest) {
                return errorResponse("Guest users cannot reset password", 400);
            }

            if (!user.resetOtp || !user.resetOtpExpires) {
                return errorResponse("OTP not found. Please request a new OTP", 400);
            }

            if (user.resetOtp !== otp) {
                return errorResponse("Invalid OTP", 400);
            }

            if (new Date() > new Date(user.resetOtpExpires)) {
                return errorResponse("OTP has expired. Please request a new OTP", 400);
            }

            // Prevent same password (optional but recommended)
            if (user.password) {
                const isSamePassword = await bcrypt.compare(newPassword, user.password);
                if (isSamePassword) {
                    return errorResponse(
                        "New password cannot be the same as your old password",
                        400
                    );
                }
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            user.password = hashedPassword;
            user.resetOtp = null;
            user.resetOtpExpires = null;
            if (!isStaff) {
                user.authProvider = "local";
            }

            await user.save();

            // Send success email
            await sendPasswordResetSuccessEmail({
                to: user.email,
                fullName: user.fullName,
            });

            return successResponse(
                {
                    email: user.email,
                    nextStep: "done",
                },
                "Password reset successful",
                200
            );
        }

        return errorResponse(
            "Invalid step. Use send-otp, verify-otp, or reset-password",
            400
        );
    } catch (error) {
        console.error("Forgot Password API Error:", error);
        return errorResponse(
            "Failed to process forgot password request",
            500,
            error.message
        );
    }
}