import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import {
    createSessionId,
    generateAccessToken,
    generateRefreshToken,
} from "@/utils/auth";
import { OAuth2Client } from "google-auth-library";

export async function POST(req) {
    try {
        await connectDB();

        const googleClientId =
            process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!googleClientId) {
            return errorResponse("Google login is not configured on server", 500);
        }

        const client = new OAuth2Client(googleClientId);

        const body = await req.json();
        const { credential } = body;

        if (!credential) {
            return errorResponse("Google credential token is required", 400);
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: googleClientId,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return errorResponse("Invalid Google token payload", 401);
        }

        const googleId = payload.sub;
        const email = String(payload.email || "").toLowerCase().trim();
        const fullName = payload.name || "Google User";
        const profileImage = payload.picture || "";
        const emailVerified = payload.email_verified || false;

        // Try to extract phone number if Google token includes it.
        // Many ID tokens don't include phone; in that case we leave it undefined
        // so the sparse unique index is not violated.
        const phoneNumber = (payload.phone_number || payload.phone || payload.phoneNumber) ?? undefined;

        if (!email) {
            return errorResponse("Google account email not found", 400);
        }

        let user = await User.findOne({
            $or: [{ googleId }, { email }],
        });

        if (!user) {
            user = await User.create({
                fullName,
                email,
                // only store phone if provided by Google payload
                phoneNumber: phoneNumber,
                password: undefined,
                authProvider: "google",
                googleId,
                profileImage,
                role: "user",
                isGuest: false,
                isVerified: emailVerified,
            });
        } else {
            let needsUpdate = false;

            if (!user.googleId) {
                user.googleId = googleId;
                needsUpdate = true;
            }

            if (user.authProvider !== "google") {
                user.authProvider = "google";
                needsUpdate = true;
            }

            if (!user.profileImage && profileImage) {
                user.profileImage = profileImage;
                needsUpdate = true;
            }

            // If Google provided phone and user doesn't have one, set it.
            if (!user.phoneNumber && phoneNumber) {
                user.phoneNumber = phoneNumber;
                needsUpdate = true;
            }

            // Keep unique sparse index compatibility by omitting empty-string phone values.
            if (user.phoneNumber === "") {
                user.phoneNumber = undefined;
                needsUpdate = true;
            }

            if (!user.isVerified && emailVerified) {
                user.isVerified = true;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await user.save();
            }
        }

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
                    profileImage: user.profileImage,
                },
                accessToken,
                refreshToken,
            },
            "Google login successful",
            200
        );
    } catch (error) {
        console.error("Google Login API Error:", error);
        return errorResponse("Failed to login with Google", 500, error.message);
    }
}