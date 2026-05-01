import connectDB from "@/lib/mongodb";
import Voucher from "@/models/voucher.model";
import { getAuthUserFromRequest } from "@/utils/auth";
import { NextResponse } from "next/server";

function parsePositiveInt(value, fallback) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
}

function getDateRangeFromPreset(preset = "") {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const normalized = String(preset || "").toUpperCase();

    if (normalized === "TODAY") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return { start, end };
    }

    if (normalized === "WEEKLY") {
        const start = new Date();
        const day = start.getDay(); // sunday 0
        const diff = day === 0 ? 6 : day - 1; // monday start
        start.setDate(start.getDate() - diff);
        start.setHours(0, 0, 0, 0);
        return { start, end };
    }

    if (normalized === "MONTHLY") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        return { start, end };
    }

    if (normalized === "YEARLY") {
        const start = new Date(now.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
        return { start, end };
    }

    return null;
}

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

        // Allow all authenticated roles to view vouchers (admin/staff/user/guest)

        const { searchParams } = new URL(request.url);

        const search = (searchParams.get("search") || "").trim();
        const status = (searchParams.get("status") || "").trim().toUpperCase();
        const bookingId = (searchParams.get("bookingId") || "").trim();

        const preset = (searchParams.get("preset") || "").trim().toUpperCase();
        const startDate = (searchParams.get("startDate") || "").trim();
        const endDate = (searchParams.get("endDate") || "").trim();

        const page = parsePositiveInt(searchParams.get("page") || "1", 1);
        const limit = parsePositiveInt(searchParams.get("limit") || "20", 20);

        // IMPORTANT: show all vouchers by default
        const query = {};

        // Optional: if you never want soft-deleted inactive records, keep this
        // query.isActive = true;

        if (status && status !== "ALL") {
            query.status = status;
        }

        if (bookingId) {
            query.sourceBookingId = bookingId;
        }

        if (search) {
            query.$or = [
                { voucherCode: { $regex: search, $options: "i" } },
                { guestName: { $regex: search, $options: "i" } },
                { guestPhoneNumber: { $regex: search, $options: "i" } },
                { guestEmail: { $regex: search, $options: "i" } },
                { issueReason: { $regex: search, $options: "i" } },
                { notes: { $regex: search, $options: "i" } },
            ];
        }

        // Date filter on createdAt
        const createdAtFilter = {};

        const presetRange = getDateRangeFromPreset(preset);
        if (presetRange) {
            createdAtFilter.$gte = presetRange.start;
            createdAtFilter.$lte = presetRange.end;
        }

        if (startDate) {
            const start = new Date(startDate);
            if (!Number.isNaN(start.getTime())) {
                start.setHours(0, 0, 0, 0);
                createdAtFilter.$gte = start;
            }
        }

        if (endDate) {
            const end = new Date(endDate);
            if (!Number.isNaN(end.getTime())) {
                end.setHours(23, 59, 59, 999);
                createdAtFilter.$lte = end;
            }
        }

        if (Object.keys(createdAtFilter).length > 0) {
            query.createdAt = createdAtFilter;
        }

        const skip = (page - 1) * limit;

        const [vouchers, total] = await Promise.all([
            Voucher.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("sourceBookingId", "bookingCode customerName customerPhone travelDate")
                .populate("issuedBy", "name email")
                .lean(),
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
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
            },
            filters: {
                search,
                status,
                bookingId,
                preset,
                startDate,
                endDate,
            },
        });
    } catch (error) {
        console.error("GET /api/vouchers error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to fetch vouchers",
            },
            { status: 500 }
        );
    }
}