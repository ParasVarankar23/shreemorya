import { errorResponse, successResponse } from "@/utils/apiResponse";
import {
    createSessionId,
    generateAccessToken,
    generateRefreshToken,
} from "@/utils/auth";

export async function POST() {
    try {
        const guestUser = {
            id: "guest-user",
            fullName: "Guest User",
            email: "",
            phoneNumber: "",
            role: "guest",
            isGuest: true,
            authProvider: "guest",
        };

        const sessionId = createSessionId();
        const accessToken = generateAccessToken({ ...guestUser, sessionId });
        const refreshToken = generateRefreshToken(guestUser, sessionId);

        return successResponse(
            {
                user: guestUser,
                accessToken,
                refreshToken,
            },
            "Guest login successful",
            200
        );
    } catch (error) {
        console.error("Guest Login API Error:", error);
        return errorResponse("Failed to login as guest", 500, error.message);
    }
}