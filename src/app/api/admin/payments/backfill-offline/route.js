import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Payment from "@/models/payment.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

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
                { success: false, message: "Forbidden" },
                { status: 403 }
            );
        }

        // Only PAID offline bookings
        const bookings = await Booking.find({
            paymentStatus: { $in: ["PAID", "SUCCESS"] },
            paymentMethod: { $in: ["OFFLINE_CASH", "OFFLINE_UPI", "CASH", "UPI"] },
        }).lean();

        let created = 0;
        let skipped = 0;
        const samples = [];

        for (const b of bookings) {
            // If payment already exists for this booking, skip
            const existing = await Payment.findOne({
                bookingId: b._id,
                isActive: true,
            }).lean();

            if (existing) {
                skipped += 1;
                continue;
            }

            const pm = String(b.paymentMethod || "").toUpperCase();

            const provider =
                pm === "OFFLINE_UPI" || pm === "UPI"
                    ? "UPI"
                    : pm === "OFFLINE_CASH" || pm === "CASH"
                        ? "CASH"
                        : "MANUAL";

            const amount = Number(b.finalPayableAmount || b.fare || 0);

            const paymentData = {
                bookingId: b._id,
                userId: b.userId || null,
                provider,
                paymentMethod: b.paymentMethod || "OFFLINE", // IMPORTANT FIX
                paymentStatus: "PAID",
                transactionType: "PAYMENT",
                amount,
                totalAmount: amount,
                finalPayableAmount: amount,
                currency: "INR",
                gatewayResponse: {},
                gatewayOrderId: "",
                gatewayPaymentId: "",
                gatewaySignature: "",
                paidAt: new Date(b.confirmedAt || b.createdAt || Date.now()),
                initiatedAt: new Date(b.createdAt || Date.now()),
                createdBy: authUser?._id || null,
                updatedBy: authUser?._id || null,
                isActive: true,
            };

            try {
                const doc = await Payment.create(paymentData);
                created += 1;

                if (samples.length < 10) {
                    samples.push({
                        bookingId: String(b._id),
                        bookingCode: b.bookingCode || "",
                        paymentId: String(doc._id),
                        paymentMethod: paymentData.paymentMethod,
                        amount,
                    });
                }
            } catch (err) {
                console.warn("BACKFILL_PAYMENT_CREATE_ERROR:", err?.message || err);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Offline payments backfill completed successfully",
            created,
            skipped,
            totalBookingsChecked: bookings.length,
            samples,
        });
    } catch (error) {
        console.error("BACKFILL_OFFLINE_ERROR:", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Backfill failed" },
            { status: 500 }
        );
    }
}