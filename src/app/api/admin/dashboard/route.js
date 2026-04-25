import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model.model";
import Payment from "@/models/payment.model";
import Schedule from "@/models/schedule.model";
import Voucher from "@/models/voucher.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json({ success: false, message: "Forbidden: Admin/Staff only" }, { status: 403 });
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [
            totalBookings,
            todayBookings,
            totalRevenueAgg,
            todayRevenueAgg,
            activeSchedules,
            pendingPayments,
            activeVouchers,
            cancelledBookings,
        ] = await Promise.all([
            Booking.countDocuments({ isActive: true }),
            Booking.countDocuments({
                isActive: true,
                createdAt: { $gte: todayStart, $lte: todayEnd },
            }),
            Payment.aggregate([
                { $match: { isActive: true, paymentStatus: "CAPTURED" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            Payment.aggregate([
                {
                    $match: {
                        isActive: true,
                        paymentStatus: "CAPTURED",
                        createdAt: { $gte: todayStart, $lte: todayEnd },
                    },
                },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            Schedule.countDocuments({
                isActive: true,
                status: "SCHEDULED",
                travelDate: { $gte: todayStart },
            }),
            Booking.countDocuments({
                isActive: true,
                paymentStatus: { $in: ["UNPAID", "PARTIAL"] },
                bookingStatus: { $ne: "CANCELLED" },
            }),
            Voucher.countDocuments({
                isActive: true,
                status: "ACTIVE",
            }),
            Booking.countDocuments({
                isActive: true,
                bookingStatus: "CANCELLED",
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: "Dashboard stats fetched successfully",
            data: {
                totalBookings,
                todayBookings,
                totalRevenue: totalRevenueAgg[0]?.total || 0,
                todayRevenue: todayRevenueAgg[0]?.total || 0,
                activeSchedules,
                pendingPayments,
                activeVouchers,
                cancelledBookings,
            },
        });
    } catch (error) {
        console.error("GET /api/admin/dashboard error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch dashboard stats" }, { status: 500 });
    }
}