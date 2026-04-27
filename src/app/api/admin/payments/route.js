import connectDB from "@/lib/mongodb";
import Payment from "@/models/payment.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin/Staff only" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search") || "";
        const bookingId = searchParams.get("bookingId") || "";
        const paymentStatus = searchParams.get("paymentStatus") || "";
        const paymentMethod = searchParams.get("paymentMethod") || "";
        const transactionType = searchParams.get("transactionType") || "";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const from = searchParams.get("from") || "";
        const to = searchParams.get("to") || "";

        const query = { isActive: true };

        // date range filtering on createdAt
        if (from || to) {
            query.createdAt = {};
            if (from) {
                const d = new Date(from);
                if (!isNaN(d)) query.createdAt.$gte = d;
            }
            if (to) {
                const d = new Date(to);
                if (!isNaN(d)) query.createdAt.$lte = d;
            }
            // if createdAt ended up empty, delete
            if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
        }

        if (bookingId) query.bookingId = bookingId;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (paymentMethod) query.paymentMethod = paymentMethod;
        if (transactionType) query.transactionType = transactionType;

        if (search) {
            query.$or = [
                { gatewayOrderId: { $regex: search, $options: "i" } },
                { gatewayPaymentId: { $regex: search, $options: "i" } },
                { gatewaySignature: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;

        const [payments, total] = await Promise.all([
            Payment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Payment.countDocuments(query),
        ]);

        // Aggregates: totals and breakdowns
        const aggMatch = { ...query };

        const totalsAgg = await Payment.aggregate([
            { $match: aggMatch },
            {
                $group: {
                    _id: null,
                    totalFinal: { $sum: { $ifNull: ["$finalPayableAmount", 0] } },
                    totalRefunded: { $sum: { $ifNull: ["$refundAmount", 0] } },
                    totalSettlement: { $sum: { $ifNull: ["$settlementAmount", 0] } },
                    paidCount: { $sum: { $cond: [{ $eq: ["$paymentStatus", "PAID"] }, 1, 0] } },
                    totalCount: { $sum: 1 },
                },
            },
        ]);

        // Normalize provider key: prefer explicit `provider`, else map offline paymentMethod to readable keys
        const byProvider = await Payment.aggregate([
            { $match: aggMatch },
            {
                $addFields: {
                    providerKey: {
                        $switch: {
                            branches: [
                                { case: { $in: ["$paymentMethod", ["OFFLINE_CASH", "CASH"]] }, then: "CASH" },
                                { case: { $in: ["$paymentMethod", ["OFFLINE_UPI", "UPI"]] }, then: "UPI" },
                            ],
                            default: { $ifNull: ["$provider", "$paymentMethod"] },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: { provider: "$providerKey" },
                    total: { $sum: { $ifNull: ["$finalPayableAmount", 0] } },
                    count: { $sum: 1 },
                },
            },
        ]);

        // cancelled bookings count within same date range
        let cancelledBookings = 0;
        try {
            const Booking = (await import("@/models/booking.model")).default;
            const bQuery = { bookingStatus: "CANCELLED" };
            if (from || to) {
                bQuery.cancelledAt = {};
                if (from) {
                    const d = new Date(from);
                    if (!isNaN(d)) bQuery.cancelledAt.$gte = d;
                }
                if (to) {
                    const d = new Date(to);
                    if (!isNaN(d)) bQuery.cancelledAt.$lte = d;
                }
                if (Object.keys(bQuery.cancelledAt).length === 0) delete bQuery.cancelledAt;
            }

            cancelledBookings = await Booking.countDocuments(bQuery);
        } catch (e) {
            console.warn("Failed to compute cancelled bookings:", e);
        }

        const totals = (totalsAgg && totalsAgg[0]) || {
            totalFinal: 0,
            totalRefunded: 0,
            totalSettlement: 0,
            paidCount: 0,
            totalCount: 0,
        };

        return NextResponse.json({
            success: true,
            message: "Payments fetched successfully",
            data: payments,
            aggregates: {
                totalFinal: totals.totalFinal || 0,
                totalRefunded: totals.totalRefunded || 0,
                totalSettlement: totals.totalSettlement || 0,
                netRevenue: (totals.totalFinal || 0) - ((totals.totalRefunded || 0) + (totals.totalSettlement || 0)),
                paidCount: totals.paidCount || 0,
                totalCount: totals.totalCount || 0,
                byProvider: byProvider.map((b) => ({ provider: b._id.provider, total: b.total || 0, count: b.count || 0 })),
                cancelledBookings,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/admin/payments error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch payments" },
            { status: 500 }
        );
    }
}