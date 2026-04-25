import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Schedule from "@/models/schedule.model";
import { NextResponse } from "next/server";

function normalizeStopName(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll(/\s+/g, " ");
}

function getScheduleStops(schedule) {
    const forward = schedule?.forwardTrip || null;
    const pickupPoints = Array.isArray(schedule?.pickupPoints) ? schedule.pickupPoints : [];
    const dropPoints = Array.isArray(schedule?.dropPoints) ? schedule.dropPoints : [];

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

        const schedules = await Schedule.find({ isActive: true }).lean();

        const filtered = [];

        for (const schedule of schedules) {
            const stops = getScheduleStops(schedule);

            const pickupIndex = stops.findIndex((s) => {
                return normalizeStopName(s?.name) === normalizeStopName(pickup);
            });

            const dropIndex = stops.findIndex((s) => {
                return normalizeStopName(s?.name) === normalizeStopName(drop);
            });

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
                fare: Number(schedule?.effectiveFare || schedule?.baseFare || 0),
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
        console.error("GET /api/admin/bookings/search-buses error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to search buses" },
            { status: 500 }
        );
    }
}