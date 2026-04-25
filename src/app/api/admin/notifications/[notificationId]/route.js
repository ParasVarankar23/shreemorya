import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/notification.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json({ success: false, message: "Forbidden: Admin/Staff only" }, { status: 403 });
        }

        const { notificationId } = (await params) || {};

        const notification = await Notification.findById(notificationId);

        if (!notification || !notification.isActive) {
            return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Notification fetched successfully",
            data: notification,
        });
    } catch (error) {
        console.error("GET /api/admin/notifications/[notificationId] error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch notification" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json({ success: false, message: "Forbidden: Admin/Staff only" }, { status: 403 });
        }

        const { notificationId } = (await params) || {};
        const body = await request.json();

        const notification = await Notification.findById(notificationId);

        if (!notification || !notification.isActive) {
            return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });
        }

        const oldValues = notification.toObject();

        if ("isRead" in body) notification.isRead = !!body.isRead;
        if ("title" in body) notification.title = body.title;
        if ("message" in body) notification.message = body.message;

        notification.updatedBy = authUser.userId;
        await notification.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "UPDATE_NOTIFICATION",
                entityType: "NOTIFICATION",
                entityId: notification._id,
                entityCode: String(notification._id),
                message: `Updated notification ${notification._id}`,
                oldValues,
                newValues: notification.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log update notification error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Notification updated successfully",
            data: notification,
        });
    } catch (error) {
        console.error("PUT /api/admin/notifications/[notificationId] error:", error);
        return NextResponse.json({ success: false, message: "Failed to update notification" }, { status: 500 });
    }
}
