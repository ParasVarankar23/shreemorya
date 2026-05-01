import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import Payment from "@/models/payment.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

function parseDateSafe(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function normalizePaymentMethod(method = "", provider = "") {
    const pm = String(method || "").toUpperCase();
    const pv = String(provider || "").toUpperCase();

    if (pm === "OFFLINE_CASH" || pm === "CASH") return "CASH";
    if (pm === "OFFLINE_UPI" || pm === "UPI") return "UPI";

    if (pm === "ONLINE") {
        if (pv === "CASH") return "CASH";
        if (pv === "UPI") return "UPI";
        return "ONLINE";
    }

    if (pv === "CASH") return "CASH";
    if (pv === "UPI") return "UPI";
    if (pv === "RAZORPAY" || pv === "ONLINE") return "ONLINE";

    return "OTHER";
}

function getPaymentAmount(payment) {
    return Number(
        payment?.amount ??
        payment?.finalPayableAmount ??
        payment?.settlementAmount ??
        payment?.totalAmount ??
        0
    );
}

function getBookingCancelledAmount(booking) {
    const refundAmount = Number(
        booking?.refund?.amount ??
        booking?.refundAmount ??
        0
    );

    if (refundAmount > 0) return refundAmount;

    return Number(
        booking?.finalPayableAmount ??
        booking?.fare ??
        0
    );
}

function isBookingCancelled(booking) {
    const bookingStatus = String(booking?.bookingStatus || "").toUpperCase();
    const paymentStatus = String(booking?.paymentStatus || "").toUpperCase();

    return (
        bookingStatus === "CANCELLED" ||
        bookingStatus === "PARTIAL_CANCELLED" ||
        paymentStatus === "REFUNDED" ||
        paymentStatus === "PARTIAL_REFUNDED"
    );
}

function buildSearchRegex(value) {
    if (!value) return null;
    try {
        return new RegExp(value, "i");
    } catch {
        return null;
    }
}

export async function GET(request) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!hasRole(authUser, ["staff", "admin"])) {
            return NextResponse.json({ success: false, message: "Forbidden: Staff only" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search") || "";
        const bookingId = searchParams.get("bookingId") || "";
        const paymentStatus = searchParams.get("paymentStatus") || "";
        const paymentMethod = searchParams.get("paymentMethod") || "";
        const transactionType = searchParams.get("transactionType") || "";
        const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
        const limit = Math.max(parseInt(searchParams.get("limit") || "20", 10), 1);
        const from = searchParams.get("from") || "";
        const to = searchParams.get("to") || "";

        const fromDate = parseDateSafe(from);
        const toDate = parseDateSafe(to);

        const query = { isActive: true };

        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = fromDate;
            if (toDate) query.createdAt.$lte = toDate;
            if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
        }

        if (bookingId) query.bookingId = bookingId;
        if (transactionType) query.transactionType = transactionType;

        // If the caller is a staff (not admin), restrict to payments they created or belong to them
        if (authUser.role === "staff") {
            query.$or = [
                { createdBy: authUser.userId },
                { userId: authUser.userId },
            ];
        }

        if (search) {
            const regex = buildSearchRegex(search);
            if (regex) {
                query.$or = query.$or || [];
                query.$or.push(
                    { bookingId: regex },
                    { gatewayOrderId: regex },
                    { gatewayPaymentId: regex },
                    { gatewaySignature: regex },
                    { provider: regex },
                    { _id: regex }
                );
            }
        }

        const rawPayments = await Payment.find(query).sort({ createdAt: -1 }).lean();

        const bookingIds = rawPayments.map((p) => String(p?.bookingId || "")).filter(Boolean);
        const uniqueBookingIds = [...new Set(bookingIds)];

        const linkedBookings = uniqueBookingIds.length
            ? await Booking.find({ _id: { $in: uniqueBookingIds } }).lean()
            : [];

        const bookingMap = new Map(linkedBookings.map((b) => [String(b._id), b]));

        let rows = [];

        for (const payment of rawPayments) {
            const booking = bookingMap.get(String(payment?.bookingId || ""));
            const normalizedMethod = normalizePaymentMethod(payment?.paymentMethod, payment?.provider);

            const bookingCancelled = isBookingCancelled(booking);

            const effectiveStatus = bookingCancelled
                ? "CANCELLED"
                : String(payment?.paymentStatus || payment?.status || "").toUpperCase();

            const enrichedPayment = {
                ...payment,
                normalizedMethod,
                bookingCancelled,
                linkedBookingStatus: booking?.bookingStatus || "",
                bookingPaymentStatus: booking?.paymentStatus || "",
                bookingCode: booking?.bookingCode || "",
                bookingCancelledAt: booking?.cancelledAt || null,
                bookingCancelledAmount: bookingCancelled ? getBookingCancelledAmount(booking) : 0,
                effectiveStatus,
                displayStatus: effectiveStatus,
                displayMethod: normalizedMethod,
                displayTransaction: bookingCancelled
                    ? "Booking Cancelled"
                    : (payment?.gatewayPaymentId || payment?.gatewayOrderId || payment?.provider || payment?.transactionType || "-"),
            };

            if (paymentMethod) {
                const pmUpper = String(paymentMethod).toUpperCase();

                if (pmUpper === "OFFLINE_CASH" && enrichedPayment.normalizedMethod !== "CASH") continue;
                if (pmUpper === "OFFLINE_UPI" && enrichedPayment.normalizedMethod !== "UPI") continue;
                if (pmUpper === "ONLINE" && enrichedPayment.normalizedMethod !== "ONLINE") continue;
                if (pmUpper === "CANCELLED" && !bookingCancelled) continue;
            }

            if (paymentStatus) {
                const psUpper = String(paymentStatus).toUpperCase();

                if (psUpper === "CANCELLED") {
                    if (!bookingCancelled) continue;
                } else if (enrichedPayment.effectiveStatus !== psUpper) {
                    continue;
                }
            }

            rows.push(enrichedPayment);
        }

        if (search) {
            const regex = buildSearchRegex(search);
            if (regex) {
                rows = rows.filter((row) => {
                    return (
                        regex.test(String(row?._id || "")) ||
                        regex.test(String(row?.bookingId || "")) ||
                        regex.test(String(row?.bookingCode || "")) ||
                        regex.test(String(row?.gatewayPaymentId || "")) ||
                        regex.test(String(row?.gatewayOrderId || "")) ||
                        regex.test(String(row?.provider || "")) ||
                        regex.test(String(row?.normalizedMethod || ""))
                    );
                });
            }
        }

        rows.sort((a, b) => {
            const da = new Date(a?.paidAt || a?.createdAt || 0).getTime();
            const db = new Date(b?.paidAt || b?.createdAt || 0).getTime();
            return db - da;
        });

        /* =========================================================
           AGGREGATES
        ========================================================= */
        let grossCashAmount = 0;
        let grossCashCount = 0;

        let grossUpiAmount = 0;
        let grossUpiCount = 0;

        let grossOnlineAmount = 0;
        let grossOnlineCount = 0;

        let otherAmount = 0;
        let otherCount = 0;

        let paidCount = 0;
        let refundedAmount = 0;
        let refundedCount = 0;

        // Cancelled amount split by method
        let cancelledCashAmount = 0;
        let cancelledCashCount = 0;

        let cancelledUpiAmount = 0;
        let cancelledUpiCount = 0;

        let cancelledOnlineAmount = 0;
        let cancelledOnlineCount = 0;

        const cancelledBookingIds = new Set();

        for (const payment of rawPayments) {
            const booking = bookingMap.get(String(payment?.bookingId || ""));
            const method = normalizePaymentMethod(payment?.paymentMethod, payment?.provider);
            const amount = getPaymentAmount(payment);
            const status = String(payment?.paymentStatus || payment?.status || "").toUpperCase();

            // Gross collected payments
            if (["PAID", "SUCCESS"].includes(status)) {
                paidCount += 1;

                if (method === "CASH") {
                    grossCashAmount += amount;
                    grossCashCount += 1;
                } else if (method === "UPI") {
                    grossUpiAmount += amount;
                    grossUpiCount += 1;
                } else if (method === "ONLINE") {
                    grossOnlineAmount += amount;
                    grossOnlineCount += 1;
                } else {
                    otherAmount += amount;
                    otherCount += 1;
                }
            }

            // Direct payment refund records
            if (["REFUNDED", "PARTIAL_REFUNDED"].includes(status)) {
                refundedAmount += Number(payment?.refundAmount || 0);
                refundedCount += 1;
            }

            // Booking-level cancellation impact (only once per booking)
            if (booking && isBookingCancelled(booking)) {
                const bookingKey = String(booking._id);

                if (!cancelledBookingIds.has(bookingKey)) {
                    cancelledBookingIds.add(bookingKey);

                    const cancelledAmt = getBookingCancelledAmount(booking);

                    if (method === "CASH") {
                        cancelledCashAmount += cancelledAmt;
                        cancelledCashCount += 1;
                    } else if (method === "UPI") {
                        cancelledUpiAmount += cancelledAmt;
                        cancelledUpiCount += 1;
                    } else if (method === "ONLINE") {
                        cancelledOnlineAmount += cancelledAmt;
                        cancelledOnlineCount += 1;
                    }

                    // if refund not already counted in payment record, count from booking
                    if (!["REFUNDED", "PARTIAL_REFUNDED"].includes(status)) {
                        const bookingRefundAmount = Number(
                            booking?.refund?.amount ??
                            booking?.refundAmount ??
                            0
                        );

                        if (bookingRefundAmount > 0) {
                            refundedAmount += bookingRefundAmount;
                            refundedCount += 1;
                        }
                    }
                }
            }
        }

        const cancelledAmount = cancelledCashAmount + cancelledUpiAmount + cancelledOnlineAmount;

        const cancelledCount = cancelledCashCount + cancelledUpiCount + cancelledOnlineCount;

        const cashAmount = Math.max(0, grossCashAmount - cancelledCashAmount);
        const upiAmount = Math.max(0, grossUpiAmount - cancelledUpiAmount);
        const onlineAmount = Math.max(0, grossOnlineAmount - cancelledOnlineAmount);

        const cashCount = Math.max(0, grossCashCount - cancelledCashCount);
        const upiCount = Math.max(0, grossUpiCount - cancelledUpiCount);
        const onlineCount = Math.max(0, grossOnlineCount - cancelledOnlineCount);

        const totalRevenue = grossCashAmount + grossUpiAmount + grossOnlineAmount;
        const netRevenue = cashAmount + upiAmount + onlineAmount;

        const chartData = [
            { key: "CASH", label: "Cash", amount: cashAmount, count: cashCount },
            { key: "UPI", label: "UPI", amount: upiAmount, count: upiCount },
            { key: "ONLINE", label: "Online (Razorpay)", amount: onlineAmount, count: onlineCount },
            { key: "CANCELLED", label: "Cancelled", amount: cancelledAmount, count: cancelledCount },
        ];

        const aggregates = {
            totalRevenue,
            netRevenue,
            refundedAmount,
            refundedCount,
            paidCount,
            totalPaymentRecords: rawPayments.length,
            cancelled: { amount: cancelledAmount, count: cancelledCount },
            online: { amount: onlineAmount, count: onlineCount, provider: "RAZORPAY" },
            upi: { amount: upiAmount, count: upiCount },
            cash: { amount: cashAmount, count: cashCount },
            other: { amount: otherAmount, count: otherCount },
            totalFinal: totalRevenue,
            totalRefunded: refundedAmount,
            totalSettlement: 0,
            cancelledBookings: cancelledCount,
            byProvider: [
                { provider: "CASH", total: cashAmount, count: cashCount },
                { provider: "UPI", total: upiAmount, count: upiCount },
                { provider: "RAZORPAY", total: onlineAmount, count: onlineCount },
                { provider: "CANCELLED", total: cancelledAmount, count: cancelledCount },
            ],
            chartData,
        };

        const total = rows.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const skip = (page - 1) * limit;
        const paginatedRows = rows.slice(skip, skip + limit);

        return NextResponse.json({
            success: true,
            message: "Payments fetched successfully",
            data: paginatedRows,
            aggregates,
            pagination: { page, limit, total, totalPages },
        });
    } catch (error) {
        console.error("GET /api/staff/payments error:", error);
        return NextResponse.json({ success: false, message: error.message || "Failed to fetch payments" }, { status: 500 });
    }
}
