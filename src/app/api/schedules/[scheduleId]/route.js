import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Schedule from "@/models/schedule.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

/* ------------------------------------------
   GET /api/schedules/[scheduleId]
------------------------------------------- */
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

        if (!hasRole(authUser, ["admin"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin only" },
                { status: 403 }
            );
        }

        const { scheduleId } = params;

        const schedule = await Schedule.findById(scheduleId);

        if (!schedule || !schedule.isActive) {
            return NextResponse.json(
                { success: false, message: "Schedule not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Schedule fetched successfully",
            data: schedule,
        });
    } catch (error) {
        console.error("GET /api/schedules/[scheduleId] error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch schedule" },
            { status: 500 }
        );
    }
}

/* ------------------------------------------
   PUT /api/schedules/[scheduleId]
   Simple Edit
------------------------------------------- */
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

        const { scheduleId } = params;
        const body = await request.json();

        const schedule = await Schedule.findById(scheduleId);

        if (!schedule || !schedule.isActive) {
            return NextResponse.json(
                { success: false, message: "Schedule not found" },
                { status: 404 }
            );
        }

        const oldValues = schedule.toObject();

        const allowedFields = [
            "travelDate",
            "startTime",
            "endTime",
            "baseFare",
            "effectiveFare",
            "status",
        ];

        for (const key of allowedFields) {
            if (key in body) {
                schedule[key] = body[key];
            }
        }

        if (body.status === "CANCELLED") {
            schedule.isBookingOpen = false;
            schedule.bookingClosedAt = new Date();
        }

        schedule.updatedBy = authUser.userId;

        await schedule.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "UPDATE_SCHEDULE",
                entityType: "SCHEDULE",
                entityId: schedule._id,
                entityCode: `${schedule.busNumber}`,
                message: `Updated schedule ${schedule._id}`,
                oldValues,
                newValues: schedule.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log schedule update error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Schedule updated successfully",
            data: schedule,
        });
    } catch (error) {
        console.error("PUT /api/schedules/[scheduleId] error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to update schedule",
            },
            { status: 500 }
        );
    }
}

/* ------------------------------------------
   DELETE /api/schedules/[scheduleId]
------------------------------------------- */
export async function DELETE(request, { params }) {
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

        const { scheduleId } = params;

        const schedule = await Schedule.findById(scheduleId);

        if (!schedule || !schedule.isActive) {
            return NextResponse.json(
                { success: false, message: "Schedule not found" },
                { status: 404 }
            );
        }

        const oldValues = schedule.toObject();

        schedule.isActive = false;
        schedule.status = "CANCELLED";
        schedule.isBookingOpen = false;
        schedule.bookingClosedAt = new Date();
        schedule.updatedBy = authUser.userId;

        await schedule.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "DELETE_SCHEDULE",
                entityType: "SCHEDULE",
                entityId: schedule._id,
                entityCode: `${schedule.busNumber}`,
                message: `Cancelled schedule ${schedule._id}`,
                oldValues,
                newValues: schedule.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log schedule delete error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Schedule deleted successfully",
        });
    } catch (error) {
        console.error("DELETE /api/schedules/[scheduleId] error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to delete schedule" },
            { status: 500 }
        );
    }
}