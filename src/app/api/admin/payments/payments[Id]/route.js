import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/payment.model";
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

        const { paymentId } = params;

        const payment = await Payment.findById(paymentId);

        if (!payment || !payment.isActive) {
            return NextResponse.json(
                { success: false, message: "Payment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Payment fetched successfully",
            data: payment,
        });
    } catch (error) {
        console.error("GET /api/admin/payments/[paymentId] error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch payment" },
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

        const { paymentId } = params;
        const body = await request.json();

        const payment = await Payment.findById(paymentId);

        if (!payment || !payment.isActive) {
            return NextResponse.json(
                { success: false, message: "Payment not found" },
                { status: 404 }
            );
        }

        const oldValues = payment.toObject();

        const allowedFields = [
            "paymentStatus",
            "notes",
            "gatewayOrderId",
            "gatewayPaymentId",
            "gatewaySignature",
        ];

        for (const key of allowedFields) {
            if (key in body) {
                payment[key] = body[key];
            }
        }

        payment.updatedBy = authUser.userId;
        await payment.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "UPDATE_PAYMENT",
                entityType: "PAYMENT",
                entityId: payment._id,
                entityCode: String(payment._id),
                message: `Updated payment ${payment._id}`,
                oldValues,
                newValues: payment.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log update payment error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Payment updated successfully",
            data: payment,
        });
    } catch (error) {
        console.error("PUT /api/admin/payments/[paymentId] error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update payment" },
            { status: 500 }
        );
    }
}