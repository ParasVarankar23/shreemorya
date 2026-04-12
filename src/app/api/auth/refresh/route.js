import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET =
    process.env.ACCESS_TOKEN_SECRET || "your_access_secret_here";

const REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || "your_refresh_secret_here";

export function signAccessToken(user) {
    return jwt.sign(
        {
            userId: String(user._id),
            email: user.email,
            role: user.role,
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
}

export function signRefreshToken(user) {
    return jwt.sign(
        {
            userId: String(user._id),
            email: user.email,
            role: user.role,
        },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
}

export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch {
        return null;
    }
}

export function getAccessTokenFromRequest(request) {
    const authHeader = request.headers.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }

    const cookieToken = request.cookies.get("accessToken")?.value;
    if (cookieToken) return cookieToken;

    return null;
}