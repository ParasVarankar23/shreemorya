import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import Staff from "@/models/staff.model";
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

            // Try User then Staff
            let user = await User.findById(decoded.userId)
                .select("_id role isGuest authProvider sessionId")
                .lean();

            let isStaff = false;
            let staff = null;

            if (!user) {
                staff = await Staff.findById(decoded.userId)
                    .select("_id role authProvider sessionId")
                    .lean();
                if (staff) isStaff = true;
            }

            if (!user && !staff) {
                return Response.json(
                    { success: false, message: "User not found" },
                    { status: 401 }
                );
            }

            // Optional strict session validation for User (Staff may not have sessionId)
            if (user && user.sessionId && decoded.sid && user.sessionId !== decoded.sid) {
                return Response.json(
                    { success: false, message: "Session expired. Please login again." },
                    { status: 401 }
                );
            }

            const effective = user || staff;

            tokenUser = {
                id: String(effective._id),
                role: effective.role,
                isGuest: Boolean(effective.isGuest),
                authProvider: effective.authProvider || "local",
                sessionId: effective.sessionId || decoded.sid || "",
            };
        }

        const nextSessionId = tokenUser.sessionId || decoded.sid || createSessionId();
        const nextAccessToken = generateAccessToken({ ...tokenUser, sessionId: nextSessionId });
        const nextRefreshToken = generateRefreshToken(tokenUser, nextSessionId);

        // Save sessionId back to DB for non-guest
        if (String(decoded.userId) !== "guest-user") {
            await connectDB();
            // Update sessionId for User or Staff if possible
            const existingUser = await User.findById(decoded.userId).select("_id");
            if (existingUser) {
                await User.findByIdAndUpdate(decoded.userId, { sessionId: nextSessionId });
            } else {
                // Try update Staff (may persist if schema allows)
                const existingStaff = await Staff.findById(decoded.userId).select("_id");
                if (existingStaff) {
                    await Staff.findByIdAndUpdate(decoded.userId, { sessionId: nextSessionId });
                }
            }
        }

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