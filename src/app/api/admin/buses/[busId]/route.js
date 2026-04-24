import createAuditLog from "@/lib/createAuditLog";
import { BUS_TYPES, ROUTES, getFarePreviewByRoute } from "@/lib/fare.js";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/bus.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

const ALLOWED_SEAT_LAYOUTS = [21, 32, 35, 39];
const MAX_ROUTE_POINTS = 150;

function isValidTimeString(value = "") {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value || "").trim());
}

function normalizeRoutePoints(points = []) {
    if (!Array.isArray(points)) return [];

    return points
        .slice(0, MAX_ROUTE_POINTS)
        .map((point, index) => {
            if (typeof point === "string") {
                return {
                    name: String(point).trim(),
                    time: "",
                    order: index + 1,
                    isActive: true,
                };
            }

            return {
                name: String(point?.name || "").trim(),
                time: String(point?.time || "").trim(),
                order: Number(point?.order) > 0 ? Number(point.order) : index + 1,
                isActive: point?.isActive !== false,
            };
        })
        .filter((point) => point.name);
}

function normalizeTrip(trip) {
    if (!trip) return null;

    return {
        from: String(trip.from || "").trim(),
        to: String(trip.to || "").trim(),
        departureTime: String(trip.departureTime || "").trim(),
        arrivalTime: String(trip.arrivalTime || "").trim(),
        pickupPoints: normalizeRoutePoints(trip.pickupPoints),
        dropPoints: normalizeRoutePoints(trip.dropPoints),
    };
}

function validateTrip(trip, label = "forwardTrip") {
    if (!trip) return `${label} is required`;

    if (!trip.from || !trip.to || !trip.departureTime || !trip.arrivalTime) {
        return `${label}.from, ${label}.to, ${label}.departureTime and ${label}.arrivalTime are required`;
    }

    if (!isValidTimeString(trip.departureTime) || !isValidTimeString(trip.arrivalTime)) {
        return `${label} time format must be HH:mm`;
    }

    if ((trip.pickupPoints || []).length > MAX_ROUTE_POINTS) {
        return `${label}.pickupPoints cannot exceed ${MAX_ROUTE_POINTS}`;
    }

    if ((trip.dropPoints || []).length > MAX_ROUTE_POINTS) {
        return `${label}.dropPoints cannot exceed ${MAX_ROUTE_POINTS}`;
    }

    return null;
}

function getDefaultAmountFromFare(route, busType) {
    const preview = getFarePreviewByRoute(route, busType);
    if (!preview.length) return 0;
    return Math.max(...preview.map((item) => Number(item.amount || 0)));
}

/* ------------------------------------------
   GET /api/admin/buses/[busId]
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

        const { busId } = params;

        const bus = await Bus.findById(busId);

        if (!bus || !bus.isActive) {
            return NextResponse.json({ success: false, message: "Bus not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Bus fetched successfully",
            data: bus,
        });
    } catch (error) {
        console.error("GET /api/admin/buses/[busId] error:", error);

        return NextResponse.json({ success: false, message: "Failed to fetch bus" }, { status: 500 });
    }
}

/* ------------------------------------------
   PUT /api/admin/buses/[busId]
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

        const { busId } = params;
        const body = await request.json();

        const bus = await Bus.findById(busId);

        if (!bus || !bus.isActive) {
            return NextResponse.json({ success: false, message: "Bus not found" }, { status: 404 });
        }

        const oldValues = bus.toObject();

        if (body.busNumber) {
            const duplicate = await Bus.findOne({
                _id: { $ne: busId },
                busNumber: String(body.busNumber).trim().toUpperCase(),
            });

            if (duplicate) {
                return NextResponse.json({ success: false, message: "Bus number already exists" }, { status: 409 });
            }
        }

        if (body.busType && !Object.values(BUS_TYPES).includes(body.busType)) {
            return NextResponse.json({ success: false, message: "Invalid busType" }, { status: 400 });
        }

        if (body.seatLayout && !ALLOWED_SEAT_LAYOUTS.includes(Number(body.seatLayout))) {
            return NextResponse.json(
                { success: false, message: "Invalid seat layout. Allowed: 21, 32, 35, 39" },
                { status: 400 }
            );
        }

        if (body.routeCode && !Object.values(ROUTES).includes(body.routeCode)) {
            return NextResponse.json({ success: false, message: "Invalid routeCode" }, { status: 400 });
        }

        const nextTripType = body.tripType || bus.tripType;

        let normalizedForwardTrip = bus.forwardTrip;
        if (body.forwardTrip) {
            normalizedForwardTrip = normalizeTrip(body.forwardTrip);
            const err = validateTrip(normalizedForwardTrip, "forwardTrip");
            if (err) {
                return NextResponse.json({ success: false, message: err }, { status: 400 });
            }
        }

        let normalizedReturnTrip = bus.returnTrip;
        if (nextTripType === "RETURN") {
            normalizedReturnTrip = body.returnTrip ? normalizeTrip(body.returnTrip) : bus.returnTrip;
            const err = validateTrip(normalizedReturnTrip, "returnTrip");
            if (err) {
                return NextResponse.json({ success: false, message: err }, { status: 400 });
            }
        } else {
            normalizedReturnTrip = null;
        }

        const nextBusType = body.busType || bus.busType;
        const nextRouteCode = body.routeCode !== undefined ? String(body.routeCode || "").trim() : bus.routeCode;

        const nextFareConfig = {
            route: body?.fareConfig?.route || nextRouteCode || bus?.fareConfig?.route || "",
            busType: body?.fareConfig?.busType || nextBusType || bus?.fareConfig?.busType || "NON_AC",
            defaultAmount:
                Number(body?.fareConfig?.defaultAmount) > 0
                    ? Number(body.fareConfig.defaultAmount)
                    : 0,
        };

        if (!nextFareConfig.defaultAmount && nextFareConfig.route) {
            nextFareConfig.defaultAmount = getDefaultAmountFromFare(nextFareConfig.route, nextFareConfig.busType);
        }

        Object.assign(bus, {
            ...body,
            busNumber: body.busNumber ? String(body.busNumber).trim().toUpperCase() : bus.busNumber,
            busName: body.busName ? String(body.busName).trim() : bus.busName,
            seatLayout: body.seatLayout ? Number(body.seatLayout) : bus.seatLayout,
            totalSeats: body.seatLayout ? Number(body.seatLayout) : bus.totalSeats,
            cabinSeatCount:
                body.cabinSeatCount !== undefined ? Math.min(Number(body.cabinSeatCount || 0), 10) : bus.cabinSeatCount,
            cabinSeats: Array.isArray(body.cabinSeats) ? body.cabinSeats.slice(0, 10) : bus.cabinSeats,
            routeName: body.routeName ? String(body.routeName).trim() : bus.routeName,
            routeCode: nextRouteCode,
            forwardTrip: normalizedForwardTrip,
            returnTrip: normalizedReturnTrip,
            fareConfig: nextFareConfig,
            notes: body.notes !== undefined ? String(body.notes || "").trim() : bus.notes,
            updatedBy: authUser.userId,
        });

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

        const { busId } = params;

        const bus = await Bus.findById(busId);

        if (!bus || !bus.isActive) {
            return NextResponse.json({ success: false, message: "Bus not found" }, { status: 404 });
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

        return NextResponse.json({ success: false, message: "Failed to delete bus" }, { status: 500 });
    }
}