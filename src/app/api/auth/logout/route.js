import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function POST() {
    try {
        return successResponse(
            {},
            "Logout successful",
            200
        );
    } catch (error) {
        console.error("Logout API Error:", error);
        return errorResponse("Failed to logout", 500, error.message);
    }
}