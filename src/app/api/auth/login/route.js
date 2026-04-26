import { sendLoginEmail } from "@/lib/emailService";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import {
    createSessionId,
    generateAccessToken,
    generateRefreshToken,
} from "@/utils/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();
        let { emailOrPhone, password } = body;

        emailOrPhone = String(emailOrPhone || "").trim();
        password = String(password || "").trim();

        if (!emailOrPhone || !password) {
            return errorResponse("Email/Phone and password are required", 400);
        }

        const isEmail = emailOrPhone.includes("@");

        const user = await User.findOne(
            isEmail
                ? { email: emailOrPhone.toLowerCase() }
                : { phoneNumber: emailOrPhone }
        );

        if (!user) {
            return errorResponse("Invalid credentials", 401);
        }

        if (!user.password) {
            return errorResponse("This account does not have a password. Please use Google login.", 400);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return errorResponse("Invalid credentials", 401);
        }

        const sessionId = createSessionId();
        const accessToken = generateAccessToken({ ...user.toObject(), sessionId });
        const refreshToken = generateRefreshToken(user, sessionId);

        try {
            const recipientEmail = user.email || (isEmail ? emailOrPhone.toLowerCase() : "");

            if (recipientEmail) {
                await sendLoginEmail({
                    to: recipientEmail,
                    fullName: user.fullName,
                    loginTime: new Date(),
                    loginMethod: "Password",
                    ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
                });
            }
        } catch (mailError) {
            console.warn("LOGIN_EMAIL_ERROR:", mailError.message);
        }

        return successResponse(
            {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    isGuest: user.isGuest,
                    authProvider: user.authProvider,
                },
                accessToken,
                refreshToken,
            },
            "Login successful",
            200
        );
    } catch (error) {
        console.error("Login API Error:", error);
        return errorResponse("Failed to login", 500, error.message);
    }
}