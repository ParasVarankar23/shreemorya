import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/bus.model";
import Fare from "@/models/fare.model";
import Schedule from "@/models/schedule.model";
import createAuditLog from "@/lib/createAuditLog";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";

/* ------------------------------------------
   Helper: get effective base fare from fare rules
   Priority:
   1. Exact pickup(1) -> final drop(last) pair if exists
   2. Fallback to bus trip baseFare
------------------------------------------- */
async function getScheduleFare({
    busId,
    tripDirection,
    travelDate,
    busTripBaseFare,
}) {
    const fareRule = await Fare.findOne({
        busId,
        tripDirection,
        pickupPointOrder: 1,
        isActive: true,
        status: { $in: ["ACTIVE", "EXPIRED"] }, // expired filtered below
        validFrom: { $lte: travelDate },
        validTill: { $gte: travelDate },
    }).sort({
        validFrom: -1,
        createdAt: -1,
    });

    if (!fareRule) {
        return {
            baseFare: busTripBaseFare,
            effectiveFare: busTripBaseFare,
            fareType: "REGULAR",
            fareRuleId: null,
        };
    }

    return {
        baseFare: busTripBaseFare,
        effectiveFare: fareRule.fareAmount,
        fareType: fareRule.fareType || "REGULAR",
        fareRuleId: fareRule._id,
    };
}

/* ------------------------------------------
   Helper: build trip snapshot
------------------------------------------- */
function getTripSnapshot(bus, tripDirection) {
    if (tripDirection === "FORWARD") {
        return bus.forwardTrip;
    }

    if (tripDirection === "RETURN") {
        return bus.returnTrip;
    }

    return null;
}

/* ------------------------------------------
   GET /api/admin/schedules
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
        const travelDate = searchParams.get("travelDate") || "";
        const status = searchParams.get("status") || "";
        const tripDirection = searchParams.get("tripDirection") || "";
        const busId = searchParams.get("busId") || "";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        const query = {
            isActive: true,
        };

        if (search) {
            query.$or = [
                { routeName: { $regex: search, $options: "i" } },
                { busNumber: { $regex: search, $options: "i" } },
                { busName: { $regex: search, $options: "i" } },
                { startPoint: { $regex: search, $options: "i" } },
                { endPoint: { $regex: search, $options: "i" } },
            ];
        }

        if (busId) {
            query.busId = busId;
        }

        if (travelDate) {
            const start = new Date(travelDate);
            const end = new Date(travelDate);
            end.setHours(23, 59, 59, 999);

            query.travelDate = {
                $gte: start,
                $lte: end,
            };
        }

        if (status) {
            query.status = status;
        }

        if (tripDirection) {
            query.tripDirection = tripDirection;
        }

        const skip = (page - 1) * limit;

        const [schedules, total] = await Promise.all([
            Schedule.find(query)
                .sort({ travelDate: 1, startTime: 1 })
                .skip(skip)
                .limit(limit),
            Schedule.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            message: "Schedules fetched successfully",
            data: schedules,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/admin/schedules error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch schedules" },
            { status: 500 }
        );
    }
}

/* ------------------------------------------
   POST /api/admin/schedules
   Admin: create forward / return / both
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
            busId,
            travelDate,
            createMode = "FORWARD", // FORWARD | RETURN | BOTH
            seatRules = [],
            notes = "",
            status = "SCHEDULED",
            isBookingOpen = true,
        } = body;

        if (!busId || !travelDate) {
            return NextResponse.json(
                {
                    success: false,
                    message: "busId and travelDate are required",
                },
                { status: 400 }
            );
        }

        const validModes = ["FORWARD", "RETURN", "BOTH"];
        if (!validModes.includes(createMode)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "createMode must be FORWARD, RETURN, or BOTH",
                },
                { status: 400 }
            );
        }

        const bus = await Bus.findById(busId);

        if (!bus || !bus.isActive) {
            return NextResponse.json(
                { success: false, message: "Bus not found" },
                { status: 404 }
            );
        }

        const travelDateObj = new Date(travelDate);

        if (Number.isNaN(travelDateObj.getTime())) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid travelDate",
                },
                { status: 400 }
            );
        }

        const directionsToCreate =
            createMode === "BOTH" ? ["FORWARD", "RETURN"] : [createMode];

        const createdSchedules = [];

        for (const direction of directionsToCreate) {
            const tripData = getTripSnapshot(bus, direction);

            if (!tripData) {
                if (direction === "RETURN") {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                "Return trip is not configured for this bus, so RETURN/BOTH cannot be created",
                        },
                        { status: 400 }
                    );
                }

                return NextResponse.json(
                    {
                        success: false,
                        message: `Trip data not found for ${direction}`,
                    },
                    { status: 400 }
                );
            }

            const existingSchedule = await Schedule.findOne({
                busId: bus._id,
                tripDirection: direction,
                travelDate: travelDateObj,
                isActive: true,
            });

            if (existingSchedule) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `${direction} schedule already exists for this bus on this date`,
                    },
                    { status: 409 }
                );
            }

            const fareSnapshot = await getScheduleFare({
                busId: bus._id,
                tripDirection: direction,
                travelDate: travelDateObj,
                busTripBaseFare: tripData.baseFare,
            });

            const schedule = await Schedule.create({
                busId: bus._id,
                busNumber: bus.busNumber,
                busName: bus.busName,
                busType: bus.busType,
                seatLayout: bus.seatLayout,
                routeName: bus.routeName,
                tripDirection: direction,
                travelDate: travelDateObj,
                startPoint: tripData.startPoint,
                startTime: tripData.startTime,
                endPoint: tripData.endPoint,
                endTime: tripData.endTime,
                pickupPoints: (tripData.pickupPoints || []).map((p, index) => ({
                    name: p.name,
                    time: p.time || "",
                    order: p.order || index + 1,
                })),
                dropPoints: (tripData.dropPoints || []).map((d, index) => ({
                    name: d.name,
                    time: d.time || "",
                    order: d.order || index + 1,
                })),
                baseFare: fareSnapshot.baseFare,
                effectiveFare: fareSnapshot.effectiveFare,
                fareType: fareSnapshot.fareType,
                seatRules,
                status,
                isBookingOpen,
                notes,
                isActive: true,
                createdBy: authUser.userId,
                updatedBy: authUser.userId,
            });

            createdSchedules.push(schedule);

            try {
                await createAuditLog({
                    userId: authUser.userId,
                    userRole: authUser.role,
                    action: "CREATE_SCHEDULE",
                    entityType: "SCHEDULE",
                    entityId: schedule._id,
                    entityCode: `${schedule.busNumber} | ${direction}`,
                    message: `Created ${direction} schedule for ${schedule.busNumber}`,
                    metadata: {
                        busId: String(bus._id),
                        tripDirection: direction,
                        fareRuleId: fareSnapshot.fareRuleId,
                    },
                    newValues: schedule.toObject(),
                    status: "SUCCESS",
                });
            } catch (auditError) {
                console.error("Audit log create schedule error:", auditError);
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: "Schedule(s) created successfully",
                data: createdSchedules,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/admin/schedules error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to create schedule(s)",
            },
            { status: 500 }
        );
    }
}