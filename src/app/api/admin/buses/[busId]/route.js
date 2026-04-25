import dbConnect from "@/lib/db";
import { getStopNameMarathi, normalizeStopName } from "@/lib/fare";
import Bus from "@/models/bus.model";
import { NextResponse } from "next/server";

function cleanString(v) {
    return String(v || "").trim();
}

function toDate(v) {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
}

function normalizePoint(point, index) {
    const name = normalizeStopName(cleanString(point?.name));
    return {
        name,
        nameMr: getStopNameMarathi(name) || cleanString(point?.nameMr),
        time: cleanString(point?.time),
        order: Number(point?.order || index + 1),
    };
}

function normalizeTrip(trip = {}) {
    const pickupPoints = (trip.pickupPoints || [])
        .filter((p) => cleanString(p?.name))
        .slice(0, 150)
        .map((p, i) => normalizePoint(p, i));

    const dropPoints = (trip.dropPoints || [])
        .filter((p) => cleanString(p?.name))
        .slice(0, 150)
        .map((p, i) => normalizePoint(p, i));

    return {
        from: normalizeStopName(cleanString(trip?.from)),
        departureTime: cleanString(trip?.departureTime),
        to: normalizeStopName(cleanString(trip?.to)),
        arrivalTime: cleanString(trip?.arrivalTime),
        pickupPoints,
        dropPoints,
    };
}

function autoGenerateReturnTrip(forwardTrip, existingReturnTrip = null) {
    const reversedPickup = [...(forwardTrip.dropPoints || [])]
        .reverse()
        .map((p, i) => ({
            name: p.name,
            nameMr: p.nameMr || getStopNameMarathi(p.name) || "",
            time: "",
            order: i + 1,
        }));

    const reversedDrop = [...(forwardTrip.pickupPoints || [])]
        .reverse()
        .map((p, i) => ({
            name: p.name,
            nameMr: p.nameMr || getStopNameMarathi(p.name) || "",
            time: "",
            order: i + 1,
        }));

    return {
        from: forwardTrip.to,
        departureTime: cleanString(existingReturnTrip?.departureTime),
        to: forwardTrip.from,
        arrivalTime: cleanString(existingReturnTrip?.arrivalTime),
        pickupPoints: reversedPickup,
        dropPoints: reversedDrop,
    };
}

function getTripByDirection(payload, direction) {
    return direction === "RETURN" ? payload.returnTrip : payload.forwardTrip;
}

function normalizeFareRule(rule, index, payload) {
    const direction = cleanString(rule?.tripDirection || "FORWARD").toUpperCase();
    const tripDirection = direction === "RETURN" ? "RETURN" : "FORWARD";

    const trip = getTripByDirection(payload, tripDirection);
    if (!trip) return null;

    const pickup = normalizeStopName(cleanString(rule?.pickup));
    const drop = normalizeStopName(cleanString(rule?.drop));

    const pickupList = trip.pickupPoints || [];
    const dropList = trip.dropPoints || [];

    const pickupPoint = pickupList.find((p) => p.name === pickup);
    const dropPoint = dropList.find((p) => p.name === drop);

    if (!pickupPoint || !dropPoint) return null;

    const startDate = toDate(rule?.startDate);
    const endDate = toDate(rule?.endDate);

    if (!startDate || !endDate) return null;

    return {
        tripDirection,
        pickup,
        pickupMr: getStopNameMarathi(pickup) || cleanString(rule?.pickupMr),
        pickupOrder: pickupPoint.order,
        drop,
        dropMr: getStopNameMarathi(drop) || cleanString(rule?.dropMr),
        dropOrder: dropPoint.order,
        fare: Number(rule?.fare || 0),
        startDate,
        endDate,
        applyToNextPickups: Boolean(rule?.applyToNextPickups),
        applyToPreviousDrops: Boolean(rule?.applyToPreviousDrops),
        isActive: rule?.isActive !== false,
    };
}

function normalizePayload(body = {}) {
    const forwardTrip = normalizeTrip(body.forwardTrip);

    let returnTrip = null;
    if (cleanString(body.tripType).toUpperCase() === "RETURN") {
        const autoGenerateReturn = body.autoGenerateReturn ?? true;

        if (autoGenerateReturn) {
            returnTrip = autoGenerateReturnTrip(forwardTrip, body.returnTrip);
        } else {
            returnTrip = normalizeTrip(body.returnTrip || {});
        }
    }

    const payload = {
        busNumber: cleanString(body.busNumber).toUpperCase(),
        busName: cleanString(body.busName),
        busType: cleanString(body.busType).toUpperCase() || "NON_AC",
        seatLayout: Number(body.seatLayout || 39),
        tripType: cleanString(body.tripType).toUpperCase() || "ONE_WAY",
        routeName: cleanString(body.routeName),
        autoGenerateReturn: body.autoGenerateReturn !== false,
        status: cleanString(body.status).toUpperCase() || "ACTIVE",
        forwardTrip,
        returnTrip,
        cabins: (body.cabins || [])
            .filter((c) => cleanString(c?.label))
            .slice(0, 10)
            .map((c) => ({
                label: cleanString(c.label).toUpperCase(),
                seatIds: Array.isArray(c?.seatIds) ? c.seatIds.map((s) => cleanString(s)).filter(Boolean) : [],
            })),
    };

    payload.fareRules = (body.fareRules || [])
        .map((rule, i) => normalizeFareRule(rule, i, payload))
        .filter(Boolean);

    return payload;
}

function validatePayload(payload) {
    if (!payload.busNumber) return "Bus number is required";
    if (!payload.busName) return "Bus name is required";
    if (!payload.routeName) return "Route name is required";

    if (!payload.forwardTrip?.from) return "Forward start point is required";
    if (!payload.forwardTrip?.to) return "Forward end point is required";

    if (payload.tripType === "RETURN") {
        if (!payload.returnTrip?.from) return "Return start point is required";
        if (!payload.returnTrip?.to) return "Return end point is required";
    }

    for (const rule of payload.fareRules) {
        if (rule.endDate < rule.startDate) {
            return `Fare rule date range invalid for ${rule.pickup} → ${rule.drop}`;
        }
    }

    return null;
}

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const { busId } = (await params) || {};
        if (!busId) {
            return NextResponse.json(
                { success: false, message: "Bus id is required" },
                { status: 400 }
            );
        }

        const item = await Bus.findById(busId).lean();

        if (!item) {
            return NextResponse.json(
                { success: false, message: "Bus not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            item,
        });
    } catch (error) {
        console.error("GET /api/admin/buses/[busId] error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch bus" },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();

        const { busId } = (await params) || {};
        if (!busId) {
            return NextResponse.json(
                { success: false, message: "Bus id is required" },
                { status: 400 }
            );
        }

        const body = await request.json();

        const payload = normalizePayload(body);
        const error = validatePayload(payload);

        if (error) {
            return NextResponse.json({ success: false, message: error }, { status: 400 });
        }

        const existingByNumber = await Bus.findOne({
            busNumber: payload.busNumber,
            _id: { $ne: busId },
        });

        if (existingByNumber) {
            return NextResponse.json(
                { success: false, message: "Bus number already exists" },
                { status: 409 }
            );
        }

        const updated = await Bus.findByIdAndUpdate(busId, payload, {
            new: true,
            runValidators: true,
        });

        if (!updated) {
            return NextResponse.json(
                { success: false, message: "Bus not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, item: updated, message: "Bus updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("PUT /api/admin/buses/[busId] error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update bus" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();

        const { busId } = (await params) || {};
        if (!busId) {
            return NextResponse.json(
                { success: false, message: "Bus id is required" },
                { status: 400 }
            );
        }

        const deleted = await Bus.findByIdAndDelete(busId);

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Bus not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Bus deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/admin/buses/[busId] error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete bus" },
            { status: 500 }
        );
    }
}