import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Voucher from "@/models/voucher.model";
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
        const status = searchParams.get("status") || "";
        const bookingId = searchParams.get("bookingId") || "";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        const query = { isActive: true };

        if (status) query.status = status;
        if (bookingId) query.bookingId = bookingId;

        if (search) {
            query.$or = [
                { voucherCode: { $regex: search, $options: "i" } },
                { guestPhoneNumber: { $regex: search, $options: "i" } },
                { guestEmail: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;

        const [vouchers, total] = await Promise.all([
            Voucher.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Voucher.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            message: "Vouchers fetched successfully",
            data: vouchers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/admin/vouchers error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch vouchers" },
            { status: 500 }
        );
    }
}