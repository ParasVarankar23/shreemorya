import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/bus.model";
import Fare from "@/models/fare.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

/* ------------------------------------------
   Helper: build fare combinations
------------------------------------------- */
function buildFareCombinations({
    pickupPoints,
    dropPoints,
    selectedPickupOrder,
    selectedDropOrder,
    fareAmount,
    applyNextPickups,
    applyNextDrops,
}) {
    let pickupCandidates = pickupPoints.filter((p) => p.order === selectedPickupOrder);
    let dropCandidates = dropPoints.filter((d) => d.order === selectedDropOrder);

    if (applyNextPickups) {
        pickupCandidates = pickupPoints.filter(
            (p) => p.order >= selectedPickupOrder && p.order < selectedDropOrder
        );
    }

    if (applyNextDrops) {
        dropCandidates = dropPoints.filter(
            (d) => d.order >= selectedDropOrder && d.order > selectedPickupOrder
        );
    }

    const combinations = [];

    for (const pickup of pickupCandidates) {
        for (const drop of dropCandidates) {
            if (pickup.order < drop.order) {
                combinations.push({
                    pickupPointName: pickup.name,
                    pickupPointOrder: pickup.order,
                    pickupPointTime: pickup.time || "",
                    dropPointName: drop.name,
                    dropPointOrder: drop.order,
                    dropPointTime: drop.time || "",
                    fareAmount,
                });
            }
        }
    }

    return combinations;
}

/* ------------------------------------------
   GET /api/fare
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

        const busId = searchParams.get("busId") || "";
        const routeName = searchParams.get("routeName") || "";
        const tripDirection = searchParams.get("tripDirection") || "";
        const fareType = searchParams.get("fareType") || "";
        const status = searchParams.get("status") || "";
        const pickupPointName = searchParams.get("pickupPointName") || "";
        const dropPointName = searchParams.get("dropPointName") || "";
        const date = searchParams.get("date") || "";
        const parentRuleGroupId = searchParams.get("parentRuleGroupId") || "";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        const query = {
            isActive: true,
        };

        if (busId) query.busId = busId;
        if (routeName) query.routeName = { $regex: routeName, $options: "i" };
        if (tripDirection) query.tripDirection = tripDirection;
        if (fareType) query.fareType = fareType;
        if (status) query.status = status;
        if (pickupPointName) query.pickupPointName = { $regex: pickupPointName, $options: "i" };
        if (dropPointName) query.dropPointName = { $regex: dropPointName, $options: "i" };
        if (parentRuleGroupId) query.parentRuleGroupId = parentRuleGroupId;

        if (date) {
            const dateObj = new Date(date);
            query.validFrom = { $lte: dateObj };
            query.validTill = { $gte: dateObj };
        }

        const skip = (page - 1) * limit;

        const [fares, total] = await Promise.all([
            Fare.find(query)
                .sort({
                    tripDirection: 1,
                    pickupPointOrder: 1,
                    dropPointOrder: 1,
                    validFrom: 1,
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit),
            Fare.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            message: "Fare rules fetched successfully",
            data: fares,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/fare error:", error);

        return NextResponse.json({ success: false, message: "Failed to fetch fare rules" }, { status: 500 });
    }
}

/* ------------------------------------------
   POST /api/fare
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
            busId,
            tripDirection = "FORWARD",
            pickupPointOrder,
            dropPointOrder,
            fareAmount,
            validFrom,
            validTill,
            fareType = "REGULAR",
            applyNextPickups = false,
            applyNextDrops = false,
            label = "",
            reason = "",
        } = body;

        if (
            !busId ||
            !pickupPointOrder ||
            !dropPointOrder ||
            fareAmount == null ||
            !validFrom ||
            !validTill
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "busId, pickupPointOrder, dropPointOrder, fareAmount, validFrom, validTill are required",
                },
                { status: 400 }
            );
        }

        if (Number(pickupPointOrder) >= Number(dropPointOrder)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "pickupPointOrder must be less than dropPointOrder",
                },
                { status: 400 }
            );
        }

        const validFromDate = new Date(validFrom);
        const validTillDate = new Date(validTill);

        if (Number.isNaN(validFromDate.getTime()) || Number.isNaN(validTillDate.getTime())) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid validFrom or validTill date",
                },
                { status: 400 }
            );
        }

        if (validTillDate < validFromDate) {
            return NextResponse.json(
                {
                    success: false,
                    message: "validTill must be greater than or equal to validFrom",
                },
                { status: 400 }
            );
        }

        const bus = await Bus.findById(busId);

        if (!bus || !bus.isActive) {
            return NextResponse.json({ success: false, message: "Bus not found" }, { status: 404 });
        }

        let tripData = null;

        if (tripDirection === "FORWARD") {
            tripData = bus.forwardTrip;
        } else if (tripDirection === "RETURN") {
            if (!bus.returnTrip) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Return trip not configured for this bus",
                    },
                    { status: 400 }
                );
            }
            tripData = bus.returnTrip;
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid tripDirection. Allowed: FORWARD, RETURN",
                },
                { status: 400 }
            );
        }

        const pickupPoints = Array.isArray(tripData?.pickupPoints) ? tripData.pickupPoints : [];
        const dropPoints = Array.isArray(tripData?.dropPoints) ? tripData.dropPoints : [];

        const selectedPickup = pickupPoints.find((p) => p.order === Number(pickupPointOrder));
        const selectedDrop = dropPoints.find((d) => d.order === Number(dropPointOrder));

        if (!selectedPickup) {
            return NextResponse.json(
                { success: false, message: "Selected pickup point not found" },
                { status: 400 }
            );
        }

        if (!selectedDrop) {
            return NextResponse.json(
                { success: false, message: "Selected drop point not found" },
                { status: 400 }
            );
        }

        const combinations = buildFareCombinations({
            pickupPoints,
            dropPoints,
            selectedPickupOrder: Number(pickupPointOrder),
            selectedDropOrder: Number(dropPointOrder),
            fareAmount: Number(fareAmount),
            applyNextPickups,
            applyNextDrops,
        });

        if (!combinations.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No valid fare combinations generated",
                },
                { status: 400 }
            );
        }

        const duplicateConditions = combinations.map((item) => ({
            busId: bus._id,
            tripDirection,
            pickupPointOrder: item.pickupPointOrder,
            dropPointOrder: item.dropPointOrder,
            validFrom: validFromDate,
            validTill: validTillDate,
            isActive: true,
        }));

        const existingDuplicate = await Fare.findOne({
            $or: duplicateConditions,
        });

        if (existingDuplicate) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "A fare rule already exists for one or more selected pickup-drop combinations in the same date range",
                },
                { status: 409 }
            );
        }

        const parentRuleGroupId = `FRG-${Date.now()}`;

        const docs = combinations.map((item) => ({
            busId: bus._id,
            routeName: bus.routeName,
            tripDirection,
            pickupPointName: item.pickupPointName,
            pickupPointOrder: item.pickupPointOrder,
            pickupPointTime: item.pickupPointTime,
            dropPointName: item.dropPointName,
            dropPointOrder: item.dropPointOrder,
            dropPointTime: item.dropPointTime,
            fareAmount: Number(item.fareAmount),
            fareType,
            validFrom: validFromDate,
            validTill: validTillDate,
            applyNextPickups,
            applyNextDrops,
            parentRuleGroupId,
            label,
            reason,
            status: "ACTIVE",
            isActive: true,
            createdBy: authUser.userId,
            updatedBy: authUser.userId,
        }));

        const createdFares = await Fare.insertMany(docs);

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "CREATE_FARE_RULES",
                entityType: "FARE",
                entityCode: bus.routeName,
                message: `Created ${createdFares.length} fare rule(s) for ${bus.routeName}`,
                metadata: {
                    busId: String(bus._id),
                    routeName: bus.routeName,
                    tripDirection,
                    parentRuleGroupId,
                    totalRules: createdFares.length,
                    applyNextPickups,
                    applyNextDrops,
                },
                newValues: createdFares,
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log fare create error:", auditError);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Fare rule(s) created successfully",
                data: {
                    parentRuleGroupId,
                    totalCreated: createdFares.length,
                    rules: createdFares,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/fare error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to create fare rule(s)",
            },
            { status: 500 }
        );
    }
}