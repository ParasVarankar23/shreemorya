import createAuditLog from "@/lib/createAuditLog";
import { BUS_TYPES, ROUTES, getFarePreviewByRoute } from "@/lib/fare.js";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/bus.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth.js";
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
   GET /api/admin/buses
   Admin: List buses
------------------------------------------- */
export async function GET(request) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!hasRole(authUser, ["admin"])) {
            return NextResponse.json({ success: false, message: "Forbidden: Admin only" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search") || "";
        const busType = searchParams.get("busType") || "";
        const seatLayout = searchParams.get("seatLayout") || "";
        const status = searchParams.get("status") || "";
        const routeCode = searchParams.get("routeCode") || "";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        const query = {
            isActive: true,
        };

        if (search) {
            query.$or = [
                { busNumber: { $regex: search, $options: "i" } },
                { busName: { $regex: search, $options: "i" } },
                { routeName: { $regex: search, $options: "i" } },
            ];
        }

        if (busType) {
            query.busType = busType;
        }

        if (seatLayout) {
            query.seatLayout = Number(seatLayout);
        }

        if (status) {
            query.status = status;
        }

        if (routeCode) {
            query.routeCode = routeCode;
        }

        const skip = (page - 1) * limit;

        const [buses, total] = await Promise.all([
            Bus.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Bus.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            message: "Buses fetched successfully",
            data: buses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/admin/buses error:", error);

        return NextResponse.json({ success: false, message: "Failed to fetch buses" }, { status: 500 });
    }
}

/* ------------------------------------------
   POST /api/admin/buses
   Admin: Create bus
------------------------------------------- */
export async function POST(request) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!hasRole(authUser, ["admin"])) {
            return NextResponse.json({ success: false, message: "Forbidden: Admin only" }, { status: 403 });
        }

        const body = await request.json();

        const {
            busNumber,
            busName,
            busType,
            seatLayout,
            cabinSeatCount = 0,
            cabinSeats = [],
            routeName,
            routeCode = "",
            tripType = "ONE_WAY",
            forwardTrip,
            returnTrip = null,
            fareConfig = {},
            amenities = [],
            status = "ACTIVE",
            notes = "",
        } = body;

        if (!busNumber || !busName || !busType || !seatLayout || !routeName || !forwardTrip) {
            return NextResponse.json(
                {
                    success: false,
                    message: "busNumber, busName, busType, seatLayout, routeName and forwardTrip are required",
                },
                { status: 400 }
            );
        }

        if (!Object.values(BUS_TYPES).includes(busType)) {
            return NextResponse.json({ success: false, message: "Invalid busType" }, { status: 400 });
        }

        if (!ALLOWED_SEAT_LAYOUTS.includes(Number(seatLayout))) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid seat layout. Allowed: 21, 32, 35, 39",
                },
                { status: 400 }
            );
        }

        if (routeCode && !Object.values(ROUTES).includes(routeCode)) {
            return NextResponse.json({ success: false, message: "Invalid routeCode" }, { status: 400 });
        }

        if (tripType === "RETURN" && !returnTrip) {
            return NextResponse.json(
                { success: false, message: "returnTrip is required when tripType is RETURN" },
                { status: 400 }
            );
        }

        const normalizedForwardTrip = normalizeTrip(forwardTrip);
        const forwardTripError = validateTrip(normalizedForwardTrip, "forwardTrip");
        if (forwardTripError) {
            return NextResponse.json({ success: false, message: forwardTripError }, { status: 400 });
        }

        const normalizedReturnTrip = tripType === "RETURN" ? normalizeTrip(returnTrip) : null;
        if (tripType === "RETURN") {
            const returnTripError = validateTrip(normalizedReturnTrip, "returnTrip");
            if (returnTripError) {
                return NextResponse.json({ success: false, message: returnTripError }, { status: 400 });
            }
        }

        const existingBus = await Bus.findOne({
            busNumber: String(busNumber).trim().toUpperCase(),
        });

        if (existingBus) {
            return NextResponse.json({ success: false, message: "Bus number already exists" }, { status: 409 });
        }

        const normalizedRouteCode = String(routeCode || "").trim();
        const fareRoute = fareConfig?.route || normalizedRouteCode || "";
        const fareBusType = fareConfig?.busType || busType;
        const defaultAmount =
            Number(fareConfig?.defaultAmount) > 0
                ? Number(fareConfig.defaultAmount)
                : fareRoute
                    ? getDefaultAmountFromFare(fareRoute, fareBusType)
                    : 0;

        const bus = await Bus.create({
            busNumber: String(busNumber).trim().toUpperCase(),
            busName: String(busName).trim(),
            busType,
            seatLayout: Number(seatLayout),
            totalSeats: Number(seatLayout),
            cabinSeatCount: Math.min(Number(cabinSeatCount || 0), 10),
            cabinSeats: Array.isArray(cabinSeats) ? cabinSeats.slice(0, 10) : [],
            routeName: String(routeName).trim(),
            routeCode: normalizedRouteCode,
            tripType,
            forwardTrip: normalizedForwardTrip,
            returnTrip: tripType === "RETURN" ? normalizedReturnTrip : null,
            fareConfig: {
                route: fareRoute,
                busType: fareBusType,
                defaultAmount,
            },
            amenities: Array.isArray(amenities) ? amenities : [],
            status,
            notes: String(notes || "").trim(),
            createdBy: authUser.userId,
            updatedBy: authUser.userId,
            isActive: true,
        });

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "CREATE_BUS",
                entityType: "BUS",
                entityId: bus._id,
                entityCode: bus.busNumber,
                message: `Created bus ${bus.busNumber}`,
                newValues: bus.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log create bus error:", auditError);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Bus created successfully",
                data: bus,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/admin/buses error:", error);

        return NextResponse.json(
            { success: false, message: error.message || "Failed to create bus" },
            { status: 500 }
        );
    }
}