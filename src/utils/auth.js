import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import jwt from "jsonwebtoken";

export function generateRandomPassword(fullName = "User") {
    const safeName = String(fullName || "User").trim();

    // Take first name only
    const firstName = safeName
        .split(" ")[0]
        .replace(/[^a-zA-Z]/g, "") || "User";

    // Capitalize first letter
    const cleanName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    // 4 random digits
    const randomNumbers = Math.floor(1000 + Math.random() * 9000);

    // 1 random special character
    const specialChars = "!@#$%";
    const randomSpecial =
        specialChars[Math.floor(Math.random() * specialChars.length)];

    // Example: Paras2341@
    return `${cleanName}${randomNumbers}${randomSpecial}`;
}

export function generateAccessToken(user) {
    const sessionId = user?.sessionId || user?.sid || createSessionId();

    return jwt.sign(
        {
            userId: user._id || user.id,
            sid: sessionId,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRATION || "7d",
        }
    );
}

export function generateRefreshToken(user, sessionIdInput) {
    const sessionId = sessionIdInput || user?.sessionId || user?.sid || createSessionId();

    return jwt.sign(
        {
            userId: user._id || user.id,
            sid: sessionId,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "30d",
        }
    );
}

export function createSessionId() {
    try {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }
    } catch {
        // Fallback handled below
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Extract authenticated user payload from Bearer token in Next.js Request
// Returns null if missing/invalid.
// Resolves authorization fields from database so JWT can stay minimal.
export async function getAuthUserFromRequest(request) {
    try {
        const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.userId) {
            return null;
        }

        await connectDB();

        const user = await User.findById(decoded.userId)
            .select("_id role isGuest authProvider")
            .lean();

        if (!user) {
            return null;
        }

        return {
            userId: String(user._id),
            role: user.role,
            isGuest: Boolean(user.isGuest),
            authProvider: user.authProvider || "local",
            sid: decoded.sid || null,
        };
    } catch (error) {
        return null;
    }
}

// Check if user role is in allowed roles
export function hasRole(user, allowedRoles = []) {
    if (!user || !user.role || !Array.isArray(allowedRoles) || allowedRoles.length === 0) {
        return false;
    }

    return allowedRoles.includes(user.role);
}
