import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Schedule from "@/models/schedule.model";
import Fare from "@/models/fare.model";
import Payment from "@/models/payment.model";
import createAuditLog from "@/lib/createAuditLog";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { generateBookingCode } from "@/lib/bookingCode";

/* ------------------------------------------
   Helper: get exact fare for pickup -> drop
------------------------------------------- */
async function getExactFare({
    schedule,
    pickupPointOrder,
    dropPointOrder,
}) {
    const fareRule = await Fare.findOne({
        busId: schedule.busId,
        tripDirection: schedule.tripDirection,
        pickupPointOrder,
        dropPointOrder,
        isActive: true,
        status: "ACTIVE",
        validFrom: { $lte: schedule.travelDate },
        validTill: { $gte: schedule.travelDate },
    }).sort({
        validFrom: -1,
        createdAt: -1,
    });

    if (fareRule) {
        return {
            fareAmount: fareRule.fareAmount,
            fareRuleId: fareRule._id,
        };
    }

    return {
        fareAmount: schedule.effectiveFare,
        fareRuleId: null,
    };
}

/* ------------------------------------------
   Helper: get already booked seats
------------------------------------------- */
async function getBookedSeats(scheduleId) {
    const bookings = await Booking.find({
        scheduleId,
        isActive: true,
        bookingStatus: { $in: ["CONFIRMED", "PARTIAL"] },
    }).select("seatNumbers");

    return bookings.flatMap((b) => b.seatNumbers || []);
}

/* ------------------------------------------
   GET /api/admin/bookings
------------------------------------------- */
export async function GET(request) {
    try {
        await connectDB();

        const authUser = getAuthUserFromRequest(request);

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

        const search = searchParams.get("search") || "";
        const scheduleId = searchParams.get("scheduleId") || "";
        const bookingStatus = searchParams.get("bookingStatus") || "";
        const paymentStatus = searchParams.get("paymentStatus") || "";
        const travelDate = searchParams.get("travelDate") || "";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        const query = {
            isActive: true,
        };

        if (scheduleId) {
            query.scheduleId = scheduleId;
        }

        if (bookingStatus) {
            query.bookingStatus = bookingStatus;
        }

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        if (travelDate) {
            const start = new Date(travelDate);
            const end = new Date(travelDate);
            end.setHours(23, 59, 59, 999);

            query.travelDate = {
                $gte: start,
                $lte: end,
            };
        }

        if (search) {
            query.$or = [
                { bookingCode: { $regex: search, $options: "i" } },
                { customerName: { $regex: search, $options: "i" } },
                { customerPhone: { $regex: search, $options: "i" } },
                { customerEmail: { $regex: search, $options: "i" } },
                { busNumber: { $regex: search, $options: "i" } },
                { routeName: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Booking.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            message: "Bookings fetched successfully",
            data: bookings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/admin/bookings error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch bookings" },
            { status: 500 }
        );
    }
}

/* ------------------------------------------
   POST /api/admin/bookings
   Admin/Staff manual booking (offline or online)
------------------------------------------- */
export async function POST(request) {
    try {
        await connectDB();

        const authUser = getAuthUserFromRequest(request);

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
            pickupPointOrder,
            dropPointOrder,
            seatNumbers = [],
            customerName,
            customerPhone,
            customerEmail = "",
            customerGender = "other",
            bookingSource = "ADMIN",
            paymentMethod = "OFFLINE",
            paymentStatus = "UNPAID",
            amountPaid = 0,
            notes = "",
        } = body;

        if (
            !scheduleId ||
            !pickupPointOrder ||
            !dropPointOrder ||
            !seatNumbers.length ||
            !customerName ||
            !customerPhone
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "scheduleId, pickupPointOrder, dropPointOrder, seatNumbers, customerName, customerPhone are required",
                },
                { status: 400 }
            );
        }

        const schedule = await Schedule.findById(scheduleId);

        if (!schedule || !schedule.isActive) {
            return NextResponse.json(
                { success: false, message: "Schedule not found" },
                { status: 404 }
            );
        }

        if (!schedule.isBookingOpen || schedule.status !== "SCHEDULED") {
            return NextResponse.json(
                { success: false, message: "Booking is closed for this schedule" },
                { status: 400 }
            );
        }

        if (Number(pickupPointOrder) >= Number(dropPointOrder)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "pickupPointOrder must be less than dropPointOrder",
                },
                { status: 400 }
            );
        }

        // Validate seat numbers
        const invalidSeat = seatNumbers.find(
            (seat) => seat < 1 || seat > schedule.seatLayout
        );

        if (invalidSeat) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Invalid seat number: ${invalidSeat}`,
                },
                { status: 400 }
            );
        }

        // Check blocked seats
        const blockedSeats = schedule.seatRules
            .filter((rule) => rule.ruleType === "BLOCKED")
            .map((rule) => rule.seatNumber);

        const blockedSelected = seatNumbers.filter((seat) =>
            blockedSeats.includes(seat)
        );

        if (blockedSelected.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Blocked seats selected: ${blockedSelected.join(", ")}`,
                },
                { status: 400 }
            );
        }

        // Check already booked seats
        const bookedSeats = await getBookedSeats(schedule._id);

        const conflictingSeats = seatNumbers.filter((seat) =>
            bookedSeats.includes(seat)
        );

        if (conflictingSeats.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Seats already booked: ${conflictingSeats.join(", ")}`,
                },
                { status: 409 }
            );
        }

        const pickupPoint =
            schedule.pickupPoints.find(
                (p) => p.order === Number(pickupPointOrder)
            ) || null;

        const dropPoint =
            schedule.dropPoints.find(
                (d) => d.order === Number(dropPointOrder)
            ) || null;

        if (!pickupPoint) {
            return NextResponse.json(
                { success: false, message: "Pickup point not found in schedule" },
                { status: 400 }
            );
        }

        if (!dropPoint) {
            return NextResponse.json(
                { success: false, message: "Drop point not found in schedule" },
                { status: 400 }
            );
        }

        const { fareAmount, fareRuleId } = await getExactFare({
            schedule,
            pickupPointOrder: Number(pickupPointOrder),
            dropPointOrder: Number(dropPointOrder),
        });

        const totalFare = Number(fareAmount) * seatNumbers.length;
        const finalAmountPaid = Number(amountPaid || 0);

        let resolvedPaymentStatus = paymentStatus;

        if (finalAmountPaid <= 0) {
            resolvedPaymentStatus = "UNPAID";
        } else if (finalAmountPaid > 0 && finalAmountPaid < totalFare) {
            resolvedPaymentStatus = "PARTIAL";
        } else if (finalAmountPaid >= totalFare) {
            resolvedPaymentStatus = "PAID";
        }

        let resolvedBookingStatus = "CONFIRMED";
        if (resolvedPaymentStatus === "UNPAID" && paymentMethod === "OFFLINE") {
            resolvedBookingStatus = "PARTIAL";
        }

        const bookingCode = await generateBookingCode(schedule.travelDate);

        const booking = await Booking.create({
            bookingCode,

            userId: null, // manual guest/offline by default
            scheduleId: schedule._id,

            busId: schedule.busId,
            busNumber: schedule.busNumber,
            busName: schedule.busName,

            routeName: schedule.routeName,
            tripDirection: schedule.tripDirection,
            travelDate: schedule.travelDate,

            startPoint: schedule.startPoint,
            startTime: schedule.startTime,
            endPoint: schedule.endPoint,
            endTime: schedule.endTime,

            pickupPointName: pickupPoint.name,
            pickupPointOrder: pickupPoint.order,
            pickupPointTime: pickupPoint.time || "",

            dropPointName: dropPoint.name,
            dropPointOrder: dropPoint.order,
            dropPointTime: dropPoint.time || "",

            seatNumbers,
            totalSeats: seatNumbers.length,

            customerName,
            customerPhone,
            customerEmail,
            customerGender,

            farePerSeat: fareAmount,
            totalFare,

            discountAmount: 0,
            couponDiscountAmount: 0,
            voucherDiscountAmount: 0,

            finalPayableAmount: totalFare,
            amountPaid: finalAmountPaid,
            amountDue: Math.max(totalFare - finalAmountPaid, 0),

            fareRuleId,

            bookingStatus: resolvedBookingStatus,
            paymentStatus: resolvedPaymentStatus,
            paymentMethod,
            bookingSource,

            notes,

            createdBy: authUser.userId,
            updatedBy: authUser.userId,
            isActive: true,
        });

        // Optional payment record
        if (finalAmountPaid > 0) {
            await Payment.create({
                bookingId: booking._id,
                scheduleId: schedule._id,
                userId: null,
                amount: finalAmountPaid,
                currency: "INR",
                paymentMethod,
                paymentGateway: paymentMethod === "RAZORPAY" ? "RAZORPAY" : "OFFLINE",
                paymentStatus: resolvedPaymentStatus === "PAID" ? "CAPTURED" : "PENDING",
                transactionType: "BOOKING",
                referenceType: "BOOKING",
                referenceId: booking._id,
                createdBy: authUser.userId,
                updatedBy: authUser.userId,
                isActive: true,
            });
        }

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "CREATE_ADMIN_BOOKING",
                entityType: "BOOKING",
                entityId: booking._id,
                entityCode: booking.bookingCode,
                message: `Created admin booking ${booking.bookingCode}`,
                metadata: {
                    scheduleId: String(schedule._id),
                    seats: seatNumbers,
                },
                newValues: booking.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log create booking error:", auditError);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Booking created successfully",
                data: booking,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/admin/bookings error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to create booking",
            },
            { status: 500 }
        );
    }
}