import { generateBookingCode } from "@/lib/bookingCode";
import { sendBookingConfirmation } from "@/lib/emailService";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Schedule from "@/models/schedule.model";
import SeatHold from "@/models/seat-hold.model";
import Voucher from "@/models/voucher.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

/* =========================================================
   HELPERS
========================================================= */

function isBlockSeatRequest(payload = {}) {
    return Boolean(
        payload?.isBlockSeat ||
        payload?.seatStatus === "blocked" ||
        payload?.bookingStatus === "CANCELLED"
    );
}

function resolvePaymentStatus(paymentMode, isBlockSeat) {
    if (isBlockSeat) return "UNPAID";

    if (["OFFLINE_CASH", "OFFLINE_UPI"].includes(paymentMode)) {
        return "PAID";
    }

    if (paymentMode === "ONLINE") {
        return "UNPAID";
    }

    return "UNPAID";
}

function resolveFareValues({
    perSeatFare = 0,
    normalizedSeats = [],
    overrideTotalFare = null,
    isBlockSeat = false,
}) {
    const seatCount = normalizedSeats.length || 0;
    const basePerSeat = Number(perSeatFare || 0);

    if (isBlockSeat) {
        return {
            resolvedPerSeatFare: 0,
            resolvedFinalAmount: 0,
        };
    }

    const parsedOverride =
        overrideTotalFare === null ||
            overrideTotalFare === undefined ||
            overrideTotalFare === ""
            ? null
            : Number(overrideTotalFare);

    if (parsedOverride !== null && !Number.isNaN(parsedOverride) && parsedOverride >= 0) {
        return {
            resolvedPerSeatFare:
                seatCount > 0 ? Number((parsedOverride / seatCount).toFixed(2)) : 0,
            resolvedFinalAmount: Number(parsedOverride.toFixed(2)),
        };
    }

    return {
        resolvedPerSeatFare: basePerSeat,
        resolvedFinalAmount: Number((basePerSeat * seatCount).toFixed(2)),
    };
}

function generateTicketNo(bookingCode, seatNo) {
    const cleanSeat = String(seatNo).replace(/\s+/g, "").toUpperCase();
    return `${bookingCode}-${cleanSeat}`;
}

function getAdjacentSeat(seatNo) {
    const n = Number(seatNo);
    if (Number.isNaN(n)) return null;

    // Example:
    // 5 <-> 6
    // 7 <-> 8
    // 9 <-> 10
    return n % 2 === 0 ? String(n - 1) : String(n + 1);
}

function normalizePassengerDetails(passengerDetails = [], normalizedSeats = [], fallbackName = "") {
    const map = {};

    if (Array.isArray(passengerDetails)) {
        passengerDetails.forEach((item) => {
            const seatNo = String(item?.seatNo || "").trim();
            if (!seatNo) return;

            map[seatNo] = {
                seatNo,
                passengerName: String(item?.passengerName || fallbackName || "").trim(),
                passengerGender: String(item?.passengerGender || "")
                    .trim()
                    .toLowerCase(),
            };
        });
    }

    return normalizedSeats.map((seatNo) => ({
        seatNo: String(seatNo),
        passengerName: map[String(seatNo)]?.passengerName || fallbackName || "",
        passengerGender: ["male", "female", "other"].includes(
            map[String(seatNo)]?.passengerGender
        )
            ? map[String(seatNo)]?.passengerGender
            : "",
    }));
}

/**
 * Build occupied seat map from both:
 * - NEW seatItems structure
 * - OLD seats + seatStatus structure (backward compatibility)
 */
function buildOccupiedSeatMap(existingBookings = []) {
    const occupied = {}; // seatNo => { gender, bookingId, status }

    for (const booking of existingBookings) {
        const bookingStatus = String(booking?.bookingStatus || "").toUpperCase();

        // NEW STRUCTURE
        if (Array.isArray(booking?.seatItems) && booking.seatItems.length > 0) {
            for (const item of booking.seatItems) {
                const seatNo = String(item?.seatNo || "");
                const seatStatus = String(item?.seatStatus || "").toLowerCase();

                if (!seatNo) continue;
                if (!["booked", "blocked"].includes(seatStatus)) continue;

                occupied[seatNo] = {
                    gender: String(item?.passengerGender || "").toLowerCase(),
                    bookingId: String(booking?._id || ""),
                    status: seatStatus,
                };
            }
            continue;
        }

        // OLD STRUCTURE (fallback)
        const legacySeatStatus = String(booking?.seatStatus || "").toLowerCase();
        const isCancelledLegacy =
            legacySeatStatus === "cancelled" ||
            (bookingStatus === "CANCELLED" && legacySeatStatus !== "blocked");

        if (isCancelledLegacy) continue;

        const resolvedLegacyStatus = legacySeatStatus === "blocked" ? "blocked" : "booked";

        for (const seatNoRaw of booking?.seats || []) {
            const seatNo = String(seatNoRaw || "");
            if (!seatNo) continue;

            occupied[seatNo] = {
                gender: "",
                bookingId: String(booking?._id || ""),
                status: resolvedLegacyStatus,
            };
        }
    }

    return occupied;
}

/**
 * Validate seat conflicts
 */
function validateSeatAvailability({
    occupiedSeatMap = {},
    normalizedSeats = [],
}) {
    const conflicts = [];

    for (const seatNo of normalizedSeats) {
        const existing = occupiedSeatMap[String(seatNo)];
        if (existing && ["booked", "blocked"].includes(existing.status)) {
            conflicts.push(String(seatNo));
        }
    }

    if (conflicts.length > 0) {
        return {
            valid: false,
            message: `Seat(s) already booked/blocked: ${conflicts.join(", ")}`,
        };
    }

    return { valid: true };
}

/**
 * Gender adjacency rule:
 * - If adjacent seat already booked by male/female, new seat must match same gender
 * - BUT if adjacent seat is also being booked in SAME request, allow mixed genders
 */
function validateGenderAdjacency({
    occupiedSeatMap = {},
    normalizedSeats = [],
    normalizedPassengerDetails = [],
    isBlockSeat = false,
}) {
    if (isBlockSeat) return { valid: true };

    const requestedSeatSet = new Set(normalizedSeats.map(String));

    for (const passenger of normalizedPassengerDetails) {
        const seatNo = String(passenger?.seatNo || "");
        const gender = String(passenger?.passengerGender || "").toLowerCase();

        if (!seatNo || !gender) continue;

        const adjacentSeat = getAdjacentSeat(seatNo);
        if (!adjacentSeat) continue;

        // If adjacent seat is also in SAME booking request, allow
        if (requestedSeatSet.has(adjacentSeat)) {
            continue;
        }

        const adjacentExisting = occupiedSeatMap[adjacentSeat];

        if (!adjacentExisting) continue;
        if (adjacentExisting.status !== "booked") continue;

        const adjacentGender = String(adjacentExisting.gender || "").toLowerCase();

        // If old booking has no gender saved, skip restriction
        if (!adjacentGender) continue;

        if (adjacentGender !== gender) {
            return {
                valid: false,
                message: `Seat ${seatNo} cannot be booked because adjacent seat ${adjacentSeat} is already booked by a ${adjacentGender} passenger.`,
            };
        }
    }

    return { valid: true };
}

async function buildBookingPayload({
    scheduleId,
    travelDate,
    normalizedSeats,
    normalizedPassengerDetails,
    customerName,
    customerPhone,
    customerEmail,
    pickupName,
    pickupMarathi,
    pickupTime,
    dropName,
    dropMarathi,
    dropTime,
    perSeatFare,
    overrideTotalFare,
    paymentMode,
    seatStatus,
    bookingStatus,
    cancelActionType,
    isBlockSeat,
}) {
    const blockSeatMode = Boolean(isBlockSeat);

    let resolvedBookingStatus = bookingStatus;
    let resolvedPaymentStatus = resolvePaymentStatus(paymentMode, blockSeatMode);
    let resolvedPaymentMethod = paymentMode;
    let resolvedSeatStatus = seatStatus;
    let expiresAt = null;

    if (blockSeatMode) {
        resolvedSeatStatus = "blocked";
        resolvedBookingStatus = "CANCELLED";
        resolvedPaymentMethod = "OFFLINE_UNPAID";
        resolvedPaymentStatus = "UNPAID";
    } else if (paymentMode === "ONLINE") {
        resolvedSeatStatus = "booked";
        resolvedBookingStatus = "PENDING";
        resolvedPaymentMethod = "ONLINE";
        resolvedPaymentStatus = "UNPAID";
        expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    } else if (paymentMode === "OFFLINE_CASH") {
        resolvedSeatStatus = "booked";
        resolvedBookingStatus = "CONFIRMED";
        resolvedPaymentMethod = "OFFLINE_CASH";
        resolvedPaymentStatus = "PAID";
    } else if (paymentMode === "OFFLINE_UPI") {
        resolvedSeatStatus = "booked";
        resolvedBookingStatus = "CONFIRMED";
        resolvedPaymentMethod = "OFFLINE_UPI";
        resolvedPaymentStatus = "PAID";
    } else if (paymentMode === "OFFLINE_UNPAID") {
        resolvedSeatStatus = "booked";
        resolvedBookingStatus = "CONFIRMED";
        resolvedPaymentMethod = "OFFLINE_UNPAID";
        resolvedPaymentStatus = "UNPAID";
    }

    const { resolvedPerSeatFare, resolvedFinalAmount } = resolveFareValues({
        perSeatFare,
        normalizedSeats,
        overrideTotalFare,
        isBlockSeat: blockSeatMode,
    });

    const bookingCode = await generateBookingCode(travelDate);

    const seatItems = normalizedSeats.map((seatNo) => {
        const passenger = normalizedPassengerDetails.find(
            (p) => String(p.seatNo) === String(seatNo)
        );

        return {
            seatNo: String(seatNo),
            ticketNo: generateTicketNo(bookingCode, seatNo),
            passengerName: blockSeatMode
                ? "Blocked Seat"
                : passenger?.passengerName || customerName.trim(),
            passengerGender: blockSeatMode
                ? ""
                : passenger?.passengerGender || "",
            fare: blockSeatMode ? 0 : resolvedPerSeatFare,
            seatStatus: blockSeatMode ? "blocked" : "booked",
            cancelledAt: null,
            cancelActionType: blockSeatMode
                ? cancelActionType || "NO_REFUND"
                : "",
            refund: null,
        };
    });

    return {
        scheduleId,
        travelDate,

        // Keep old seats field for backward compatibility
        seats: normalizedSeats,

        // NEW seat-wise storage
        seatItems,

        bookingCode,
        customerName: blockSeatMode ? "Blocked Seat" : customerName.trim(),
        customerPhone: blockSeatMode ? "BLOCKED" : customerPhone.trim(),
        customerEmail: customerEmail.trim(),

        pickupName,
        pickupMarathi,
        pickupTime,
        dropName,
        dropMarathi,
        dropTime,

        fare: resolvedPerSeatFare,
        finalPayableAmount: resolvedFinalAmount,

        // Keep legacy top-level seatStatus for old UI compatibility
        seatStatus: resolvedSeatStatus,

        bookingStatus: resolvedBookingStatus,
        paymentMethod: resolvedPaymentMethod,
        paymentStatus: resolvedPaymentStatus,
        cancelActionType: blockSeatMode
            ? cancelActionType || "NO_REFUND"
            : cancelActionType,
        expiresAt,
    };
}

/* =========================================================
   GET /api/admin/bookings
========================================================= */
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

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin/Staff only" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const scheduleId = searchParams.get("scheduleId");
        const date = searchParams.get("date");

        if (!scheduleId || !date) {
            return NextResponse.json(
                { success: false, message: "scheduleId and date are required" },
                { status: 400 }
            );
        }

        const bookings = await Booking.find({
            scheduleId,
            travelDate: date,
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        console.error("GET /api/admin/bookings error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to load bookings" },
            { status: 500 }
        );
    }
}

/* =========================================================
   POST /api/admin/bookings
========================================================= */
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

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin/Staff only" },
                { status: 403 }
            );
        }

        const body = await request.json();

        const {
            scheduleId,
            travelDate,
            seats,
            passengerDetails = [], // NEW
            customerName,
            customerPhone,
            customerEmail = "",
            pickupName = "",
            pickupMarathi = "",
            pickupTime = "",
            dropName = "",
            dropMarathi = "",
            dropTime = "",
            fare = 0,
            overrideTotalFare = null,
            paymentMode = "OFFLINE_UNPAID",
            seatStatus = "booked",
            bookingStatus = "CONFIRMED",
            cancelActionType = "",
            isBlockSeat = false,
            voucherCode = "",
        } = body;

        if (!scheduleId || !travelDate) {
            return NextResponse.json(
                { success: false, message: "scheduleId and travelDate are required" },
                { status: 400 }
            );
        }

        if (!Array.isArray(seats) || seats.length === 0) {
            return NextResponse.json(
                { success: false, message: "At least one seat is required" },
                { status: 400 }
            );
        }

        const blockSeatMode = isBlockSeatRequest({
            isBlockSeat,
            seatStatus,
            bookingStatus,
        });

        if (!blockSeatMode && (!customerName?.trim() || !customerPhone?.trim())) {
            return NextResponse.json(
                { success: false, message: "customerName and customerPhone are required" },
                { status: 400 }
            );
        }

        const normalizedSeats = [...new Set(seats.map((seat) => String(seat).trim()))].filter(Boolean);

        if (normalizedSeats.length === 0) {
            return NextResponse.json(
                { success: false, message: "Valid seat(s) are required" },
                { status: 400 }
            );
        }

        const normalizedPassengerDetails = normalizePassengerDetails(
            passengerDetails,
            normalizedSeats,
            customerName?.trim() || ""
        );

        // Fetch all bookings for that schedule/date for proper conflict check
        const existingBookings = await Booking.find({
            scheduleId,
            travelDate,
        }).lean();

        const occupiedSeatMap = buildOccupiedSeatMap(existingBookings);

        // 1) Seat conflict validation
        const seatAvailabilityCheck = validateSeatAvailability({
            occupiedSeatMap,
            normalizedSeats,
        });

        if (!seatAvailabilityCheck.valid) {
            return NextResponse.json(
                {
                    success: false,
                    message: seatAvailabilityCheck.message,
                },
                { status: 409 }
            );
        }

        // 2) Adjacent gender validation
        const genderValidation = validateGenderAdjacency({
            occupiedSeatMap,
            normalizedSeats,
            normalizedPassengerDetails,
            isBlockSeat: blockSeatMode,
        });

        if (!genderValidation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    message: genderValidation.message,
                },
                { status: 409 }
            );
        }

        const perSeatFare = Number(fare || 0);

        const schedule = await Schedule.findById(scheduleId).lean();

        // Require seat hold unless admin forced override
        const { holdId = null, force = false } = body;
        const now = new Date();

        let usedHold = null;
        if (!force) {
            if (!holdId) {
                return NextResponse.json({ success: false, message: "Please hold the selected seats before creating booking" }, { status: 409 });
            }

            const hold = await SeatHold.findById(holdId);
            if (!hold || String(hold.scheduleId) !== String(scheduleId) || hold.status !== "ACTIVE" || new Date(hold.expiresAt) <= now) {
                return NextResponse.json({ success: false, message: "Seat hold is missing or expired. Please hold seats again." }, { status: 409 });
            }

            // Verify hold covers all requested seats
            const missing = normalizedSeats.filter((s) => !((hold.seatNumbers || []).map(String).includes(String(s))));
            if (missing.length > 0) {
                return NextResponse.json({ success: false, message: `Hold does not cover seat(s): ${missing.join(", ")}` }, { status: 409 });
            }

            // Verify ownership: allow if hold.userId matches authUser or guestPhone matches
            const ownerOk = (hold.userId && authUser && String(hold.userId) === String(authUser._id)) || (hold.guestPhoneNumber && String(hold.guestPhoneNumber) === String(customerPhone));
            if (!ownerOk) {
                return NextResponse.json({ success: false, message: "Seat hold belongs to another user" }, { status: 403 });
            }

            usedHold = hold;
        }

        // Create booking inside a transaction and convert hold -> booking
        let booking = null;
        const session = await Booking.startSession();
        try {
            session.startTransaction();

            const bookingPayload = await buildBookingPayload({
                scheduleId,
                travelDate,
                normalizedSeats,
                normalizedPassengerDetails,
                customerName,
                customerPhone,
                customerEmail,
                pickupName,
                pickupMarathi,
                pickupTime,
                dropName,
                dropMarathi,
                dropTime,
                perSeatFare,
                overrideTotalFare,
                paymentMode,
                seatStatus,
                bookingStatus,
                cancelActionType,
                isBlockSeat: blockSeatMode,
            });

            const created = await Booking.create([bookingPayload], { session });
            booking = created[0];

            if (usedHold) {
                await SeatHold.findByIdAndUpdate(usedHold._id, { status: "CONVERTED_TO_BOOKING", convertedBookingId: booking._id, isActive: false }, { session });
            }

            await session.commitTransaction();
        } catch (txErr) {
            await session.abortTransaction();
            console.error("BOOKING_TRANSACTION_ERROR:", txErr);
            return NextResponse.json({ success: false, message: "Failed to create booking (transaction)" }, { status: 500 });
        } finally {
            session.endSession();
        }

        if (booking.customerEmail && booking.bookingStatus === "CONFIRMED") {
            try {
                const bookingPayload = {
                    ...(booking.toObject ? booking.toObject() : booking),
                    busNumber: schedule?.busNumber || "",
                    routeName: schedule?.routeName || "",
                    travelDate: booking.travelDate,
                    seats: booking.seats,
                    seatItems: booking.seatItems || [],
                    fare: booking.fare,
                    paymentMethod: booking.paymentMethod,
                    paymentId: String(booking._id),
                    pickupMarathi: booking.pickupMarathi || "",
                    dropMarathi: booking.dropMarathi || "",
                };

                await sendBookingConfirmation(
                    booking.customerEmail,
                    booking.customerName || "Passenger",
                    bookingPayload
                );
            } catch (emailError) {
                console.warn(
                    "ADMIN_BOOKING_CONFIRMATION_EMAIL_ERROR:",
                    emailError.message
                );
            }
        }

        // If voucher code provided, attempt to apply voucher usage
        let voucherApplied = null;
        try {
            const code = String(voucherCode || "").trim();
            if (code) {
                const found = await Voucher.findOne({
                    voucherCode: { $regex: `^${code}$`, $options: "i" },
                    isActive: true,
                    remainingAmount: { $gt: 0 },
                });

                if (found) {
                    const amountToUse = Math.min(Number(found.remainingAmount || 0), Number(booking.finalPayableAmount || 0));

                    if (amountToUse > 0) {
                        // push usage entry
                        found.usedBookings = found.usedBookings || [];
                        found.usedBookings.push({
                            bookingId: booking._id,
                            amountUsed: Number(amountToUse),
                            usedAt: new Date(),
                        });

                        const newRemaining = Number((Number(found.remainingAmount || 0) - amountToUse).toFixed(2));
                        let voucherRemoved = false;

                        if (newRemaining <= 0) {
                            // Fully consumed — remove voucher to enforce one-time use
                            voucherRemoved = true;
                            // persist usedBookings first (optional) then delete
                            try {
                                await found.save();
                            } catch (saveErr) {
                                // ignore save error — proceed to delete
                            }
                            try {
                                await Voucher.findByIdAndDelete(found._id);
                            } catch (delErr) {
                                console.warn("Failed to delete consumed voucher:", delErr);
                            }
                        } else {
                            found.remainingAmount = newRemaining;
                            if (found.remainingAmount < found.originalAmount) {
                                found.status = "PARTIALLY_USED";
                            }
                            await found.save();
                        }

                        voucherApplied = { voucherId: found._id, voucherCode: found.voucherCode, amountUsed: amountToUse, voucherRemoved };
                    }
                }
            }
        } catch (vErr) {
            console.error("APPLY_VOUCHER_ERROR:", vErr.message || vErr);
        }

        return NextResponse.json({
            success: true,
            message: "Booking created successfully",
            data: booking,
            voucherApplied,
        });
    } catch (error) {
        console.error("POST /api/admin/bookings error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to create booking" },
            { status: 500 }
        );
    }
}