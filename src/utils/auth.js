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
    return jwt.sign(
        {
            userId: user._id || user.id,
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            role: user.role,
            isGuest: user.isGuest || false,
            authProvider: user.authProvider || "local",
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRATION || "7d",
        }
    );
}

export function generateRefreshToken(user) {
    return jwt.sign(
        {
            userId: user._id || user.id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "30d",
        }
    );
}

// Extract authenticated user payload from Bearer token in Next.js Request
// Returns null if missing/invalid. Does NOT hit the database; relies on JWT payload.
export function getAuthUserFromRequest(request) {
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

        return decoded;
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
