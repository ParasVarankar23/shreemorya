import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/payment.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";

export async function GET(request) {
    try {
        await connectDB();

        const authUser = getAuthUserFromRequest(request);

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

        const query = { isActive: true };

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

        return NextResponse.json({
            success: true,
            message: "Payments fetched successfully",
            data: payments,
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