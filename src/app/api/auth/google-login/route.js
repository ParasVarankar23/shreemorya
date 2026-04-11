import { OAuth2Client } from "google-auth-library";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { generateAccessToken, generateRefreshToken } from "@/utils/auth";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();
        const { credential } = body;

        if (!credential) {
            return errorResponse("Google credential token is required", 400);
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return errorResponse("Invalid Google token payload", 401);
        }

        const googleId = payload.sub;
        const email = payload.email?.toLowerCase()?.trim();
        const fullName = payload.name || "Google User";
        const profilePicture = payload.picture || "";
        const emailVerified = payload.email_verified || false;

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
                phoneNumber: "",
                password: "",
                authProvider: "google",
                googleId,
                profilePicture,
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

            if (!user.profilePicture && profilePicture) {
                user.profilePicture = profilePicture;
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
                    profilePicture: user.profilePicture,
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