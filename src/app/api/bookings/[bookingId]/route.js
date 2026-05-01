import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import User from "@/models/User.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

/* =========================================================
   HELPERS
========================================================= */

function normalizeGender(value = "") {
    const gender = String(value || "").trim().toLowerCase();
    return ["male", "female", "other"].includes(gender) ? gender : "";
}

function getAdjacentSeat(seatNo) {
    const n = Number(seatNo);
    if (Number.isNaN(n)) return null;

    // 5 <-> 6, 7 <-> 8, 9 <-> 10 ...
    return n % 2 === 0 ? String(n - 1) : String(n + 1);
}

function buildSeatItemsFromLegacyBooking(booking) {
    const seats = Array.isArray(booking?.seats) ? booking.seats : [];
    const topSeatStatus = String(booking?.seatStatus || "booked").toLowerCase();

    return seats.map((seatNo) => ({
        seatNo: String(seatNo),
        ticketNo: `${booking?.bookingCode || "BOOK"}-${String(seatNo)}`,
        passengerName:
            String(booking?.customerName || "").trim() ||
            "Passenger",
        passengerGender: normalizeGender(booking?.customerGender || ""),
        fare: Number(booking?.fare || 0),
        seatStatus:
            topSeatStatus === "blocked"
                ? "blocked"
                : topSeatStatus === "cancelled"
                    ? "cancelled"
                    : "booked",
        cancelledAt: booking?.cancelledAt || null,
        cancelActionType: booking?.cancelActionType || "",
        refund: booking?.refund || null,
    }));
}

function getEffectiveSeatItems(booking) {
    if (Array.isArray(booking?.seatItems) && booking.seatItems.length > 0) {
        return booking.seatItems;
    }

    return buildSeatItemsFromLegacyBooking(booking);
}

function getActiveSeatItems(booking) {
    const seatItems = getEffectiveSeatItems(booking);

    return seatItems.filter((item) => {
        const seatStatus = String(item?.seatStatus || "").toLowerCase();
        return seatStatus === "booked" || seatStatus === "blocked";
    });
}

function isFullyBlockedOrCancelled(booking) {
    const seatItems = getEffectiveSeatItems(booking);

    if (seatItems.length === 0) {
        const bookingStatus = String(booking?.bookingStatus || "").toUpperCase();
        const seatStatus = String(booking?.seatStatus || "").toLowerCase();

        return (
            bookingStatus === "CANCELLED" &&
            ["blocked", "cancelled"].includes(seatStatus)
        );
    }

    return seatItems.every((item) => {
        const status = String(item?.seatStatus || "").toLowerCase();
        return ["blocked", "cancelled"].includes(status);
    });
}

/**
 * Validate adjacent gender while editing seatItems
 * - if adjacent seat in SAME booking and both are updated => allow mixed
 * - if adjacent seat in SAME booking but not in request => check existing seatItems
 * - if adjacent seat in OTHER booking => check DB
 */
async function validateGenderAdjacencyForSeatItems({
    booking,
    nextSeatItems = [],
}) {
    const currentBookingId = String(booking?._id || "");

    const seatMap = {};
    nextSeatItems.forEach((item) => {
        const seatNo = String(item?.seatNo || "");
        if (!seatNo) return;

        seatMap[seatNo] = {
            gender: normalizeGender(item?.passengerGender || ""),
            seatStatus: String(item?.seatStatus || "booked").toLowerCase(),
        };
    });

    const requestedSeatSet = new Set(
        nextSeatItems.map((item) => String(item?.seatNo || "")).filter(Boolean)
    );

    for (const item of nextSeatItems) {
        const seatNo = String(item?.seatNo || "");
        const gender = normalizeGender(item?.passengerGender || "");
        const seatStatus = String(item?.seatStatus || "booked").toLowerCase();

        if (!seatNo || !gender || seatStatus !== "booked") continue;

        const adjacentSeat = getAdjacentSeat(seatNo);
        if (!adjacentSeat) continue;

        // 1) Adjacent seat exists in SAME booking
        const sameBookingAdjacent = seatMap[adjacentSeat];
        if (sameBookingAdjacent) {
            // If same booking adjacent seat is booked, allow mixed (same customer booking)
            continue;
        }

        // 2) Adjacent seat exists in OTHER booking
        const adjacentBooking = await Booking.findOne({
            _id: { $ne: currentBookingId },
            scheduleId: booking.scheduleId,
            travelDate: booking.travelDate,
            seatItems: {
                $elemMatch: {
                    seatNo: adjacentSeat,
                    seatStatus: "booked",
                },
            },
        }).lean();

        if (adjacentBooking) {
            const adjacentSeatItem = (adjacentBooking.seatItems || []).find(
                (s) =>
                    String(s?.seatNo || "") === adjacentSeat &&
                    String(s?.seatStatus || "").toLowerCase() === "booked"
            );

            const adjacentGender = normalizeGender(adjacentSeatItem?.passengerGender || "");

            // If old/unknown gender => skip restriction
            if (adjacentGender && adjacentGender !== gender) {
                return {
                    valid: false,
                    message: `Seat ${seatNo} cannot be updated because adjacent seat ${adjacentSeat} is already booked by a ${adjacentGender} passenger.`,
                };
            }
        }
    }

    return { valid: true };
}

/* =========================================================
   GET /api/bookings/[bookingId]
========================================================= */
export async function GET(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // allow admin/staff or booking owner
        const isAdminOrStaff = hasRole(authUser, ["admin", "staff"]);
        if (!isAdminOrStaff) {
            if (authUser.role === "user") {
                // will check ownership after loading booking
            } else {
                return NextResponse.json(
                    { success: false, message: "Forbidden: Admin/Staff/User only" },
                    { status: 403 }
                );
            }
        }

        const { bookingId } = await params;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        if (!isAdminOrStaff && authUser.role === "user") {
            try {
                const user = await User.findById(authUser.userId).lean();
                const phone = (user?.phoneNumber || "").toString().trim();
                const email = (user?.email || "").toString().trim().toLowerCase();

                const bookingPhone = (booking.customerPhone || "").toString().trim();
                const bookingEmail = (booking.customerEmail || "").toString().trim().toLowerCase();

                const ownerOk = (phone && phone === bookingPhone) || (email && email === bookingEmail);
                if (!ownerOk) {
                    return NextResponse.json(
                        { success: false, message: "Forbidden: not booking owner" },
                        { status: 403 }
                    );
                }
            } catch (err) {
                return NextResponse.json(
                    { success: false, message: "Forbidden: ownership check failed" },
                    { status: 403 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: "Booking fetched successfully",
            data: booking,
        });
    } catch (error) {
        console.error("GET /api/bookings/[bookingId] error:", error);

        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch booking" },
            { status: 500 }
        );
    }
}

/* =========================================================
   DELETE /api/bookings/[bookingId]
   Only allow delete if all seats are blocked/cancelled
========================================================= */
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin/Staff only" },
                { status: 403 }
            );
        }

        const { bookingId } = await params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        if (!isFullyBlockedOrCancelled(booking)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only fully blocked or fully cancelled bookings can be removed",
                },
                { status: 400 }
            );
        }

        const oldValues = booking.toObject();

        await booking.deleteOne();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "DELETE_BOOKING",
                entityType: "BOOKING",
                entityId: booking._id,
                entityCode: booking.bookingCode,
                message: `Deleted booking ${booking.bookingCode}`,
                oldValues,
                newValues: null,
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log delete booking error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Blocked/cancelled booking removed successfully",
        });
    } catch (error) {
        console.error("DELETE /api/bookings/[bookingId] error:", error);

        return NextResponse.json(
            { success: false, message: error.message || "Failed to remove booking" },
            { status: 500 }
        );
    }
}

/* =========================================================
   PUT /api/bookings/[bookingId]
   Update top-level booking + seatItems passenger details
========================================================= */
export async function PUT(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin/Staff only" },
                { status: 403 }
            );
        }

        const { bookingId } = await params;
        const body = await request.json();

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        const oldValues = booking.toObject();

        /* ------------------------------------------
           1) Update top-level fields
        ------------------------------------------- */
        const allowedTopLevelFields = [
            "customerName",
            "customerPhone",
            "customerEmail",
            "customerGender",
            "notes",
            "pickupName",
            "pickupMarathi",
            "pickupTime",
            "dropName",
            "dropMarathi",
            "dropTime",
        ];

        for (const key of allowedTopLevelFields) {
            if (key in body) {
                booking[key] = body[key];
            }
        }

        /* ------------------------------------------
           2) Update seatItems (NEW STRUCTURE)
           body.seatItems = [
             {
               seatNo,
               passengerName,
               passengerGender
             }
           ]
        ------------------------------------------- */
        let effectiveSeatItems = getEffectiveSeatItems(booking);

        // If booking has no seatItems but legacy booking exists, convert in-memory
        if (!Array.isArray(booking.seatItems) || booking.seatItems.length === 0) {
            booking.seatItems = effectiveSeatItems;
        }

        if (Array.isArray(body?.seatItems) && body.seatItems.length > 0) {
            const seatItemsMap = new Map(
                booking.seatItems.map((item) => [String(item?.seatNo || ""), item])
            );

            for (const incoming of body.seatItems) {
                const seatNo = String(incoming?.seatNo || "").trim();
                if (!seatNo) continue;

                const targetSeat = seatItemsMap.get(seatNo);
                if (!targetSeat) continue;

                if ("passengerName" in incoming) {
                    targetSeat.passengerName = String(incoming?.passengerName || "").trim();
                }

                if ("passengerGender" in incoming) {
                    targetSeat.passengerGender = normalizeGender(incoming?.passengerGender);
                }
            }

            // Validate gender adjacency after update
            const adjacencyCheck = await validateGenderAdjacencyForSeatItems({
                booking,
                nextSeatItems: booking.seatItems,
            });

            if (!adjacencyCheck.valid) {
                return NextResponse.json(
                    {
                        success: false,
                        message: adjacencyCheck.message,
                    },
                    { status: 409 }
                );
            }

            // Sync legacy seats field with active seats
            const activeSeatItems = getActiveSeatItems(booking);
            booking.seats = activeSeatItems.map((item) => String(item.seatNo));

            // Recalculate final amount only from active booked seats (not blocked)
            const activeBookedSeatItems = booking.seatItems.filter(
                (item) => String(item?.seatStatus || "").toLowerCase() === "booked"
            );

            booking.finalPayableAmount = Number(
                activeBookedSeatItems
                    .reduce((sum, item) => sum + Number(item?.fare || 0), 0)
                    .toFixed(2)
            );
        }

        /* ------------------------------------------
           3) Legacy support:
           if user updates only customerName and old booking has no seatItems,
           optionally reflect name/gender to booked seatItems created in-memory
        ------------------------------------------- */
        if (Array.isArray(booking.seatItems) && booking.seatItems.length > 0) {
            const topLevelNameUpdated = "customerName" in body;
            const topLevelGenderUpdated = "customerGender" in body;

            if (topLevelNameUpdated || topLevelGenderUpdated) {
                for (const item of booking.seatItems) {
                    const seatStatus = String(item?.seatStatus || "").toLowerCase();
                    if (seatStatus !== "booked") continue;

                    if (topLevelNameUpdated && !Array.isArray(body?.seatItems)) {
                        item.passengerName = String(booking.customerName || "").trim();
                    }

                    if (topLevelGenderUpdated && !Array.isArray(body?.seatItems)) {
                        item.passengerGender = normalizeGender(booking.customerGender);
                    }
                }
            }
        }

        booking.updatedBy = authUser.userId;

        await booking.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "UPDATE_BOOKING",
                entityType: "BOOKING",
                entityId: booking._id,
                entityCode: booking.bookingCode,
                message: `Updated booking ${booking.bookingCode}`,
                oldValues,
                newValues: booking.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log update booking error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Booking updated successfully",
            data: booking,
        });
    } catch (error) {
        console.error("PUT /api/bookings/[bookingId] error:", error);

        return NextResponse.json(
            { success: false, message: error.message || "Failed to update booking" },
            { status: 500 }
        );
    }
}