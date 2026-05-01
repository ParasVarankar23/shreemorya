import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/bus.model";
import Fare from "@/models/fare.model";
import Schedule from "@/models/schedule.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

/* ------------------------------------------
   Helper: get effective fare
------------------------------------------- */
async function getScheduleFare({
    busId,
    travelDate,
    busTripBaseFare,
}) {
    const parsedBaseFare = Number(busTripBaseFare);
    const safeBaseFare = Number.isFinite(parsedBaseFare) ? parsedBaseFare : 0;

    const fareRule = await Fare.findOne({
        busId,
        pickupPointOrder: 1,
        isActive: true,
        status: { $in: ["ACTIVE", "EXPIRED"] },
        validFrom: { $lte: travelDate },
        validTill: { $gte: travelDate },
    }).sort({
        validFrom: -1,
        createdAt: -1,
    });

    if (!fareRule) {
        return {
            baseFare: safeBaseFare,
            effectiveFare: safeBaseFare,
            fareType: "REGULAR",
            fareRuleId: null,
        };
    }

    const parsedRuleFare = Number(fareRule.fareAmount);
    const safeRuleFare = Number.isFinite(parsedRuleFare)
        ? parsedRuleFare
        : safeBaseFare;

    return {
        baseFare: safeBaseFare,
        effectiveFare: safeRuleFare,
        fareType: fareRule.fareType || "REGULAR",
        fareRuleId: fareRule._id,
    };
}

/* ------------------------------------------
   Helper: get trip snapshot
   NOTE:
   We are using forwardTrip as the default trip snapshot
   because UI does not expose direction anymore.
------------------------------------------- */
function getTripSnapshot(bus) {
    return bus.forwardTrip || null;
}

function normalizeTripSnapshot(tripData = {}) {
    return {
        routeName: String(tripData.routeName || "").trim(),
        startPoint: String(tripData.startPoint || tripData.from || "").trim(),
        startTime: String(tripData.startTime || tripData.departureTime || "").trim(),
        endPoint: String(tripData.endPoint || tripData.to || "").trim(),
        endTime: String(tripData.endTime || tripData.arrivalTime || "").trim(),
        pickupPoints: Array.isArray(tripData.pickupPoints) ? tripData.pickupPoints : [],
        dropPoints: Array.isArray(tripData.dropPoints) ? tripData.dropPoints : [],
        baseFare: Number(tripData.baseFare),
    };
}

function isBusAvailableForScheduling(bus) {
    if (!bus) return false;

    // Current bus schema uses status (ACTIVE/INACTIVE).
    // Keep legacy compatibility for older documents that may still have isActive.
    if (typeof bus.isActive === "boolean") {
        return bus.isActive;
    }

    return String(bus.status || "").toUpperCase() === "ACTIVE";
}

/* ------------------------------------------
   GET /api/schedules
------------------------------------------- */
export async function GET(request) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Allow admin and staff to view schedules
        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin/Staff only" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const skip = (page - 1) * limit;

        const busId = searchParams.get("busId");
        const query = { isActive: true };

        if (busId) {
            query.busId = busId;
        }

        const [schedules, total] = await Promise.all([
            Schedule.find(query).sort({ travelDate: 1, startTime: 1 }).skip(skip).limit(limit),
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
        console.error("GET /api/schedules error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch schedules" },
            { status: 500 }
        );
    }
}

/* ------------------------------------------
   POST /api/schedules
   SIMPLE CREATE:
   - busId
   - travelDate OR startDate/endDate
   NO createMode
------------------------------------------- */
export async function POST(request) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

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
            startDate,
            endDate,
        } = body;

        if (!busId || (!travelDate && (!startDate || !endDate))) {
            return NextResponse.json(
                {
                    success: false,
                    message: "busId and (travelDate or startDate/endDate) are required",
                },
                { status: 400 }
            );
        }

        const bus = await Bus.findById(busId);

        if (!isBusAvailableForScheduling(bus)) {
            return NextResponse.json(
                { success: false, message: "Bus not found or inactive" },
                { status: 404 }
            );
        }

        const rawTripData = getTripSnapshot(bus);
        const tripData = normalizeTripSnapshot(rawTripData);

        if (!tripData) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Bus trip data not found. Please configure forwardTrip first.",
                },
                { status: 400 }
            );
        }

        if (!tripData.startPoint || !tripData.endPoint || !tripData.startTime || !tripData.endTime) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Bus trip is incomplete. Please set start/end points and departure/arrival time in bus forward trip.",
                },
                { status: 400 }
            );
        }

        const travelDates = [];

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid startDate or endDate",
                    },
                    { status: 400 }
                );
            }

            if (end < start) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "endDate must be on or after startDate",
                    },
                    { status: 400 }
                );
            }

            for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
                travelDates.push(new Date(dt));
            }
        } else if (travelDate) {
            const single = new Date(travelDate);

            if (Number.isNaN(single.getTime())) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid travelDate",
                    },
                    { status: 400 }
                );
            }

            travelDates.push(single);
        }

        const createdSchedules = [];

        for (const travelDateObj of travelDates) {
            const existingSchedule = await Schedule.findOne({
                busId: bus._id,
                travelDate: travelDateObj,
                tripDirection: "FORWARD", // internal only, not shown in UI
                isActive: true,
            });

            if (existingSchedule) {
                continue;
            }

            const fareSnapshot = await getScheduleFare({
                busId: bus._id,
                travelDate: travelDateObj,
                busTripBaseFare: tripData.baseFare,
            });

            const schedule = await Schedule.create({
                busId: bus._id,
                busNumber: bus.busNumber,
                busName: bus.busName,
                busType: bus.busType,
                seatLayout: bus.seatLayout,

                routeName:
                    tripData.routeName || bus.routeName || `${tripData.startPoint} - ${tripData.endPoint}`,

                // INTERNAL ONLY because schema requires it
                tripDirection: "FORWARD",

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

                status: "SCHEDULED",
                isBookingOpen: true,
                notes: "",
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
                    entityCode: `${schedule.busNumber}`,
                    message: `Created schedule for ${schedule.busNumber} on ${travelDateObj
                        .toISOString()
                        .slice(0, 10)}`,
                    metadata: {
                        busId: String(bus._id),
                        travelDate: travelDateObj,
                        fareRuleId: fareSnapshot.fareRuleId,
                    },
                    newValues: schedule.toObject(),
                    status: "SUCCESS",
                });
            } catch (auditError) {
                console.error("Audit log create schedule error:", auditError);
            }
        }

        if (createdSchedules.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No new schedules created (all dates already exist)",
                },
                { status: 409 }
            );
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
        console.error("POST /api/schedules error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to create schedule(s)",
            },
            { status: 500 }
        );
    }
}