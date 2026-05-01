import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Schedule from "@/models/schedule.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json({ success: false, message: "Forbidden: Admin/Staff only" }, { status: 403 });
        }

        const { scheduleId } = params;
        const body = await request.json();
        const { isBookingOpen } = body;

        if (typeof isBookingOpen !== "boolean") {
            return NextResponse.json(
                { success: false, message: "isBookingOpen must be boolean" },
                { status: 400 }
            );
        }

        const schedule = await Schedule.findById(scheduleId);

        if (!schedule || !schedule.isActive) {
            return NextResponse.json({ success: false, message: "Schedule not found" }, { status: 404 });
        }

        const oldValues = schedule.toObject();

        schedule.isBookingOpen = isBookingOpen;
        schedule.bookingClosedAt = isBookingOpen ? null : new Date();
        schedule.updatedBy = authUser.userId;

        await schedule.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "TOGGLE_SCHEDULE_BOOKING",
                entityType: "SCHEDULE",
                entityId: schedule._id,
                entityCode: `${schedule.busNumber} | ${schedule.tripDirection}`,
                message: `${isBookingOpen ? "Opened" : "Closed"} booking for schedule ${schedule._id}`,
                oldValues,
                newValues: schedule.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log toggle booking error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: `Booking ${isBookingOpen ? "opened" : "closed"} successfully`,
            data: schedule,
        });
    } catch (error) {
        console.error("POST /api/schedules/[scheduleId]/toggle-booking error:", error);
        return NextResponse.json({ success: false, message: "Failed to toggle booking" }, { status: 500 });
    }
}