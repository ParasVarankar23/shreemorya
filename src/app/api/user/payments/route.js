import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Payment from "@/models/payment.model";
import User from "@/models/User.model";
import { getAuthUserFromRequest } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);
        if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        // Load user details for phone/email
        const user = await User.findById(authUser.userId).lean();

        const query = { isActive: true };

        // Prefer payments explicitly tied to userId
        const orConditions = [];
        if (authUser.userId) {
            orConditions.push({ userId: authUser.userId });
        }

        // Also include payments linked to bookings created with user's phone/email
        if (user) {
            if (user.phoneNumber) {
                const bookingsByPhone = await Booking.find({ customerPhone: String(user.phoneNumber).trim() }).select("_id").lean();
                const ids = bookingsByPhone.map((b) => b._id).filter(Boolean);
                if (ids.length) orConditions.push({ bookingId: { $in: ids } });
            }
            if (user.email) {
                const bookingsByEmail = await Booking.find({ customerEmail: String(user.email).trim().toLowerCase() }).select("_id").lean();
                const ids = bookingsByEmail.map((b) => b._id).filter(Boolean);
                if (ids.length) orConditions.push({ bookingId: { $in: ids } });
            }
        }

        if (orConditions.length) query.$or = orConditions;

        const payments = await Payment.find(query).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ success: true, data: payments });
    } catch (error) {
        console.error("GET /api/user/payments error:", error);
        return NextResponse.json({ success: false, message: error.message || "Failed to fetch payments" }, { status: 500 });
    }
}
