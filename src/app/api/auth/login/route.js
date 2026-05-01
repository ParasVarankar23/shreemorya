import { sendLoginEmail } from "@/lib/emailService";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import Staff from "@/models/staff.model";
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

        let user = null;
        let staff = null;

        if (isEmail) {
            const q = { email: emailOrPhone.toLowerCase() };
            user = await User.findOne(q);
            if (!user) staff = await Staff.findOne(q);
        } else {
            // Phone lookup: try raw, digits-only, and last 10 digits
            const rawPhone = emailOrPhone;
            const digits = rawPhone.replace(/\D/g, "");
            const candidates = [rawPhone];
            if (digits && digits !== rawPhone) candidates.push(digits);
            if (digits.length > 10) candidates.push(digits.slice(-10));

            for (const ph of candidates) {
                if (!user) user = await User.findOne({ phoneNumber: ph });
                if (!staff) staff = await Staff.findOne({ phoneNumber: ph });
                if (user || staff) break;
            }
        }

        const account = user || staff;

        if (!account) {
            console.warn("Login failed: account not found", { emailOrPhone });
            return errorResponse("Invalid credentials", 401);
        }

        if (!account.password) {
            return errorResponse("This account does not have a password. Please use Google login.", 400);
        }

        const isMatch = await bcrypt.compare(password, account.password);

        if (!isMatch) {
            console.warn("Login failed: password mismatch", { id: String(account._id), email: account.email, phone: account.phoneNumber });
            return errorResponse("Invalid credentials", 401);
        }

        const sessionId = createSessionId();
        const accessToken = generateAccessToken({ ...(account.toObject ? account.toObject() : account), sessionId });
        const refreshToken = generateRefreshToken(account, sessionId);

        try {

            const recipientEmail = account.email || (isEmail ? emailOrPhone.toLowerCase() : "");

            if (recipientEmail) {
                await sendLoginEmail({
                    to: recipientEmail,
                    fullName: account.fullName,
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
                    id: account._id,
                    fullName: account.fullName,
                    email: account.email,
                    phoneNumber: account.phoneNumber,
                    role: account.role,
                    isGuest: account.isGuest || false,
                    authProvider: account.authProvider || "local",
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