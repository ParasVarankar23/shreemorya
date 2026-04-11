import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { generateAccessToken, generateRefreshToken } from "@/utils/auth";

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

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

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