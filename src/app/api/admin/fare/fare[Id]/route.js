import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Fare from "@/models/fare.model";
import createAuditLog from "@/lib/createAuditLog";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";

/* ------------------------------------------
   GET /api/admin/fare/[fareId]
   Admin: get single fare rule
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

        const { fareId } = params;

        const fare = await Fare.findById(fareId);

        if (!fare || !fare.isActive) {
            return NextResponse.json(
                { success: false, message: "Fare rule not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Fare rule fetched successfully",
            data: fare,
        });
    } catch (error) {
        console.error("GET /api/admin/fare/[fareId] error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch fare rule" },
            { status: 500 }
        );
    }
}

/* ------------------------------------------
   PUT /api/admin/fare/[fareId]
   Admin: update single fare rule
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

        const { fareId } = params;
        const body = await request.json();

        const fare = await Fare.findById(fareId);

        if (!fare || !fare.isActive) {
            return NextResponse.json(
                { success: false, message: "Fare rule not found" },
                { status: 404 }
            );
        }

        const oldValues = fare.toObject();

        const allowedFields = [
            "fareAmount",
            "fareType",
            "validFrom",
            "validTill",
            "label",
            "reason",
            "status",
        ];

        for (const key of allowedFields) {
            if (key in body) {
                if (key === "validFrom" || key === "validTill") {
                    const dateValue = new Date(body[key]);

                    if (Number.isNaN(dateValue.getTime())) {
                        return NextResponse.json(
                            {
                                success: false,
                                message: `Invalid date for ${key}`,
                            },
                            { status: 400 }
                        );
                    }

                    fare[key] = dateValue;
                } else {
                    fare[key] = body[key];
                }
            }
        }

        if (fare.validTill < fare.validFrom) {
            return NextResponse.json(
                {
                    success: false,
                    message: "validTill must be greater than or equal to validFrom",
                },
                { status: 400 }
            );
        }

        // Auto status update if expired
        const now = new Date();
        if (fare.status !== "INACTIVE" && fare.validTill < now) {
            fare.status = "EXPIRED";
        }

        fare.updatedBy = authUser.userId;

        await fare.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "UPDATE_FARE_RULE",
                entityType: "FARE",
                entityId: fare._id,
                entityCode: `${fare.routeName} | ${fare.pickupPointName} -> ${fare.dropPointName}`,
                message: `Updated fare rule ${fare._id}`,
                oldValues,
                newValues: fare.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log fare update error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Fare rule updated successfully",
            data: fare,
        });
    } catch (error) {
        console.error("PUT /api/admin/fare/[fareId] error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to update fare rule",
            },
            { status: 500 }
        );
    }
}

/* ------------------------------------------
   DELETE /api/admin/fare/[fareId]
   Admin: soft delete fare rule
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

        const { fareId } = params;

        const fare = await Fare.findById(fareId);

        if (!fare || !fare.isActive) {
            return NextResponse.json(
                { success: false, message: "Fare rule not found" },
                { status: 404 }
            );
        }

        const oldValues = fare.toObject();

        fare.isActive = false;
        fare.status = "INACTIVE";
        fare.updatedBy = authUser.userId;

        await fare.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "DELETE_FARE_RULE",
                entityType: "FARE",
                entityId: fare._id,
                entityCode: `${fare.routeName} | ${fare.pickupPointName} -> ${fare.dropPointName}`,
                message: `Deleted fare rule ${fare._id}`,
                oldValues,
                newValues: fare.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log fare delete error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Fare rule deleted successfully",
        });
    } catch (error) {
        console.error("DELETE /api/admin/fare/[fareId] error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to delete fare rule" },
            { status: 500 }
        );
    }
}