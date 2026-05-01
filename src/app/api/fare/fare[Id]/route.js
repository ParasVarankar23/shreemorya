import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Fare from "@/models/fare.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

/* ------------------------------------------
   GET /api/fare/[fareId]
------------------------------------------- */
export async function GET(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!hasRole(authUser, ["admin"])) {
            return NextResponse.json({ success: false, message: "Forbidden: Admin only" }, { status: 403 });
        }

        const { fareId } = params;

        const fare = await Fare.findById(fareId);

        if (!fare || !fare.isActive) {
            return NextResponse.json({ success: false, message: "Fare rule not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Fare rule fetched successfully",
            data: fare,
        });
    } catch (error) {
        console.error("GET /api/fare/[fareId] error:", error);

        return NextResponse.json({ success: false, message: "Failed to fetch fare rule" }, { status: 500 });
    }
}

/* ------------------------------------------
   PUT /api/fare/[fareId]
------------------------------------------- */
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

        const { fareId } = params;
        const body = await request.json();

        const fare = await Fare.findById(fareId);

        if (!fare || !fare.isActive) {
            return NextResponse.json({ success: false, message: "Fare rule not found" }, { status: 404 });
        }

        const oldValues = fare.toObject();

        const {
            fareAmount,
            validFrom,
            validTill,
            fareType,
            label,
            reason,
            status,
        } = body;

        if (fareAmount != null) {
            fare.fareAmount = Number(fareAmount);
        }

        if (validFrom) {
            const validFromDate = new Date(validFrom);
            if (Number.isNaN(validFromDate.getTime())) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid validFrom date",
                    },
                    { status: 400 }
                );
            }
            fare.validFrom = validFromDate;
        }

        if (validTill) {
            const validTillDate = new Date(validTill);
            if (Number.isNaN(validTillDate.getTime())) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid validTill date",
                    },
                    { status: 400 }
                );
            }
            fare.validTill = validTillDate;
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

        if (fareType) {
            fare.fareType = fareType;
        }

        if (label !== undefined) {
            fare.label = String(label || "").trim();
        }

        if (reason !== undefined) {
            fare.reason = String(reason || "").trim();
        }

        if (status) {
            fare.status = status;
        }

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
        console.error("PUT /api/fare/[fareId] error:", error);

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
   DELETE /api/fare/[fareId]
------------------------------------------- */
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!hasRole(authUser, ["admin"])) {
            return NextResponse.json({ success: false, message: "Forbidden: Admin only" }, { status: 403 });
        }

        const { fareId } = params;

        const fare = await Fare.findById(fareId);

        if (!fare || !fare.isActive) {
            return NextResponse.json({ success: false, message: "Fare rule not found" }, { status: 404 });
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
        console.error("DELETE /api/fare/[fareId] error:", error);

        return NextResponse.json({ success: false, message: "Failed to delete fare rule" }, { status: 500 });
    }
}