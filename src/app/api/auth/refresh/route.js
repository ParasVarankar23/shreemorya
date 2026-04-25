import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import { createSessionId, generateAccessToken, generateRefreshToken } from "@/utils/auth";
import jwt from "jsonwebtoken";

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));

        const refreshTokenFromBody = String(body?.refreshToken || "").trim();
        const refreshTokenFromCookie = request.cookies.get("refreshToken")?.value || "";
        const refreshToken = refreshTokenFromBody || refreshTokenFromCookie;

        if (!refreshToken) {
            return Response.json(
                { success: false, message: "Refresh token is required" },
                { status: 401 }
            );
        }

        let decoded;

        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch {
            return Response.json(
                { success: false, message: "Invalid or expired refresh token" },
                { status: 401 }
            );
        }

        if (!decoded?.userId) {
            return Response.json(
                { success: false, message: "Invalid refresh token payload" },
                { status: 401 }
            );
        }

        let tokenUser;

        if (String(decoded.userId) === "guest-user") {
            tokenUser = {
                id: "guest-user",
                role: "guest",
                isGuest: true,
                authProvider: "guest",
            };
        } else {
            await connectDB();

            const user = await User.findById(decoded.userId)
                .select("_id role isGuest authProvider")
                .lean();

            if (!user) {
                return Response.json(
                    { success: false, message: "User not found" },
                    { status: 401 }
                );
            }

            tokenUser = {
                id: String(user._id),
                role: user.role,
                isGuest: Boolean(user.isGuest),
                authProvider: user.authProvider || "local",
            };
        }

        const nextSessionId = decoded.sid || createSessionId();
        const nextAccessToken = generateAccessToken({ ...tokenUser, sessionId: nextSessionId });
        const nextRefreshToken = generateRefreshToken(tokenUser, nextSessionId);

        return Response.json(
            {
                success: true,
                message: "Token refreshed successfully",
                accessToken: nextAccessToken,
                refreshToken: nextRefreshToken,
                data: {
                    accessToken: nextAccessToken,
                    refreshToken: nextRefreshToken,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            {
                success: false,
                message: "Failed to refresh token",
                error: error?.message || null,
            },
            { status: 500 }
        );
    }
}