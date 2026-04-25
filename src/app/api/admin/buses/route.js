import dbConnect from "@/lib/db";
import { getStopNameMarathi, normalizeStopName } from "@/lib/fare";
import Bus from "@/models/bus.model";
import { NextResponse } from "next/server";

function cleanString(v) {
    return String(v || "").trim();
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

function normalizePayload(body = {}) {
    const forwardTrip = normalizeTrip(body.forwardTrip);

    let returnTrip = null;
    if (cleanString(body.tripType).toUpperCase() === "RETURN") {
        if (body.autoGenerateReturn !== false) {
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

    return null;
}

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const q = cleanString(searchParams.get("q"));
        const seatLayout = cleanString(searchParams.get("seatLayout"));
        const status = cleanString(searchParams.get("status"));
        const page = Math.max(Number(searchParams.get("page") || 1), 1);
        const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 100);

        const filter = {};

        if (q) {
            filter.$or = [
                { busNumber: { $regex: q, $options: "i" } },
                { busName: { $regex: q, $options: "i" } },
                { routeName: { $regex: q, $options: "i" } },
            ];
        }

        if (seatLayout) filter.seatLayout = Number(seatLayout);
        if (status) filter.status = status.toUpperCase();

        const [items, total] = await Promise.all([
            Bus.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Bus.countDocuments(filter),
        ]);

        return NextResponse.json({
            success: true,
            items,
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

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const payload = normalizePayload(body);
        const error = validatePayload(payload);

        if (error) {
            return NextResponse.json({ success: false, message: error }, { status: 400 });
        }

        const existing = await Bus.findOne({ busNumber: payload.busNumber });
        if (existing) {
            return NextResponse.json(
                { success: false, message: "Bus number already exists" },
                { status: 409 }
            );
        }

        const created = await Bus.create(payload);

        return NextResponse.json(
            { success: true, item: created, message: "Bus created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/admin/buses error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to create bus" },
            { status: 500 }
        );
    }
}