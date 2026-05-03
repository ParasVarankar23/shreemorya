import { sendBookingCancellation } from "@/lib/emailService";
import connectDB from "@/lib/mongodb";
import { generateVoucherCode } from "@/lib/voucherCode";
import Booking from "@/models/booking.model";
import Schedule from "@/models/schedule.model";
import User from "@/models/User.model";
import Voucher from "@/models/voucher.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

/* =========================================================
   HELPERS
========================================================= */

function normalizeGender(value = "") {
    const gender = String(value || "").trim().toLowerCase();
    return ["male", "female", "other"].includes(gender) ? gender : "";
}

function buildRefundObject({ amount = 0, actionType = "NO_REFUND", isBlockedSeat = false }) {
    const processedAt = new Date();

    if (isBlockedSeat) {
        return {
            amount: 0,
            mode: "NO_REFUND",
            success: false,
            processedAt,
        };
    }

    const safeAmount = Number(amount || 0);

    if (actionType === "REFUND_ORIGINAL") {
        return {
            amount: safeAmount,
            mode: "REFUND_ORIGINAL",
            success: true,
            processedAt,
        };
    }

    if (actionType === "ISSUE_VOUCHER") {
        return {
            amount: safeAmount,
            mode: "ISSUE_VOUCHER",
            success: true,
            processedAt,
        };
    }

    return {
        amount: 0,
        mode: "NO_REFUND",
        success: false,
        processedAt,
    };
}

function buildSeatItemsFromLegacyBooking(booking) {
    const seats = Array.isArray(booking?.seats) ? booking.seats : [];
    const topSeatStatus = String(booking?.seatStatus || "booked").toLowerCase();

    return seats.map((seatNo) => ({
        seatNo: String(seatNo),
        ticketNo: `${booking?.bookingCode || "BOOK"}-${String(seatNo)}`,
        passengerName:
            String(booking?.customerName || "").trim() || "Passenger",
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

function ensureSeatItemsOnBooking(booking) {
    if (Array.isArray(booking?.seatItems) && booking.seatItems.length > 0) {
        return booking.seatItems;
    }

    const converted = buildSeatItemsFromLegacyBooking(booking);
    booking.seatItems = converted;
    return booking.seatItems;
}

function getSeatCancelTargetList(body = {}, booking) {
    const singleSeat = String(body?.seatNo || "").trim();
    const multiSeats = Array.isArray(body?.seatNos)
        ? body.seatNos.map((s) => String(s || "").trim()).filter(Boolean)
        : [];

    const requested = [...new Set([singleSeat, ...multiSeats].filter(Boolean))];

    // If no seat passed => full booking cancel
    if (requested.length === 0) {
        const seatItems = ensureSeatItemsOnBooking(booking);
        return seatItems
            .filter((item) => {
                const status = String(item?.seatStatus || "").toLowerCase();
                return ["booked", "blocked"].includes(status);
            })
            .map((item) => String(item?.seatNo || ""));
    }

    return requested;
}

function recomputeBookingSummary(booking, lastActionType = "NO_REFUND") {
    const seatItems = ensureSeatItemsOnBooking(booking);

    const activeBooked = seatItems.filter(
        (item) => String(item?.seatStatus || "").toLowerCase() === "booked"
    );

    const activeBlocked = seatItems.filter(
        (item) => String(item?.seatStatus || "").toLowerCase() === "blocked"
    );

    const cancelledSeats = seatItems.filter(
        (item) => String(item?.seatStatus || "").toLowerCase() === "cancelled"
    );

    const totalRefundAmount = cancelledSeats.reduce(
        (sum, item) => sum + Number(item?.refund?.amount || 0),
        0
    );

    // Legacy seats field = only active booked + blocked (for old UI compatibility)
    booking.seats = [...activeBooked, ...activeBlocked].map((item) =>
        String(item?.seatNo || "")
    );

    // Recalculate payable only from booked seats
    booking.finalPayableAmount = Number(
        activeBooked.reduce((sum, item) => sum + Number(item?.fare || 0), 0).toFixed(2)
    );

    // Legacy top-level seatStatus (for compatibility)
    if (activeBlocked.length > 0 && activeBooked.length === 0) {
        booking.seatStatus = "blocked";
    } else if (activeBooked.length > 0) {
        booking.seatStatus = "booked";
    } else {
        booking.seatStatus = "cancelled";
    }

    // Booking status
    if (activeBooked.length === 0 && activeBlocked.length === 0) {
        booking.bookingStatus = "CANCELLED";
        booking.cancelledAt = new Date();
    } else if (cancelledSeats.length > 0) {
        booking.bookingStatus = "PARTIAL_CANCELLED";
    } else if (activeBooked.length > 0) {
        booking.bookingStatus = "CONFIRMED";
    } else {
        booking.bookingStatus = "CANCELLED";
    }

    // Top-level refund summary
    if (cancelledSeats.length > 0) {
        booking.refund = {
            amount: totalRefundAmount,
            mode:
                lastActionType === "REFUND_ORIGINAL"
                    ? "REFUND_ORIGINAL"
                    : lastActionType === "ISSUE_VOUCHER"
                        ? "ISSUE_VOUCHER"
                        : "NO_REFUND",
            success: ["REFUND_ORIGINAL", "ISSUE_VOUCHER"].includes(lastActionType),
            processedAt: new Date(),
        };
    }

    // Payment status
    if (lastActionType === "REFUND_ORIGINAL") {
        if (activeBooked.length === 0 && activeBlocked.length === 0) {
            booking.paymentStatus = "REFUNDED";
        } else {
            booking.paymentStatus = "PARTIAL_REFUNDED";
        }
    } else if (lastActionType === "ISSUE_VOUCHER") {
        booking.paymentStatus = "VOUCHER_ISSUED";
    } else {
        // NO_REFUND
        if (booking.paymentStatus === "PAID") {
            booking.paymentStatus = "PAID";
        } else if (!booking.paymentStatus) {
            booking.paymentStatus = "UNPAID";
        }
    }

    booking.cancelActionType = lastActionType;
}

/* =========================================================
   POST /api/bookings/[bookingId]/cancel
========================================================= */
export async function POST(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Allow admin/staff OR booking owner (user)
        const isAdminOrStaff = hasRole(authUser, ["admin", "staff"]);

        if (!isAdminOrStaff) {
            // If user role, allow only when booking belongs to them (match email or phone)
            if (authUser.role === "user") {
                // We'll check ownership after fetching booking below
            } else {
                return NextResponse.json({ success: false, message: "Forbidden: Admin/Staff/User only" }, { status: 403 });
            }
        }

        const { bookingId } = await params;
        const body = await request.json().catch(() => ({}));

        const actionType = body?.actionType || "NO_REFUND";

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        // If not admin/staff, enforce ownership for users
        if (!isAdminOrStaff && authUser.role === "user") {
            try {
                const user = await User.findById(authUser.userId).lean();
                const phone = (user?.phoneNumber || "").toString().trim();
                const email = (user?.email || "").toString().trim().toLowerCase();

                const bookingPhone = (booking.customerPhone || "").toString().trim();
                const bookingEmail = (booking.customerEmail || "").toString().trim().toLowerCase();

                if (!phone && !email) {
                    return NextResponse.json({ success: false, message: "Forbidden: cannot verify ownership" }, { status: 403 });
                }

                const ownerOk = (phone && phone === bookingPhone) || (email && email === bookingEmail);
                if (!ownerOk) {
                    return NextResponse.json({ success: false, message: "Forbidden: not booking owner" }, { status: 403 });
                }
            } catch (e) {
                return NextResponse.json({ success: false, message: "Forbidden: ownership check failed" }, { status: 403 });
            }
        }

        // Optional schedule fetch for email
        let schedule = null;
        try {
            if (booking?.scheduleId) {
                schedule = await Schedule.findById(booking.scheduleId).lean();
            }
        } catch (scheduleError) {
            console.warn("CANCEL_BOOKING_SCHEDULE_FETCH_ERROR:", scheduleError.message);
        }

        // Ensure seatItems available even for old bookings
        const seatItems = ensureSeatItemsOnBooking(booking);

        // Which seats to cancel?
        const targetSeatNos = getSeatCancelTargetList(body, booking);

        if (targetSeatNos.length === 0) {
            return NextResponse.json(
                { success: false, message: "No active seat found to cancel" },
                { status: 400 }
            );
        }

        const targetSeatSet = new Set(targetSeatNos.map(String));
        const notFoundSeats = [];
        const alreadyCancelledSeats = [];
        const cancelledNowSeats = [];

        for (const seatNo of targetSeatSet) {
            const seatItem = seatItems.find(
                (item) => String(item?.seatNo || "") === String(seatNo)
            );

            if (!seatItem) {
                notFoundSeats.push(String(seatNo));
                continue;
            }

            const currentSeatStatus = String(seatItem?.seatStatus || "").toLowerCase();

            if (currentSeatStatus === "cancelled") {
                alreadyCancelledSeats.push(String(seatNo));
                continue;
            }

            const isBlockedSeat = currentSeatStatus === "blocked";
            const seatFare = Number(seatItem?.fare || 0);

            const refund = buildRefundObject({
                amount: seatFare,
                actionType,
                isBlockedSeat,
            });

            // IMPORTANT:
            // blocked seat remains blocked
            // booked seat becomes cancelled
            seatItem.seatStatus = isBlockedSeat ? "blocked" : "cancelled";
            seatItem.cancelActionType = actionType;
            seatItem.cancelledAt = new Date();
            seatItem.refund = refund;

            cancelledNowSeats.push(String(seatNo));
        }

        if (notFoundSeats.length > 0 && cancelledNowSeats.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Seat(s) not found in booking: ${notFoundSeats.join(", ")}`,
                },
                { status: 404 }
            );
        }

        if (alreadyCancelledSeats.length > 0 && cancelledNowSeats.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Seat(s) already cancelled: ${alreadyCancelledSeats.join(", ")}`,
                },
                { status: 400 }
            );
        }

        // Recompute booking after partial/full cancellation
        recomputeBookingSummary(booking, actionType);

        await booking.save();

        /* =========================================================
           EMAIL SEND
        ========================================================= */
        try {
            const recipientEmail =
                booking.contactDetails?.email ||
                booking.customerEmail ||
                "";

            if (recipientEmail) {
                const bookingObject = booking.toObject();

                // Cancelled seat items only for email context
                const cancelledSeatItems = (bookingObject?.seatItems || []).filter((item) =>
                    targetSeatSet.has(String(item?.seatNo || ""))
                );

                await sendBookingCancellation(
                    recipientEmail,
                    booking.contactDetails?.fullName ||
                    booking.customerName ||
                    "Passenger",
                    {
                        ...bookingObject,
                        date: booking.travelDate,
                        travelDate: booking.travelDate,

                        // for compatibility
                        seats: Array.isArray(booking.seats) ? booking.seats : [],

                        // NEW
                        cancelledSeatItems,
                        cancelledSeats: cancelledSeatItems.map((item) => String(item?.seatNo || "")),

                        fare: booking.fare || 0,
                        finalPayableAmount: booking.finalPayableAmount || 0,

                        busNumber:
                            bookingObject?.busNumber ||
                            schedule?.busNumber ||
                            bookingObject?.busDetails?.busNumber ||
                            "--",

                        routeName:
                            bookingObject?.routeName ||
                            schedule?.routeName ||
                            bookingObject?.routeDetails?.routeName ||
                            "--",

                        pickupName: booking.pickupName || "",
                        pickupMarathi: booking.pickupMarathi || "",
                        pickupTime: booking.pickupTime || "",

                        dropName: booking.dropName || "",
                        dropMarathi: booking.dropMarathi || "",
                        dropTime: booking.dropTime || "",

                        paymentMethod: booking.paymentMethod || "OFFLINE_UNPAID",
                        paymentStatus: booking.paymentStatus || "UNPAID",

                        refund: booking.refund || null,
                    }
                );
            }
        } catch (mailError) {
            console.warn("BOOKING_CANCELLATION_EMAIL_ERROR:", mailError.message);
        }

        /* =========================================================
           RESPONSE MESSAGE
        ========================================================= */
        let message = "Booking updated successfully";

        if (cancelledNowSeats.length === 1) {
            message = `Seat ${cancelledNowSeats[0]} cancelled successfully`;
        } else if (cancelledNowSeats.length > 1) {
            message = `Seats ${cancelledNowSeats.join(", ")} cancelled successfully`;
        }

        if (alreadyCancelledSeats.length > 0) {
            message += ` (Already cancelled: ${alreadyCancelledSeats.join(", ")})`;
        }

        if (notFoundSeats.length > 0) {
            message += ` (Not found: ${notFoundSeats.join(", ")})`;
        }

        // If action was ISSUE_VOUCHER, attempt to create voucher for cancelled amount
        let createdVoucher = null;
        if (actionType === "ISSUE_VOUCHER") {
            try {
                const cancelledSeatItems = booking.seatItems.filter((item) =>
                    cancelledNowSeats.includes(String(item?.seatNo || ""))
                );

                const totalVoucherAmount = cancelledSeatItems.reduce(
                    (sum, item) => sum + Number(item?.refund?.amount || 0),
                    0
                );

                if (totalVoucherAmount > 0) {
                    // Generate voucher code via atomic helper
                    const voucherCode = await generateVoucherCode();

                    // Role-based expiry: users get 1 month, admins/staff get 1 year
                    const isUserIssuer = String(authUser?.role || "").toLowerCase() === "user";
                    const expiresAt = new Date(
                        Date.now() + (isUserIssuer ? 30 : 365) * 24 * 60 * 60 * 1000
                    );

                    const voucher = new Voucher({
                        voucherCode,
                        // If issued by a logged-in user, associate voucher.userId
                        userId: isUserIssuer ? authUser.userId : null,
                        guestName: booking.customerName || null,
                        guestPhoneNumber: booking.customerPhone || null,
                        guestEmail: booking.customerEmail || null,
                        sourceBookingId: booking._id,
                        originalAmount: Number(totalVoucherAmount || 0),
                        remainingAmount: Number(totalVoucherAmount || 0),
                        // Ensure newly issued voucher is active regardless of any pre-save checks
                        status: "ACTIVE",
                        expiresAt,
                        issueReason: `Issued for cancelled seats: ${cancelledNowSeats.join(", ")}`,
                        issuedBy: authUser?.userId || null,
                    });

                    await voucher.save();
                    createdVoucher = voucher.toObject ? voucher.toObject() : voucher;
                }
            } catch (vErr) {
                console.error("VOUCHER_CREATION_ERROR:", vErr);
            }
        }

        return NextResponse.json({
            success: true,
            message,
            data: booking,
            meta: {
                cancelledNowSeats,
                alreadyCancelledSeats,
                notFoundSeats,
                bookingStatus: booking.bookingStatus,
                paymentStatus: booking.paymentStatus,
            },
            voucher: createdVoucher,
        });
    } catch (error) {
        console.error("POST /api/bookings/[bookingId]/cancel error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to cancel booking",
            },
            { status: 500 }
        );
    }
}