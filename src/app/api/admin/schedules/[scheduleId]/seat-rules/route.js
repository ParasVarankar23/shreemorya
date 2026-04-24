import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Schedule from "@/models/schedule.model";
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

        const { scheduleId } = params;

        const schedule = await Schedule.findById(scheduleId).select("seatRules seatLayout");

        if (!schedule || !schedule.isActive) {
            return NextResponse.json({ success: false, message: "Schedule not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Seat rules fetched successfully",
            data: {
                seatLayout: schedule.seatLayout,
                seatRules: schedule.seatRules || [],
            },
        });
    } catch (error) {
        console.error("GET /api/admin/schedules/[scheduleId]/seat-rules error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch seat rules" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!hasRole(authUser, ["admin"])) {
            return NextResponse.json({ success: false, message: "Forbidden: Admin only" }, { status: 403 });
        }

        const { scheduleId } = params;
        const body = await request.json();
        const { seatRules = [] } = body;

        const schedule = await Schedule.findById(scheduleId);

        if (!schedule || !schedule.isActive) {
            return NextResponse.json({ success: false, message: "Schedule not found" }, { status: 404 });
        }

        for (const rule of seatRules) {
            if (!rule.seatNumber || rule.seatNumber < 1 || rule.seatNumber > schedule.seatLayout) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Invalid seat number in seatRules: ${rule.seatNumber}`,
                    },
                    { status: 400 }
                );
            }

            if (!["ONLY_LADIES", "ONLY_SENIOR_CITIZEN", "BLOCKED"].includes(rule.ruleType)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Invalid ruleType: ${rule.ruleType}`,
                    },
                    { status: 400 }
                );
            }
        }

        const oldValues = schedule.toObject();

        schedule.seatRules = seatRules;
        schedule.updatedBy = authUser.userId;

        await schedule.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "UPDATE_SEAT_RULES",
                entityType: "SCHEDULE",
                entityId: schedule._id,
                entityCode: `${schedule.busNumber} | ${schedule.tripDirection}`,
                message: `Updated seat rules for schedule ${schedule._id}`,
                oldValues,
                newValues: schedule.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log update seat rules error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Seat rules updated successfully",
            data: schedule.seatRules,
        });
    } catch (error) {
        console.error("PUT /api/admin/schedules/[scheduleId]/seat-rules error:", error);
        return NextResponse.json({ success: false, message: "Failed to update seat rules" }, { status: 500 });
    }
}