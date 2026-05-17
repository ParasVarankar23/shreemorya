import {
    BUS_TYPES,
    ROUTES,
    getDefaultFareAmountByRoute,
    getFare,
    isCityStop,
    isVillageStop,
    normalizeStopName as normalizeFareStopName,
} from "@/lib/fare";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Bus from "@/models/bus.model";
import Fare from "@/models/fare.model";
import Schedule from "@/models/schedule.model";
import { NextResponse } from "next/server";

function normalizeDateOnly(dateInput) {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return null;

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

// Use `normalizeFareStopName` from lib/fare for robust normalization (aliases, Marathi)

function normalizeBusType(busType) {
    const value = String(busType || "").trim().toUpperCase();

    if (value === "AC SLEEPER" || value === "AC_SLEEPER") return BUS_TYPES.AC_SLEEPER;
    if (value === "NON-AC SLEEPER" || value === "NON_AC_SLEEPER") return BUS_TYPES.NON_AC_SLEEPER;
    if (value === "AC") return BUS_TYPES.AC;
    return BUS_TYPES.NON_AC;
}

function inferRouteFromStops(pickup, drop) {
    const normalizedPickup = normalizeFareStopName(pickup);
    const normalizedDrop = normalizeFareStopName(drop);

    if (isVillageStop(normalizedPickup) && isCityStop(normalizedDrop)) {
        return ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR;
    }

    if (isCityStop(normalizedPickup) && isVillageStop(normalizedDrop)) {
        return ROUTES.BORIVALI_VIRAR_TO_BORLI_SHRIVARDHAN;
    }

    return null;
}

async function resolveFareAmount({ pickup, drop, busType, schedule }) {
    const normalizedBusType = normalizeBusType(busType);
    const route = inferRouteFromStops(pickup, drop);

    // If schedule provides a positive effectiveFare (created from schedule/fare rules), prefer it
    if (schedule && Number.isFinite(Number(schedule.effectiveFare)) && Number(schedule.effectiveFare) > 0) {
        const ef = Number(schedule.effectiveFare);
        return { amount: ef, fare: ef, route, fareSource: "schedule" };
    }

    // If schedule exists but effectiveFare is missing/zero, try to find a Fare rule covering this schedule date
    if (schedule) {
        try {
            const travelDate = schedule.travelDate ? new Date(schedule.travelDate) : null;
            const pickupName = pickup;
            const dropName = drop;

            if (travelDate) {
                const fareRule = await Fare.findOne({
                    busId: schedule.busId,
                    pickupPointName: pickupName,
                    dropPointName: dropName,
                    isActive: true,
                    validFrom: { $lte: travelDate },
                    validTill: { $gte: travelDate },
                }).sort({ validFrom: -1, createdAt: -1 });

                if (fareRule) {
                    const amt = Number(fareRule.fareAmount || 0);
                    if (Number.isFinite(amt) && amt > 0) {
                        return { amount: amt, fare: amt, route, fareSource: "fare.js" };
                    }
                }
            }
        } catch (err) {
            console.warn("Error while checking Fare rules in resolveFareAmount:", err);
        }
    }

    if (route) {
        const fareResult = getFare({ route, pickup, drop, busType: normalizedBusType });

        if (fareResult?.isValid && Number.isFinite(fareResult.amount)) {
            return { amount: Number(fareResult.amount), fare: Number(fareResult.amount), route, fareSource: "fare.js" };
        }
    }

    const fallbackFare = getDefaultFareAmountByRoute(route || ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR, normalizedBusType);

    return { amount: fallbackFare, fare: fallbackFare, route, fareSource: "fallback" };
}

function getScheduleStops(schedule) {
    const forward = schedule?.forwardTrip || null;

    // Support both structures:
    // 1. pickupPoints/dropPoints at root level (Schedule model)
    // 2. pickupPoints/dropPoints inside forwardTrip (Bus model)
    let pickupPoints = Array.isArray(schedule?.pickupPoints) ? schedule.pickupPoints : [];
    if (!pickupPoints.length && forward?.pickupPoints) {
        pickupPoints = Array.isArray(forward.pickupPoints) ? forward.pickupPoints : [];
    }

    let dropPoints = Array.isArray(schedule?.dropPoints) ? schedule.dropPoints : [];
    if (!dropPoints.length && forward?.dropPoints) {
        dropPoints = Array.isArray(forward.dropPoints) ? forward.dropPoints : [];
    }

    const stops = [];

    if (forward?.from) {
        stops.push({
            name: forward.from,
            time: forward.departureTime || forward.startTime || "",
            order: 1,
        });
    }

    pickupPoints.forEach((stop, index) => {
        stops.push({
            name: stop?.name || "",
            time: stop?.time || "",
            order: typeof stop?.order === "number" ? stop.order : index + 2,
        });
    });

    dropPoints.forEach((stop, index) => {
        stops.push({
            name: stop?.name || "",
            time: stop?.time || "",
            order: typeof stop?.order === "number" ? stop.order : index + 2,
        });
    });

    if (forward?.to) {
        stops.push({
            name: forward.to,
            time: forward.arrivalTime || forward.endTime || "",
            order: 9999,
        });
    }

    return stops.filter((stop) => stop.name);
}

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const pickup = searchParams.get("pickup");
        const drop = searchParams.get("drop");
        const date = searchParams.get("date");

        if (!pickup || !drop || !date) {
            return NextResponse.json(
                { success: false, message: "pickup, drop and date are required" },
                { status: 400 }
            );
        }

        const dateRange = normalizeDateOnly(date);
        if (!dateRange) {
            return NextResponse.json(
                { success: false, message: "Invalid date format" },
                { status: 400 }
            );
        }

        // Try querying Schedule first
        let schedules = await Schedule.find({
            isActive: true,
            travelDate: {
                $gte: dateRange.start,
                $lte: dateRange.end,
            },
        }).lean();

        // If no Schedule documents found, try Bus documents
        // This handles the case where buses are added without schedules
        if (schedules.length === 0) {
            const buses = await Bus.find({
                status: "ACTIVE",
            }).lean();

            // Convert Bus documents to schedule-like format for processing
            schedules = buses.map((bus) => ({
                ...bus,
                _id: bus._id,
                travelDate: new Date(date), // Use the requested date
                isActive: true,
                busNumber: bus.busNumber,
                seatLayout: bus.seatLayout,
            }));
        }

        const filtered = [];

        for (const schedule of schedules) {
            const stops = getScheduleStops(schedule);

            const pickupIndex = stops.findIndex((s) => normalizeFareStopName(s?.name) === normalizeFareStopName(pickup));

            const dropIndex = stops.findIndex((s) => normalizeFareStopName(s?.name) === normalizeFareStopName(drop));

            if (pickupIndex === -1 || dropIndex === -1 || pickupIndex >= dropIndex) {
                continue;
            }

            const allBookings = await Booking.find({
                scheduleId: schedule._id,
                travelDate: date,
            }).lean();

            const bookedCount = allBookings.reduce((acc, item) => {
                if (item.bookingStatus !== "CANCELLED") {
                    return acc + (Array.isArray(item?.seats) ? item.seats.length : 0);
                }
                return acc;
            }, 0);

            const blockedCount = allBookings.reduce((acc, item) => {
                if (item.bookingStatus === "CANCELLED" && item.seatStatus === "blocked") {
                    return acc + (Array.isArray(item?.seats) ? item.seats.length : 0);
                }
                return acc;
            }, 0);

            const fareObj = await resolveFareAmount({
                pickup: stops[pickupIndex]?.name || pickup,
                drop: stops[dropIndex]?.name || drop,
                busType: schedule?.busType,
                schedule,
            });

            filtered.push({
                _id: schedule._id,
                busNumber: schedule?.busNumber || schedule?.vehicleNumber || "BUS",
                operatorName: schedule?.operatorName || "ShreeMorya",
                busType: schedule?.busType || "Non-AC",
                routeName:
                    schedule?.routeName ||
                    `${pickup} - ${drop}`,
                pickupName: stops[pickupIndex]?.name || pickup,
                pickupMarathi:
                    stops[pickupIndex]?.marathiName ||
                    stops[pickupIndex]?.marathi ||
                    "",
                dropName: stops[dropIndex]?.name || drop,
                dropMarathi:
                    stops[dropIndex]?.marathiName ||
                    stops[dropIndex]?.marathi ||
                    "",
                startTime:
                    stops[pickupIndex]?.time ||
                    stops[pickupIndex]?.departureTime ||
                    schedule?.startTime ||
                    "--:--",
                endTime:
                    stops[dropIndex]?.time ||
                    stops[dropIndex]?.arrivalTime ||
                    schedule?.endTime ||
                    "--:--",
                seatLayout: Number(schedule?.seatLayout || 39),
                ...fareObj,
                bookedCount,
                blockedCount,
                cabinCount: Number(schedule?.cabinCount || 0),
                tableCount: Number(schedule?.tableCount || 0),
            });
        }

        return NextResponse.json({
            success: true,
            data: filtered,
        });
    } catch (error) {
        console.error("GET /api/bookings/search-buses error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to search buses" },
            { status: 500 }
        );
    }
}