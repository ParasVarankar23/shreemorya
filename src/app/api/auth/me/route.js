import connectDB from "@/lib/mongodb";
import User from "@/models/User.model";
import { getAuthUserFromRequest } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(authUser.userId).select("_id fullName email phoneNumber role isGuest authProvider profileImage").lean();

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { user } }, { status: 200 });
    } catch (error) {
        console.error("GET /api/auth/me error:", error);
        return NextResponse.json({ success: false, message: error.message || "Failed to fetch user" }, { status: 500 });
    }
}
