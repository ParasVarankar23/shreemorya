import { generateBookingCode } from "@/lib/bookingCode";
import { sendBookingConfirmation } from "@/lib/emailService";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Payment from "@/models/payment.model";
import Schedule from "@/models/schedule.model";
import SeatHold from "@/models/seat-hold.model";
import User from "@/models/User.model";
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
    // additional context to allow same-owner adjacency
    bookingsById = {},
    requesterPhone = "",
    requesterUserId = "",
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

        // If adjacent seat belongs to same user/phone as requester, allow mixed genders
        try {
            const adjBooking = bookingsById[String(adjacentExisting.bookingId)];
            const adjPhoneRaw = String((adjBooking && (adjBooking.customerPhone || adjBooking.phone || adjBooking.customerPhoneNumber)) || "");
            const adjPhone = adjPhoneRaw.replace(/\D/g, "").slice(-10);
            const reqPhone = String(requesterPhone || "").replace(/\D/g, "").slice(-10);
            const adjUserId = String((adjBooking && adjBooking.userId) || "");
            const reqUserId = String(requesterUserId || "");

            if (adjUserId && reqUserId && adjUserId === reqUserId) {
                continue;
            }

            if (reqPhone && adjPhone && reqPhone === adjPhone) {
                continue;
            }
        } catch (e) {
            // ignore lookup errors and fall through to default check
        }

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
    customerGender,
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
    userId,
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
        customerGender: blockSeatMode ? "" : (String(customerGender || "").trim() || ""),

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
        userId: userId || null,
    };
}

/* =========================================================
   GET /api/bookings
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

        const isAdminOrStaff = hasRole(authUser, ["admin", "staff"]);
        const isUser = String(authUser.role || "").toLowerCase() === "user";

        if (!isAdminOrStaff && !isUser) {
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

        let bookings = [];

        if (isUser) {
            // Prefer exact match by userId when available
            const qByUser = { scheduleId, travelDate: date, userId: authUser.userId };
            bookings = await Booking.find(qByUser).sort({ createdAt: -1 }).lean();

            // If no bookings found by userId, fallback to matching by phone/email for older bookings
            if (!bookings || bookings.length === 0) {
                let userDoc = null;
                try {
                    userDoc = await User.findById(authUser.userId).select("phoneNumber phone email").lean();
                } catch (e) {
                    userDoc = null;
                }

                const phone = (userDoc?.phoneNumber || userDoc?.phone || "").toString().trim();
                const email = (userDoc?.email || "").toString().trim();

                if (phone || email) {
                    const q = { scheduleId, travelDate: date, $or: [] };

                    if (phone) {
                        // Normalize to last 10 digits and match by regex to tolerate formats
                        const digits = phone.replace(/\D/g, "");
                        const last10 = digits.slice(-10);
                        if (last10) {
                            q.$or.push({ customerPhone: { $regex: `${last10}$` } });
                        } else {
                            q.$or.push({ customerPhone: phone });
                        }
                    }

                    if (email) {
                        q.$or.push({ customerEmail: email });
                    }

                    bookings = await Booking.find(q).sort({ createdAt: -1 }).lean();
                } else {
                    bookings = [];
                }
            }
        } else {
            bookings = await Booking.find({ scheduleId, travelDate: date }).sort({ createdAt: -1 }).lean();
        }

        return NextResponse.json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        console.error("GET /api/bookings error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to load bookings" },
            { status: 500 }
        );
    }
}

/* =========================================================
   POST /api/bookings
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

        const isAdminOrStaff = hasRole(authUser, ["admin", "staff"]);
        const isUser = String(authUser.role || "").toLowerCase() === "user";

        if (!isAdminOrStaff && !isUser) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin/Staff only" },
                { status: 403 }
            );
        }

        const body = await request.json();

        let {
            scheduleId,
            travelDate,
            seats,
            passengerDetails = [], // NEW
            customerName,
            customerPhone,
            customerGender = "",
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

        // If the requester is a normal user, enforce user-only rules and
        // auto-fill contact info from their profile when missing.
        if (isUser) {
            // users must pay online only
            if (String(paymentMode || "").toUpperCase() !== "ONLINE") {
                return NextResponse.json({ success: false, message: "Users may only create ONLINE bookings" }, { status: 403 });
            }

            // users cannot create blocked/offline bookings
            const blockSeatMode = isBlockSeatRequest({ isBlockSeat, seatStatus, bookingStatus });
            if (blockSeatMode) {
                return NextResponse.json({ success: false, message: "Users cannot block seats" }, { status: 403 });
            }

            // disallow force override from client for normal users
            if (body?.force) {
                return NextResponse.json({ success: false, message: "Users cannot force booking without hold" }, { status: 403 });
            }

            // attempt to fill contact details from user profile
            try {
                const userDoc = await User.findById(authUser.userId).lean();
                if (userDoc) {
                    if (!customerName || !String(customerName).trim()) {
                        customerName = userDoc.fullName || userDoc.fullname || customerName;
                    }
                    if (!customerPhone || !String(customerPhone).trim()) {
                        customerPhone = userDoc.phoneNumber || customerPhone || "";
                    }
                    if (!customerEmail || !String(customerEmail).trim()) {
                        customerEmail = (userDoc.email || customerEmail || "").toString().trim();
                    }
                }
            } catch (e) {
                console.warn("AUTO_FILL_USER_PROFILE_FAILED:", e?.message || e);
            }
        }

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

        // 2) Adjacent gender validation (allow when adjacent booking belongs to same user/phone)
        const bookingsById = (existingBookings || []).reduce((m, b) => {
            try {
                m[String(b._id)] = b;
            } catch (e) {
                // ignore
            }
            return m;
        }, {});

        const genderValidation = validateGenderAdjacency({
            occupiedSeatMap,
            normalizedSeats,
            normalizedPassengerDetails,
            isBlockSeat: blockSeatMode,
            bookingsById,
            requesterPhone: customerPhone || "",
            requesterUserId: authUser?.userId || "",
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

        let usedHolds = [];
        if (!force) {
            if (!holdId) {
                return NextResponse.json({ success: false, message: "Please hold the selected seats before creating booking" }, { status: 409 });
            }

            // Find the primary hold provided by client
            const primaryHold = await SeatHold.findById(holdId);
            if (!primaryHold || String(primaryHold.scheduleId) !== String(scheduleId) || primaryHold.status !== "ACTIVE" || new Date(primaryHold.expiresAt) <= now) {
                return NextResponse.json({ success: false, message: "Seat hold is missing or expired. Please hold seats again." }, { status: 409 });
            }

            // Start with the seats covered by the primary hold
            const covered = new Set((primaryHold.seatNumbers || []).map((x) => String(x)));

            // If primary hold doesn't cover all seats, try to find other active holds
            // owned by the same user or matching guest phone that can together cover missing seats.
            const missingAfterPrimary = normalizedSeats.filter((s) => !covered.has(String(s)));

            if (missingAfterPrimary.length > 0) {
                // Find additional active holds for this schedule owned by the same user/guest
                const extraQuery = {
                    scheduleId,
                    status: "ACTIVE",
                    expiresAt: { $gt: now },
                    _id: { $ne: primaryHold._id },
                };

                if (authUser && authUser.userId) {
                    extraQuery.userId = authUser.userId;
                } else if (customerPhone) {
                    extraQuery.guestPhoneNumber = String(customerPhone);
                }

                let extraHolds = [];
                try {
                    extraHolds = await SeatHold.find(extraQuery).lean();
                } catch (e) {
                    console.warn("FIND_EXTRA_HOLDS_ERROR:", e?.message || e);
                    extraHolds = [];
                }

                for (const h of extraHolds) {
                    for (const s of (h.seatNumbers || [])) covered.add(String(s));
                    // stop early if covered all
                    const stillMissing = normalizedSeats.filter((s) => !covered.has(String(s)));
                    if (stillMissing.length === 0) break;
                }

                const finalMissing = normalizedSeats.filter((s) => !covered.has(String(s)));
                if (finalMissing.length > 0) {
                    return NextResponse.json({ success: false, message: `Hold does not cover seat(s): ${finalMissing.join(", ")}` }, { status: 409 });
                }

                // If we get here, combine primary + extra holds as usedHolds
                usedHolds = [primaryHold._id, ...extraHolds.map((h) => h._id)];
            } else {
                usedHolds = [primaryHold._id];
            }

            // Verify ownership for primary hold (and note: extra holds were filtered by owner in query)
            const ownerOk = (primaryHold.userId && authUser && String(primaryHold.userId) === String(authUser.userId)) || (primaryHold.guestPhoneNumber && String(primaryHold.guestPhoneNumber) === String(customerPhone));
            if (!ownerOk) {
                return NextResponse.json({ success: false, message: "Seat hold belongs to another user" }, { status: 403 });
            }
        }

        // Create booking inside a transaction when supported. If transactions
        // are not available (e.g., standalone MongoDB), fall back to a
        // non-transactional create and still attempt to convert the seat hold.
        let booking = null;
        let session = null;
        let usedTransaction = false;

        try {
            session = await Booking.startSession().catch((err) => {
                console.warn("START_SESSION_ERROR:", err?.message || err);
                return null;
            });

            if (session) {
                try {
                    session.startTransaction();
                    usedTransaction = true;
                } catch (startErr) {
                    console.warn("START_TRANSACTION_NOT_SUPPORTED:", startErr?.message || startErr);
                    usedTransaction = false;
                }
            }

            const bookingPayload = await buildBookingPayload({
                scheduleId,
                travelDate,
                normalizedSeats,
                normalizedPassengerDetails,
                customerName,
                customerPhone,
                customerEmail,
                customerGender,
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
                userId: authUser?.userId || null,
            });

            if (usedTransaction && session) {
                const created = await Booking.create([bookingPayload], { session });
                booking = created[0];

                if (usedHolds && usedHolds.length > 0) {
                    for (const hid of usedHolds) {
                        await SeatHold.findByIdAndUpdate(
                            hid,
                            { status: "CONVERTED_TO_BOOKING", convertedBookingId: booking._id, isActive: false },
                            { session }
                        );
                    }
                }

                await session.commitTransaction();
            } else {
                // Non-transactional fallback
                booking = await Booking.create(bookingPayload);

                if (usedHolds && usedHolds.length > 0) {
                    for (const hid of usedHolds) {
                        try {
                            await SeatHold.findByIdAndUpdate(
                                hid,
                                { status: "CONVERTED_TO_BOOKING", convertedBookingId: booking._id, isActive: false }
                            );
                        } catch (holdErr) {
                            console.warn("FAILED_UPDATING_HOLD_AFTER_BOOKING:", holdErr?.message || holdErr);
                        }
                    }
                }
            }
        } catch (txErr) {
            try {
                if (session && usedTransaction) await session.abortTransaction();
            } catch (abortErr) {
                console.warn("ABORT_TRANSACTION_ERROR:", abortErr?.message || abortErr);
            }

            console.error("BOOKING_TRANSACTION_ERROR:", txErr);
            return NextResponse.json({ success: false, message: "Failed to create booking (transaction)" }, { status: 500 });
        } finally {
            try {
                if (session) session.endSession();
            } catch (endErr) {
                console.warn("END_SESSION_ERROR:", endErr?.message || endErr);
            }
        }

        // Create Payment record for offline paid bookings so admin aggregates include them
        try {
            const pm = String(booking?.paymentMethod || "").toUpperCase();
            const status = String(booking?.paymentStatus || "").toUpperCase();

            const isOffline = pm.startsWith("OFFLINE");
            const isPaid = ["PAID", "SUCCESS"].includes(status);

            if (isOffline && isPaid) {
                const provider = pm === "OFFLINE_UPI" ? "UPI" : pm === "OFFLINE_CASH" ? "CASH" : "MANUAL";

                const paymentData = {
                    bookingId: booking._id,
                    userId: authUser?.userId || null,
                    provider,
                    paymentMethod: booking?.paymentMethod || "OFFLINE",
                    paymentStatus: "PAID",
                    amount: Number(booking?.finalPayableAmount || booking?.fare || 0),
                    totalAmount: Number(booking?.finalPayableAmount || booking?.fare || 0),
                    finalPayableAmount: Number(booking?.finalPayableAmount || 0),
                    currency: "INR",
                    gatewayResponse: {},
                    paidAt: new Date(),
                    initiatedAt: new Date(),
                    createdBy: authUser?.userId || null,
                    isActive: true,
                };

                try {
                    await Payment.create(paymentData);
                } catch (pErr) {
                    console.warn("CREATE_OFFLINE_PAYMENT_ERROR:", pErr?.message || pErr);
                }
            }
        } catch (err) {
            console.warn("OFFLINE_PAYMENT_HANDLER_ERROR:", err?.message || err);
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
        console.error("POST /api/bookings error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to create booking" },
            { status: 500 }
        );
    }
}