import connectDB from "@/lib/mongodb";
import Bus from "@/models/bus.model";
import Fare from "@/models/fare.model";
import Schedule from "@/models/schedule.model";
import { NextResponse } from "next/server";

/* =====================================================
   CONNECT DB
===================================================== */

await connectDB();

/* =====================================================
   GET ALL / SINGLE
===================================================== */

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const id = searchParams.get("id");

        /* ================= SINGLE ================= */

        if (id) {
            const fare = await Fare.findById(id);

            if (!fare) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Fare not found",
                    },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: fare,
            });
        }

        /* ================= ALL ================= */

        const fares = await Fare.find({
            isActive: true,
        }).sort({
            createdAt: -1,
        });

        return NextResponse.json({
            success: true,
            total: fares.length,
            data: fares,
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch fares",
            },
            { status: 500 }
        );
    }
}

/* =====================================================
   CREATE
===================================================== */

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            busId,
            tripDirection,
            pickupPointName,
            pickupPointOrder,
            dropPointName,
            dropPointOrder,
            fareAmount,
            fareType,
            validFrom,
            validTill,
            label,
            reason,
        } = body;

        /* ================= VALIDATION ================= */

        if (
            !busId ||
            !pickupPointName ||
            !dropPointName ||
            !fareAmount ||
            !validFrom ||
            !validTill
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All required fields are mandatory",
                },
                { status: 400 }
            );
        }

        /* ================= CHECK BUS ================= */

        const bus = await Bus.findById(busId);

        if (!bus) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Bus not found",
                },
                { status: 404 }
            );
        }

        /* ================= DERIVE ORDERS & TIMES FROM BUS ================= */

        function findPointInfo(points = [], name) {
            if (!name) return null;
            const idx = points.findIndex((p) => String(p.name || p).trim() === String(name).trim());
            if (idx === -1) return null;
            const p = points[idx];
            return {
                order: Number(p.order || idx + 1),
                time: p.time || "",
            };
        }

        let pickupInfo = null;
        let dropInfo = null;

        if ((tripDirection || "FORWARD") === "FORWARD") {
            const forward = bus.forwardTrip || {};
            pickupInfo = findPointInfo(forward.pickupPoints || [], pickupPointName);
            dropInfo = findPointInfo(forward.dropPoints || [], dropPointName);
        } else {
            const returnTrip = bus.returnTrip || null;

            if (returnTrip) {
                pickupInfo = findPointInfo(returnTrip.pickupPoints || [], pickupPointName);
                dropInfo = findPointInfo(returnTrip.dropPoints || [], dropPointName);
            } else {
                // derive from forward reversed
                const forward = bus.forwardTrip || {};
                const reversedPickup = (forward.dropPoints || []).slice().reverse();
                const reversedDrop = (forward.pickupPoints || []).slice().reverse();

                pickupInfo = findPointInfo(reversedPickup, pickupPointName);
                dropInfo = findPointInfo(reversedDrop, dropPointName);
            }
        }

        const pickupPointOrderFinal = pickupInfo ? pickupInfo.order : null;
        const dropPointOrderFinal = dropInfo ? dropInfo.order : null;

        const pickupPointTimeFinal = pickupInfo ? pickupInfo.time : "";
        const dropPointTimeFinal = dropInfo ? dropInfo.time : "";

        /* ================= DUPLICATE ================= */

        const existing = await Fare.findOne({
            busId,
            pickupPointName,
            dropPointName,
            tripDirection,
            isActive: true,
        });

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Fare rule already exists",
                },
                { status: 409 }
            );
        }

        /* ================= CREATE ================= */

        const fare = await Fare.create({
            busId,
            routeName: bus.routeName,
            tripDirection,

            pickupPointName,
            pickupPointOrder: pickupPointOrderFinal,
            pickupPointTime: pickupPointTimeFinal,

            dropPointName,
            dropPointOrder: dropPointOrderFinal,
            dropPointTime: dropPointTimeFinal,

            fareAmount,

            fareType: fareType || "REGULAR",

            validFrom,
            validTill,

            label: label || "",
            reason: reason || "",

            applyNextPickups: body.applyNextPickups || false,
            applyNextDrops: body.applyNextDrops || false,

            status: "ACTIVE",
            isActive: true,
        });

        // When a fare rule is created, update any existing schedules for this bus
        // within the fare's validity so booking/search will pick up the new effective fare.
        try {
            const vf = new Date(validFrom);
            const vt = new Date(validTill);

            await Schedule.updateMany(
                {
                    busId,
                    travelDate: { $gte: vf, $lte: vt },
                },
                {
                    $set: {
                        effectiveFare: Number(fareAmount),
                        fareType: fareType || "REGULAR",
                    },
                }
            );
        } catch (err) {
            console.warn("Failed to update schedules after fare create:", err);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Fare created successfully",
                data: fare,
            },
            { status: 201 }
        );
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create fare",
            },
            { status: 500 }
        );
    }
}

/* =====================================================
   UPDATE
===================================================== */

export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);

        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Fare ID is required",
                },
                { status: 400 }
            );
        }

        const body = await request.json();

        const fare = await Fare.findById(id);

        if (!fare) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Fare not found",
                },
                { status: 404 }
            );
        }

        /* ================= UPDATE ================= */

        fare.fareAmount =
            body.fareAmount || fare.fareAmount;

        fare.validFrom =
            body.validFrom || fare.validFrom;

        fare.validTill =
            body.validTill || fare.validTill;

        fare.fareType =
            body.fareType || fare.fareType;

        fare.label =
            body.label || fare.label;

        fare.reason =
            body.reason || fare.reason;

        if (typeof body.applyNextPickups !== "undefined") {
            fare.applyNextPickups = !!body.applyNextPickups;
        }

        if (typeof body.applyNextDrops !== "undefined") {
            fare.applyNextDrops = !!body.applyNextDrops;
        }

        fare.status =
            body.status || fare.status;

        await fare.save();

        return NextResponse.json({
            success: true,
            message: "Fare updated successfully",
            data: fare,
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update fare",
            },
            { status: 500 }
        );
    }
}

/* =====================================================
   DELETE
===================================================== */

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);

        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Fare ID required",
                },
                { status: 400 }
            );
        }

        const fare = await Fare.findById(id);

        if (!fare) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Fare not found",
                },
                { status: 404 }
            );
        }

        /* ================= SOFT DELETE ================= */

        fare.isActive = false;

        fare.status = "INACTIVE";

        await fare.save();

        return NextResponse.json({
            success: true,
            message: "Fare deleted successfully",
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete fare",
            },
            { status: 500 }
        );
    }
}