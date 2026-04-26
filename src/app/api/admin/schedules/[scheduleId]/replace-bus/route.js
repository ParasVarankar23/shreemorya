import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Bus from "@/models/bus.model";
import Schedule from "@/models/schedule.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

function isBusAvailableForScheduling(bus) {
    if (!bus) return false;

    if (typeof bus.isActive === "boolean") {
        return bus.isActive;
    }

    return String(bus.status || "").toUpperCase() === "ACTIVE";
}

export async function POST(request, { params }) {
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
        const { newBusId, reason = "" } = body;

        if (!newBusId) {
            return NextResponse.json({ success: false, message: "newBusId is required" }, { status: 400 });
        }

        const schedule = await Schedule.findById(scheduleId);

        if (!schedule || !schedule.isActive) {
            return NextResponse.json({ success: false, message: "Schedule not found" }, { status: 404 });
        }

        const newBus = await Bus.findById(newBusId);

        if (!isBusAvailableForScheduling(newBus)) {
            return NextResponse.json({ success: false, message: "New bus not found" }, { status: 404 });
        }

        const bookings = await Booking.find({
            scheduleId: schedule._id,
            isActive: true,
            bookingStatus: { $in: ["CONFIRMED", "PARTIAL"] },
        }).select("seatNumbers");

        const bookedSeats = bookings.flatMap((b) => b.seatNumbers || []);
        const maxBookedSeat = bookedSeats.length ? Math.max(...bookedSeats) : 0;

        if (maxBookedSeat > newBus.seatLayout) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Cannot replace bus. Highest booked seat is ${maxBookedSeat}, but new bus has only ${newBus.seatLayout} seats.`,
                },
                { status: 400 }
            );
        }

        const oldValues = schedule.toObject();

        schedule.busReplacementHistory.push({
            oldBusId: schedule.busId,
            newBusId: newBus._id,
            oldSeatLayout: schedule.seatLayout,
            newSeatLayout: newBus.seatLayout,
            reason,
            replacedBy: authUser.userId,
            replacedAt: new Date(),
        });

        schedule.busId = newBus._id;
        schedule.busNumber = newBus.busNumber;
        schedule.busName = newBus.busName;
        schedule.busType = newBus.busType;
        schedule.seatLayout = newBus.seatLayout;
        schedule.updatedBy = authUser.userId;

        await schedule.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "REPLACE_SCHEDULE_BUS",
                entityType: "SCHEDULE",
                entityId: schedule._id,
                entityCode: `${schedule.busNumber} | ${schedule.tripDirection}`,
                message: `Replaced bus for schedule ${schedule._id}`,
                oldValues,
                newValues: schedule.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log replace bus error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Bus replaced successfully",
            data: schedule,
        });
    } catch (error) {
        console.error("POST /api/admin/schedules/[scheduleId]/replace-bus error:", error);
        return NextResponse.json({ success: false, message: "Failed to replace bus" }, { status: 500 });
    }
}