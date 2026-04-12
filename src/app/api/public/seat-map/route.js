import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Schedule from "@/models/schedule.model";
import Booking from "@/models/booking.model";
import Bus from "@/models/bus.model";

function normalizeDateOnly(dateInput) {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return null;

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

function getPointOrder(schedule, pointName) {
    const normalized = pointName.trim().toLowerCase();

    if (schedule.startPoint.trim().toLowerCase() === normalized) {
        return 0;
    }

    const pickup = schedule.pickupPoints.find(
        (p) => p.name.trim().toLowerCase() === normalized && p.isActive
    );
    if (pickup) return pickup.order;

    if (schedule.endPoint.trim().toLowerCase() === normalized) {
        return 999999;
    }

    const drop = schedule.dropPoints.find(
        (p) => p.name.trim().toLowerCase() === normalized && p.isActive
    );
    if (drop) return drop.order;

    return null;
}

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { pickup, destination, travelDate } = body;

        if (!pickup || !destination || !travelDate) {
            return NextResponse.json(
                { success: false, message: "pickup, destination and travelDate are required" },
                { status: 400 }
            );
        }

        const dateRange = normalizeDateOnly(travelDate);
        if (!dateRange) {
            return NextResponse.json(
                { success: false, message: "Invalid travelDate" },
                { status: 400 }
            );
        }

        const schedules = await Schedule.find({
            serviceDate: {
                $gte: dateRange.start,
                $lte: dateRange.end,
            },
            status: { $in: ["SCHEDULED", "ACTIVE"] },
        }).lean();

        if (!schedules.length) {
            return NextResponse.json({
                success: true,
                message: "No buses found",
                data: [],
            });
        }

        const scheduleIds = schedules.map((s) => s._id);

        const [buses, confirmedBookings] = await Promise.all([
            Bus.find({ _id: { $in: schedules.map((s) => s.busId) } })
                .select("busName busNumber busType seatLayout totalSeats")
                .lean(),
            Booking.find({
                scheduleId: { $in: scheduleIds },
                bookingStatus: "CONFIRMED",
            })
                .select("scheduleId passengers")
                .lean(),
        ]);

        const busMap = new Map(buses.map((b) => [String(b._id), b]));

        const bookedSeatCountMap = new Map();
        for (const booking of confirmedBookings) {
            const key = String(booking.scheduleId);
            const count = booking.passengers?.length || 0;
            bookedSeatCountMap.set(key, (bookedSeatCountMap.get(key) || 0) + count);
        }

        const results = schedules
            .filter((schedule) => {
                const pickupOrder = getPointOrder(schedule, pickup);
                const destinationOrder = getPointOrder(schedule, destination);

                return (
                    pickupOrder !== null &&
                    destinationOrder !== null &&
                    pickupOrder < destinationOrder
                );
            })
            .map((schedule) => {
                const bus = busMap.get(String(schedule.busId));
                const bookedCount = bookedSeatCountMap.get(String(schedule._id)) || 0;
                const seatsLeft = Math.max(0, schedule.seatCapacity - bookedCount);

                const boardingOptions = [
                    { name: schedule.startPoint, time: schedule.startTime, order: 0 },
                    ...schedule.pickupPoints
                        .filter((p) => p.isActive)
                        .map((p) => ({
                            name: p.name,
                            time: p.time,
                            order: p.order,
                            landmark: p.landmark,
                        })),
                ].filter((point) => point.name.toLowerCase() === pickup.trim().toLowerCase());

                const droppingOptions = [
                    ...schedule.dropPoints
                        .filter((p) => p.isActive)
                        .map((p) => ({
                            name: p.name,
                            time: p.time,
                            order: p.order,
                            landmark: p.landmark,
                        })),
                    { name: schedule.endPoint, time: schedule.endTime, order: 999999 },
                ].filter(
                    (point) => point.name.toLowerCase() === destination.trim().toLowerCase()
                );

                return {
                    scheduleId: schedule._id,
                    busId: schedule.busId,
                    busName: bus?.busName || "",
                    busNumber: bus?.busNumber || "",
                    busType: bus?.busType || "",
                    seatCapacity: schedule.seatCapacity,
                    routeName: schedule.routeName,
                    startPoint: schedule.startPoint,
                    startTime: schedule.startTime,
                    endPoint: schedule.endPoint,
                    endTime: schedule.endTime,
                    tripDirection: schedule.tripDirection,
                    effectiveFare: schedule.effectiveFare,
                    seatsLeft,
                    boardingOptions,
                    droppingOptions,
                    serviceDate: schedule.serviceDate,
                };
            });

        return NextResponse.json({
            success: true,
            message: results.length ? "Buses fetched successfully" : "No buses found",
            data: results,
        });
    } catch (error) {
        console.error("PUBLIC_SEARCH_BUSES_ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Failed to search buses", error: error.message },
            { status: 500 }
        );
    }
}