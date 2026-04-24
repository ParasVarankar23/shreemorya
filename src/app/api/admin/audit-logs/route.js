import connectDB from "@/lib/mongodb";
import AuditLog from "@/models/audit-log.model";
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

        if (!hasRole(authUser, ["admin"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin only" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);

        const action = searchParams.get("action") || "";
        const entityType = searchParams.get("entityType") || "";
        const userId = searchParams.get("userId") || "";
        const status = searchParams.get("status") || "";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        const query = { isActive: true };

        if (action) query.action = action;
        if (entityType) query.entityType = entityType;
        if (userId) query.userId = userId;
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            AuditLog.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            message: "Audit logs fetched successfully",
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/admin/audit-logs error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch audit logs" },
            { status: 500 }
        );
    }
}