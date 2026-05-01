import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import User from "@/models/User.model";
import { getAuthUserFromRequest } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);
        if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const user = await User.findById(authUser.userId).lean();
        if (!user) return NextResponse.json({ success: true, data: [] });

        const phone = (user.phoneNumber || "").toString().trim();
        const email = (user.email || "").toString().trim().toLowerCase();

        const query = { $or: [] };
        if (phone) query.$or.push({ customerPhone: phone });
        if (email) query.$or.push({ customerEmail: email });

        if (query.$or.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ success: true, data: bookings });
    } catch (error) {
        console.error("GET /api/user/bookings error:", error);
        return NextResponse.json({ success: false, message: error.message || "Failed to fetch bookings" }, { status: 500 });
    }
}
