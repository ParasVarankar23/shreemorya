import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import { NextResponse } from "next/server";

function generateBookingCode() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mon = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${dd}${mon}${rand}`;
}

function isBlockSeatRequest(payload = {}) {
    return Boolean(
        payload?.isBlockSeat ||
        payload?.seatStatus === "blocked" ||
        payload?.bookingStatus === "CANCELLED"
    );
}

function resolvePaymentStatus(paymentMode, isBlockSeat) {
    if (isBlockSeat) return "UNPAID";

    if (["ONLINE", "OFFLINE_CASH", "OFFLINE_UPI"].includes(paymentMode)) {
        return "PAID";
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

    return {
        scheduleId,
        travelDate,
        seats: normalizedSeats,
        bookingCode: generateBookingCode(),
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
        seatStatus: blockSeatMode ? "blocked" : seatStatus,
        bookingStatus: blockSeatMode ? "CANCELLED" : bookingStatus,
        paymentMethod: blockSeatMode ? "OFFLINE_UNPAID" : paymentMode,
        paymentStatus: resolvePaymentStatus(paymentMode, blockSeatMode),
        cancelActionType: blockSeatMode ? (cancelActionType || "NO_REFUND") : cancelActionType,
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