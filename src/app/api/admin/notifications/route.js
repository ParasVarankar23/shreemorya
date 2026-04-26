import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification.model";
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

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") || "";
        const isRead = searchParams.get("isRead");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        const query = { isActive: true };

        if (type) query.type = type;
        if (isRead === "true") query.isRead = true;
        if (isRead === "false") query.isRead = false;

        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Notification.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            message: "Notifications fetched successfully",
            data: notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/admin/notifications error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch notifications" }, { status: 500 });
    }
}