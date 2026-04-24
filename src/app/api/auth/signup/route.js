import { sendWelcomePasswordEmail } from "@/lib/emailService";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import {
    createSessionId,
    generateAccessToken,
    generateRandomPassword,
    generateRefreshToken,
} from "@/utils/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();
        let { fullName, email, phoneNumber } = body;

        fullName = String(fullName || "").trim();
        email = String(email || "").trim().toLowerCase();
        phoneNumber = String(phoneNumber || "").trim();

        if (!fullName || !email || !phoneNumber) {
            return errorResponse("Full name, email and phone number are required", 400);
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { phoneNumber }],
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return errorResponse("User already exists with this email", 409);
            }
            if (existingUser.phoneNumber === phoneNumber) {
                return errorResponse("User already exists with this phone number", 409);
            }
            return errorResponse("User already exists", 409);
        }

        const plainPassword = generateRandomPassword(fullName);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const user = await User.create({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            authProvider: "local",
            role: "user",
            isGuest: false,
        });

        await sendWelcomePasswordEmail({
            to: email,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            password: plainPassword,
        });

        const sessionId = createSessionId();
        const accessToken = generateAccessToken({ ...user.toObject(), sessionId });
        const refreshToken = generateRefreshToken(user, sessionId);

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
            "Signup successful. Password has been sent to email.",
            201
        );
    } catch (error) {
        console.error("Signup API Error:", error);
        return errorResponse("Failed to signup", 500, error.message);
    }
}