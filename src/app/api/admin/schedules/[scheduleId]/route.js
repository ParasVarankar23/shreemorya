import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Schedule from "@/models/schedule.model";
import createAuditLog from "@/lib/createAuditLog";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";

/* ------------------------------------------
   GET /api/admin/schedules/[scheduleId]
------------------------------------------- */
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
        console.error("GET /api/admin/schedules/[scheduleId] error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch schedule" },
            { status: 500 }
        );
    }
}

/* ------------------------------------------
   PUT /api/admin/schedules/[scheduleId]
   Admin: update schedule
------------------------------------------- */
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
            "startPoint",
            "startTime",
            "endPoint",
            "endTime",
            "pickupPoints",
            "dropPoints",
            "baseFare",
            "effectiveFare",
            "fareType",
            "seatRules",
            "status",
            "isBookingOpen",
            "notes",
        ];

        for (const key of allowedFields) {
            if (key in body) {
                schedule[key] = body[key];
            }
        }

        // Auto set bookingClosedAt
        if ("isBookingOpen" in body) {
            if (body.isBookingOpen === false && !schedule.bookingClosedAt) {
                schedule.bookingClosedAt = new Date();
            }

            if (body.isBookingOpen === true) {
                schedule.bookingClosedAt = null;
            }
        }

        // If cancelled from update
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
                entityCode: `${schedule.busNumber} | ${schedule.tripDirection}`,
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
        console.error("PUT /api/admin/schedules/[scheduleId] error:", error);

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
   DELETE /api/admin/schedules/[scheduleId]
   Admin: soft cancel schedule
------------------------------------------- */
export async function DELETE(request, { params }) {
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
                entityCode: `${schedule.busNumber} | ${schedule.tripDirection}`,
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
            message: "Schedule cancelled successfully",
        });
    } catch (error) {
        console.error("DELETE /api/admin/schedules/[scheduleId] error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to cancel schedule" },
            { status: 500 }
        );
    }
}