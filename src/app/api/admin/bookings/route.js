import { generateBookingCode } from "@/lib/bookingCode";
import { sendBookingConfirmation } from "@/lib/emailService";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import { NextResponse } from "next/server";

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

function buildBookingPayload({
    scheduleId,
    travelDate,
    normalizedSeats,
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
        expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
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

    return {
        scheduleId,
        travelDate,
        seats: normalizedSeats,
        bookingCode: generateBookingCode(travelDate),
        customerName: blockSeatMode ? "Blocked Seat" : customerName.trim(),
        customerPhone: blockSeatMode ? "BLOCKED" : customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        pickupName,
        pickupMarathi,
        pickupTime,
        dropName,
        dropMarathi,
        dropTime,
        fare: perSeatFare,
        finalPayableAmount: perSeatFare * normalizedSeats.length,
        seatStatus: resolvedSeatStatus,
        bookingStatus: resolvedBookingStatus,
        paymentMethod: resolvedPaymentMethod,
        paymentStatus: resolvedPaymentStatus,
        cancelActionType: blockSeatMode ? (cancelActionType || "NO_REFUND") : cancelActionType,
        expiresAt,
    };
}

export async function GET(request) {
    try {
        await connectDB();

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

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        const {
            scheduleId,
            travelDate,
            seats,
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
            paymentMode = "OFFLINE_UNPAID",
            seatStatus = "booked",
            bookingStatus = "CONFIRMED",
            cancelActionType = "",
            isBlockSeat = false,
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

        const blockSeatMode = isBlockSeatRequest({ isBlockSeat, seatStatus, bookingStatus });

        if (!blockSeatMode && (!customerName?.trim() || !customerPhone?.trim())) {
            return NextResponse.json(
                { success: false, message: "customerName and customerPhone are required" },
                { status: 400 }
            );
        }

        const normalizedSeats = seats.map(String);

        const existing = await Booking.find({
            scheduleId,
            travelDate,
            bookingStatus: { $ne: "CANCELLED" },
            seats: { $in: normalizedSeats },
        }).lean();

        if (existing.length > 0) {
            const occupied = existing.flatMap((item) => item.seats || []);
            return NextResponse.json(
                {
                    success: false,
                    message: `Seat(s) already booked: ${occupied.join(", ")}`,
                },
                { status: 409 }
            );
        }

        const perSeatFare = Number(fare || 0);

        if (perSeatFare <= 0 && !blockSeatMode) {
            // Warn but don't reject - allow 0 fare bookings
            console.warn(`Warning: Booking with 0 fare for seats: ${normalizedSeats.join(", ")}`);
        }

        const schedule = await Schedule.findById(scheduleId).lean();

        const booking = await Booking.create(
            buildBookingPayload({
                scheduleId,
                travelDate,
                normalizedSeats,
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
                paymentMode,
                seatStatus,
                bookingStatus,
                cancelActionType,
                isBlockSeat,
            })
        );

        if (booking.customerEmail) {
            try {
                const bookingPayload = {
                    ...(booking.toObject ? booking.toObject() : booking),
                    busNumber: schedule?.busNumber || "",
                    routeName: schedule?.routeName || "",
                    travelDate: booking.travelDate,
                    seats: booking.seats,
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
                console.warn("ADMIN_BOOKING_CONFIRMATION_EMAIL_ERROR:", emailError.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Booking created successfully",
            data: booking,
        });
    } catch (error) {
        console.error("POST /api/admin/bookings error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to create booking" },
            { status: 500 }
        );
    }
}