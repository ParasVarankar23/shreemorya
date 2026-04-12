import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/bus.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import createAuditLog from "@/lib/createAuditLog";

/* ------------------------------------------
   GET /api/admin/buses/[busId]
   Admin: Get single bus
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

        const { busId } = params;

        const bus = await Bus.findById(busId);

        if (!bus || !bus.isActive) {
            return NextResponse.json(
                { success: false, message: "Bus not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Bus fetched successfully",
            data: bus,
        });
    } catch (error) {
        console.error("GET /api/admin/buses/[busId] error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch bus" },
            { status: 500 }
        );
    }
}

/* ------------------------------------------
   PUT /api/admin/buses/[busId]
   Admin: Update bus
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

        const { busId } = params;
        const body = await request.json();

        const bus = await Bus.findById(busId);

        if (!bus || !bus.isActive) {
            return NextResponse.json(
                { success: false, message: "Bus not found" },
                { status: 404 }
            );
        }

        const oldValues = bus.toObject();

        if (body.busNumber) {
            const duplicate = await Bus.findOne({
                _id: { $ne: busId },
                busNumber: String(body.busNumber).trim().toUpperCase(),
            });

            if (duplicate) {
                return NextResponse.json(
                    { success: false, message: "Bus number already exists" },
                    { status: 409 }
                );
            }
        }

        Object.assign(bus, {
            ...body,
            updatedBy: authUser.userId,
        });

        if (bus.tripType === "RETURN" && !bus.returnTrip) {
            return NextResponse.json(
                {
                    success: false,
                    message: "returnTrip is required when tripType is RETURN",
                },
                { status: 400 }
            );
        }

        if (bus.tripType === "ONE_WAY") {
            bus.returnTrip = null;
        }

        await bus.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "UPDATE_BUS",
                entityType: "BUS",
                entityId: bus._id,
                entityCode: bus.busNumber,
                message: `Updated bus ${bus.busNumber}`,
                oldValues,
                newValues: bus.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log update bus error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Bus updated successfully",
            data: bus,
        });
    } catch (error) {
        console.error("PUT /api/admin/buses/[busId] error:", error);

        return NextResponse.json(
            { success: false, message: error.message || "Failed to update bus" },
            { status: 500 }
        );
    }
}

/* ------------------------------------------
   DELETE /api/admin/buses/[busId]
   Admin: Soft delete bus
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

        const { busId } = params;

        const bus = await Bus.findById(busId);

        if (!bus || !bus.isActive) {
            return NextResponse.json(
                { success: false, message: "Bus not found" },
                { status: 404 }
            );
        }

        const oldValues = bus.toObject();

        bus.isActive = false;
        bus.status = "INACTIVE";
        bus.updatedBy = authUser.userId;

        await bus.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "DELETE_BUS",
                entityType: "BUS",
                entityId: bus._id,
                entityCode: bus.busNumber,
                message: `Soft deleted bus ${bus.busNumber}`,
                oldValues,
                newValues: bus.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log delete bus error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Bus deleted successfully",
        });
    } catch (error) {
        console.error("DELETE /api/admin/buses/[busId] error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to delete bus" },
            { status: 500 }
        );
    }
}