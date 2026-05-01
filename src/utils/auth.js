import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import Staff from "@/models/staff.model";
import jwt from "jsonwebtoken";

export function generateRandomPassword(fullName = "User") {
    const safeName = String(fullName || "User").trim();

    const firstName =
        safeName.split(" ")[0].replace(/[^a-zA-Z]/g, "") || "User";

    const cleanName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    const randomNumbers = Math.floor(1000 + Math.random() * 9000);

    const specialChars = "!@#$%";
    const randomSpecial =
        specialChars[Math.floor(Math.random() * specialChars.length)];

    return `${cleanName}${randomNumbers}${randomSpecial}`;
}

export function createSessionId() {
    try {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }
    } catch { }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function generateAccessToken(user) {
    const sessionId = user?.sessionId || user?.sid || createSessionId();

    return jwt.sign(
        {
            userId: user?._id || user?.id,
            sid: sessionId,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRATION || "7d",
        }
    );
}

export function generateRefreshToken(user, sessionIdInput) {
    const sessionId =
        sessionIdInput || user?.sessionId || user?.sid || createSessionId();

    return jwt.sign(
        {
            userId: user?._id || user?.id,
            sid: sessionId,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "30d",
        }
    );
}

export async function getAuthUserFromRequest(request) {
    try {
        const authHeader =
            request.headers.get("authorization") ||
            request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.split(" ")[1];
        if (!token) return null;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.userId) {
            return null;
        }

        await connectDB();

        // Try User first, then Staff as a fallback
        let user = await User.findById(decoded.userId)
            .select("_id role isGuest authProvider")
            .lean();

        if (!user) {
            const staff = await Staff.findById(decoded.userId)
                .select("_id role authProvider")
                .lean();

            if (!staff) return null;

            return {
                userId: String(staff._id),
                role: staff.role,
                isGuest: false,
                authProvider: staff.authProvider || "local",
                sid: decoded.sid || null,
            };
        }

        return {
            userId: String(user._id),
            role: user.role,
            isGuest: Boolean(user.isGuest),
            authProvider: user.authProvider || "local",
            sid: decoded.sid || null,
        };
    } catch {
        return null;
    }
}

export function hasRole(user, allowedRoles = []) {
    if (
        !user ||
        !user.role ||
        !Array.isArray(allowedRoles) ||
        allowedRoles.length === 0
    ) {
        return false;
    }

    return allowedRoles.includes(user.role);
}

export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
        return null;
    }
}