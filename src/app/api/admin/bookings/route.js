import { generateBookingCode } from "@/lib/bookingCode";
import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Fare from "@/models/fare.model";
import Payment from "@/models/payment.model";
import Schedule from "@/models/schedule.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

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
        // Treat pending + confirmed admin bookings as occupying seats
        bookingStatus: { $in: ["PENDING", "CONFIRMED"] },
    }).select("passengers");

    return bookings.flatMap((b) =>
        (b.passengers || []).map((p) => Number(p.seatNumber))
    );
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
                { "contactDetails.fullName": { $regex: search, $options: "i" } },
                {
                    "contactDetails.phoneNumber": {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    "contactDetails.email": {
                        $regex: search,
                        $options: "i",
                    },
                },
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
            contactDetails: rawContactDetails,
            passengers: rawPassengers = [], // [{ seatNumber, fullName, age, gender, isPrimary? }]
            // legacy fields support
            seatNumbers: legacySeatNumbers = [],
            customerName,
            customerPhone,
            customerEmail = "",
            customerGender = "other",
            bookingSource = "ADMIN",
            paymentMethod = "CASH", // CASH | UPI | BANK_TRANSFER | RAZORPAY | NONE
            amountPaid = 0,
            notes = "",
        } = body;

        // Normalize contactDetails (support both new and legacy body)
        const contactDetails = rawContactDetails ||
            (customerName && customerPhone
                ? {
                    fullName: customerName,
                    phoneNumber: customerPhone,
                    email: customerEmail || "",
                }
                : null);

        // Normalize passengers (support both new and legacy body)
        let passengers = Array.isArray(rawPassengers) ? rawPassengers : [];

        if (
            !passengers.length &&
            Array.isArray(legacySeatNumbers) &&
            legacySeatNumbers.length
        ) {
            passengers = legacySeatNumbers.map((seat, index) => ({
                seatNumber: seat,
                fullName: customerName || `Passenger ${index + 1}`,
                age: 30,
                gender: customerGender || "other",
                isPrimary: index === 0,
            }));
        }

        if (
            !scheduleId ||
            !pickupPointOrder ||
            !dropPointOrder ||
            !Array.isArray(passengers) ||
            passengers.length === 0 ||
            !contactDetails ||
            !contactDetails.fullName ||
            !contactDetails.phoneNumber
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "scheduleId, pickupPointOrder, dropPointOrder, passengers, contactDetails.fullName and contactDetails.phoneNumber are required",
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

        const seatNumbers = passengers.map((p) => Number(p.seatNumber));

        // Validate passengers + seat numbers
        const missingPassenger = passengers.find(
            (p) =>
                !p.seatNumber ||
                !p.fullName ||
                p.age == null ||
                p.age === "" ||
                !p.gender
        );

        if (missingPassenger) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Each passenger must have seatNumber, fullName, age and gender",
                },
                { status: 400 }
            );
        }

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

        const uniqueSeatSet = new Set(seatNumbers);
        if (uniqueSeatSet.size !== seatNumbers.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Duplicate seat numbers are not allowed",
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
        const passengerCount = passengers.length;
        const totalAmount = Number(fareAmount) * passengerCount;
        const finalAmountPaid = Number(amountPaid || 0);

        // Normalize enums
        const allowedSources = ["ONLINE", "OFFLINE", "ADMIN", "STAFF"];
        const resolvedBookingSource = allowedSources.includes(bookingSource)
            ? bookingSource
            : "ADMIN";

        const allowedPaymentMethods = [
            "RAZORPAY",
            "CASH",
            "UPI",
            "BANK_TRANSFER",
            "NONE",
        ];
        const resolvedPaymentMethod = allowedPaymentMethods.includes(paymentMethod)
            ? paymentMethod
            : "CASH";

        let resolvedPaymentStatus = "UNPAID";
        if (finalAmountPaid <= 0) {
            resolvedPaymentStatus = "UNPAID";
        } else if (finalAmountPaid > 0 && finalAmountPaid < totalAmount) {
            resolvedPaymentStatus = "PARTIAL";
        } else if (finalAmountPaid >= totalAmount) {
            resolvedPaymentStatus = "PAID";
        }

        let resolvedBookingStatus =
            resolvedPaymentStatus === "PAID" ? "CONFIRMED" : "PENDING";

        const bookingCode = await generateBookingCode(schedule.travelDate);

        const booking = await Booking.create({
            bookingCode,

            userId: null, // manual guest/offline by default
            scheduleId: schedule._id,

            busId: schedule.busId,
            tripDirection: schedule.tripDirection,
            travelDate: schedule.travelDate,

            boardingPoint: pickupPoint.name,
            droppingPoint: dropPoint.name,

            contactDetails: {
                fullName: contactDetails.fullName,
                phoneNumber: contactDetails.phoneNumber,
                email: contactDetails.email || "",
            },

            passengers: passengers.map((p, index) => ({
                seatNumber: Number(p.seatNumber),
                fullName: p.fullName,
                age: Number(p.age),
                gender: p.gender,
                isPrimary:
                    typeof p.isPrimary === "boolean" ? p.isPrimary : index === 0,
            })),

            farePerSeat: fareAmount,
            totalAmount,
            voucherAppliedAmount: 0,
            couponAppliedAmount: 0,
            finalPayableAmount: totalAmount,

            appliedVoucherId: null,
            appliedCouponId: null,

            bookingSource: resolvedBookingSource,
            bookingStatus: resolvedBookingStatus,
            paymentStatus: resolvedPaymentStatus,
            paymentMethod: resolvedPaymentMethod,

            expiresAt: null,
            confirmedAt:
                resolvedBookingStatus === "CONFIRMED" ? new Date() : null,
            completedAt: null,

            seatChangeHistory: [],
            cancellation: {},

            notes,

            createdBy: authUser.userId,
            updatedBy: authUser.userId,
            isActive: true,
        });

        // Optional payment record
        if (finalAmountPaid > 0) {
            const getProviderAndMethod = (method) => {
                switch (method) {
                    case "RAZORPAY":
                        return { provider: "RAZORPAY", method: "ONLINE" };
                    case "CASH":
                        return { provider: "CASH", method: "OFFLINE" };
                    case "UPI":
                        return { provider: "UPI", method: "OFFLINE" };
                    case "BANK_TRANSFER":
                        return { provider: "BANK_TRANSFER", method: "OFFLINE" };
                    default:
                        return { provider: "MANUAL", method: "OFFLINE" };
                }
            };

            const { provider, method } = getProviderAndMethod(
                resolvedPaymentMethod
            );

            await Payment.create({
                bookingId: booking._id,
                userId: booking.userId || null,
                provider,
                method,
                paymentStatus:
                    resolvedPaymentStatus === "PAID" ? "PAID" : "PARTIAL",
                amount: finalAmountPaid,
                currency: "INR",
                totalAmount: booking.totalAmount,
                voucherAppliedAmount: booking.voucherAppliedAmount,
                couponAppliedAmount: booking.couponAppliedAmount,
                finalPayableAmount: booking.finalPayableAmount,
                createdBy: authUser.userId,
                updatedBy: authUser.userId,
                notes,
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