import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Voucher from "@/models/voucher.model";
import createAuditLog from "@/lib/createAuditLog";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";

export async function GET(request, { params }) {
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

        const { voucherId } = params;

        const voucher = await Voucher.findById(voucherId);

        if (!voucher || !voucher.isActive) {
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
        console.error("GET /api/admin/vouchers/[voucherId] error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch voucher" },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();

        const authUser = getAuthUserFromRequest(request);

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

        const { voucherId } = params;
        const body = await request.json();

        const voucher = await Voucher.findById(voucherId);

        if (!voucher || !voucher.isActive) {
            return NextResponse.json(
                { success: false, message: "Voucher not found" },
                { status: 404 }
            );
        }

        const oldValues = voucher.toObject();

        const allowedFields = [
            "status",
            "expiryDate",
            "issuedReason",
        ];

        for (const key of allowedFields) {
            if (key in body) {
                if (key === "expiryDate") {
                    voucher[key] = new Date(body[key]);
                } else {
                    voucher[key] = body[key];
                }
            }
        }

        voucher.updatedBy = authUser.userId;
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

        return NextResponse.json({
            success: true,
            message: "Voucher updated successfully",
            data: voucher,
        });
    } catch (error) {
        console.error("PUT /api/admin/vouchers/[voucherId] error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update voucher" },
            { status: 500 }
        );
    }
}