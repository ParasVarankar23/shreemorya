import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Voucher from "@/models/voucher.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
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

        const p = await params;
        const voucherId = p?.voucherId;

        console.log("GET /api/vouchers/[voucherId] request for:", voucherId);

        // Try find by _id first; if not found and voucherId looks like a code,
        // attempt a case-insensitive lookup by voucherCode as a fallback.
        let voucher = null;
        try {
            voucher = await Voucher.findById(voucherId)
                .populate("sourceBookingId", "bookingCode customerName customerPhone customerEmail travelDate seats")
                .populate("issuedBy", "name email")
                .populate("usedBookings.bookingId", "bookingCode customerName customerPhone customerEmail travelDate seats")
                .lean();
        } catch (e) {
            voucher = null;
        }

        if (!voucher) {
            const isObjectIdLike = typeof voucherId === "string" && /^[0-9a-fA-F]{24}$/.test(voucherId);
            if (!isObjectIdLike) {
                const found = await Voucher.findOne({ voucherCode: { $regex: `^${String(voucherId)}$`, $options: "i" } })
                    .populate("sourceBookingId", "bookingCode customerName customerPhone customerEmail travelDate seats")
                    .populate("issuedBy", "name email")
                    .populate("usedBookings.bookingId", "bookingCode customerName customerPhone customerEmail travelDate seats")
                    .lean();
                voucher = found || null;
            }
        }

        if (!voucher) {
            return NextResponse.json(
                { success: false, message: "Voucher not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Voucher fetched successfully",
            data: voucher,
        });
    } catch (error) {
        console.error("GET /api/vouchers/[voucherId] error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to fetch voucher",
            },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!hasRole(authUser, ["admin"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin only" },
                { status: 403 }
            );
        }

        const p2 = await params;
        const voucherId = p2?.voucherId;
        const body = await request.json();

        const voucher = await Voucher.findById(voucherId);

        if (!voucher) {
            return NextResponse.json(
                { success: false, message: "Voucher not found" },
                { status: 404 }
            );
        }

        const oldValues = voucher.toObject();

        // allowed update fields
        const allowedFields = ["status", "issueReason", "notes", "expiresAt", "isActive"];

        for (const key of allowedFields) {
            if (!(key in body)) continue;

            if (key === "expiresAt") {
                const parsedDate = new Date(body[key]);
                if (!Number.isNaN(parsedDate.getTime())) {
                    voucher.expiresAt = parsedDate;
                }
            } else {
                voucher[key] = body[key];
            }
        }

        await voucher.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "UPDATE_VOUCHER",
                entityType: "VOUCHER",
                entityId: voucher._id,
                entityCode: voucher.voucherCode,
                message: `Updated voucher ${voucher.voucherCode}`,
                oldValues,
                newValues: voucher.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log update voucher error:", auditError);
        }

        const updatedVoucher = await Voucher.findById(voucher._id)
            .populate("sourceBookingId", "bookingCode customerName customerPhone customerEmail travelDate seats")
            .populate("issuedBy", "name email")
            .populate("usedBookings.bookingId", "bookingCode customerName customerPhone customerEmail travelDate seats")
            .lean();

        return NextResponse.json({
            success: true,
            message: "Voucher updated successfully",
            data: updatedVoucher,
        });
    } catch (error) {
        console.error("PUT /api/vouchers/[voucherId] error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to update voucher",
            },
            { status: 500 }
        );
    }
}
