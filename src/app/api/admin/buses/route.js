import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/bus.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import createAuditLog from "@/lib/createAuditLog";

/* ------------------------------------------
   GET /api/admin/buses
   Admin: List buses
------------------------------------------- */
export async function GET(request) {
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

        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search") || "";
        const busType = searchParams.get("busType") || "";
        const seatLayout = searchParams.get("seatLayout") || "";
        const status = searchParams.get("status") || "";
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

        const skip = (page - 1) * limit;

        const [buses, total] = await Promise.all([
            Bus.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
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

        return NextResponse.json(
            { success: false, message: "Failed to fetch buses" },
            { status: 500 }
        );
    }
}

/* ------------------------------------------
   POST /api/admin/buses
   Admin: Create bus
------------------------------------------- */
export async function POST(request) {
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

        const body = await request.json();

        const {
            busNumber,
            busName,
            busType,
            seatLayout,
            cabinSeatCount = 0,
            routeName,
            tripType = "ONE_WAY",
            forwardTrip,
            returnTrip = null,
            status = "ACTIVE",
            notes = "",
        } = body;

        if (
            !busNumber ||
            !busName ||
            !busType ||
            !seatLayout ||
            !routeName ||
            !forwardTrip
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "busNumber, busName, busType, seatLayout, routeName and forwardTrip are required",
                },
                { status: 400 }
            );
        }

        if (tripType === "RETURN" && !returnTrip) {
            return NextResponse.json(
                {
                    success: false,
                    message: "returnTrip is required when tripType is RETURN",
                },
                { status: 400 }
            );
        }

        const existingBus = await Bus.findOne({
            busNumber: String(busNumber).trim().toUpperCase(),
        });

        if (existingBus) {
            return NextResponse.json(
                { success: false, message: "Bus number already exists" },
                { status: 409 }
            );
        }

        const bus = await Bus.create({
            busNumber,
            busName,
            busType,
            seatLayout,
            cabinSeatCount,
            routeName,
            tripType,
            forwardTrip,
            returnTrip: tripType === "RETURN" ? returnTrip : null,
            status,
            notes,
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