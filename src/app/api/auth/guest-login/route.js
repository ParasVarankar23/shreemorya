import { successResponse, errorResponse } from "@/utils/apiResponse";
import { generateAccessToken, generateRefreshToken } from "@/utils/auth";

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

        const accessToken = generateAccessToken(guestUser);
        const refreshToken = generateRefreshToken(guestUser);

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