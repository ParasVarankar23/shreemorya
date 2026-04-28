"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Search,
    CalendarDays,
    RefreshCw,
    IndianRupee,
    Wallet,
    Smartphone,
    BadgeIndianRupee,
    Ban,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    Filter,
    Receipt,
    TicketX,
} from "lucide-react";
import CancelBookingModal from "../booking/CancelBookingModal";

/* =========================================================
   AUTH HEADER
========================================================= */
function getAuthHeaders() {
    if (typeof window === "undefined") return {};
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        "";

    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
}

/* =========================================================
   HELPERS
========================================================= */
function formatCurrency(value) {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatDateTime(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-IN", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}

function todayDate() {
    return new Date().toISOString().slice(0, 10);
}

function normalizeMethod(payment) {
    const paymentMethod = String(
        payment?.paymentMethod || payment?.method || ""
    ).toUpperCase();

    const provider = String(payment?.provider || "").toUpperCase();

    if (["OFFLINE_CASH", "CASH"].includes(paymentMethod)) return "CASH";
    if (["OFFLINE_UPI", "UPI"].includes(paymentMethod)) return "UPI";

    if (["ONLINE", "RAZORPAY"].includes(paymentMethod)) {
        if (provider === "CASH") return "CASH";
        if (provider === "UPI") return "UPI";
        return "ONLINE";
    }

    if (provider === "CASH") return "CASH";
    if (provider === "UPI") return "UPI";
    if (provider === "RAZORPAY") return "ONLINE";

    if (payment?.isCancelledRow) return "CANCELLED";

    return "OTHER";
}

function methodBadge(method) {
    if (method === "CASH") {
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
    if (method === "UPI") {
        return "bg-sky-50 text-sky-700 border border-sky-200";
    }
    if (method === "ONLINE") {
        return "bg-violet-50 text-violet-700 border border-violet-200";
    }
    if (method === "CANCELLED") {
        return "bg-red-50 text-red-700 border border-red-200";
    }
    return "bg-slate-100 text-slate-700 border border-slate-200";
}

function statusBadge(status) {
    const s = String(status || "").toUpperCase();

    if (["PAID", "SUCCESS"].includes(s)) {
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
    if (["REFUNDED", "PARTIAL_REFUNDED"].includes(s)) {
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
    if (["FAILED"].includes(s)) {
        return "bg-red-50 text-red-700 border border-red-200";
    }
    if (["CANCELLED"].includes(s)) {
        return "bg-red-50 text-red-700 border border-red-200";
    }
    return "bg-slate-100 text-slate-700 border border-slate-200";
}

/* =========================================================
   MAIN PAGE
========================================================= */
export default function AdminPaymentPage() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [payments, setPayments] = useState([]);
    const [aggregates, setAggregates] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    });

    const [filters, setFilters] = useState({
        search: "",
        paymentMethod: "",
        paymentStatus: "",
        from: "",
        to: "",
        page: 1,
        limit: 20,
    });

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [bookingDetail, setBookingDetail] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [error, setError] = useState("");

    // Cancel modal states
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelTarget, setCancelTarget] = useState(null);

    const fetchPayments = async (override = {}) => {
        try {
            setLoading(true);
            setError("");

            const next = { ...filters, ...override };
            const params = new URLSearchParams();

            Object.entries(next).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    params.set(key, String(value));
                }
            });

            const res = await fetch(`/api/admin/payments?${params.toString()}`, {
                headers: {
                    ...getAuthHeaders(),
                },
                cache: "no-store",
            });

            const json = await res.json();

            if (!res.ok || !json?.success) {
                throw new Error(json?.message || "Failed to load payments");
            }

            setPayments(Array.isArray(json?.data) ? json.data : []);
            setAggregates(json?.aggregates || null);
            setPagination(
                json?.pagination || {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 1,
                }
            );
        } catch (err) {
            console.error(err);
            setError(err?.message || "Failed to load payments");
            setPayments([]);
            setAggregates(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = () => {
        const next = { ...filters, page: 1 };
        setFilters(next);
        fetchPayments(next);
    };

    const handleClear = () => {
        const reset = {
            search: "",
            paymentMethod: "",
            paymentStatus: "",
            from: "",
            to: "",
            page: 1,
            limit: 20,
        };
        setFilters(reset);
        fetchPayments(reset);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > (pagination?.totalPages || 1)) return;
        const next = { ...filters, page: newPage };
        setFilters(next);
        fetchPayments(next);
    };

    const handleBackfillOffline = async () => {
        try {
            setSubmitting(true);

            const res = await fetch("/api/admin/payments/backfill-offline", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
            });

            const json = await res.json();

            if (!res.ok || !json?.success) {
                throw new Error(json?.message || "Backfill failed");
            }

            alert(
                `Offline payments synced successfully!\nCreated: ${json.created}\nSkipped: ${json.skipped}`
            );

            fetchPayments();
        } catch (err) {
            alert(err?.message || "Backfill failed");
        } finally {
            setSubmitting(false);
        }
    };

    const openViewModal = async (payment) => {
        try {
            setSelectedPayment(payment);
            setBookingDetail(null);
            setViewLoading(true);

            if (payment?.bookingId) {
                const res = await fetch(`/api/admin/bookings/${payment.bookingId}`, {
                    headers: getAuthHeaders(),
                });

                const json = await res.json();

                if (res.ok && json?.success && json?.data) {
                    setBookingDetail(json.data);
                }
            }
        } catch (err) {
            console.error("View booking fetch error:", err);
        } finally {
            setViewLoading(false);
        }
    };

    const openCancelModal = async (payment) => {
        try {
            let bookingData = null;

            if (payment?.bookingId) {
                const res = await fetch(`/api/admin/bookings/${payment.bookingId}`, {
                    headers: getAuthHeaders(),
                });

                const json = await res.json();

                if (res.ok && json?.success && json?.data) {
                    bookingData = json.data;
                }
            }

            // Prevent opening cancel modal if already cancelled
            const bookingAlreadyCancelled =
                String(bookingData?.bookingStatus || "").toUpperCase() === "CANCELLED" ||
                String(bookingData?.paymentStatus || "").toUpperCase() === "REFUNDED" ||
                String(payment?.bookingStatus || "").toUpperCase() === "CANCELLED" ||
                String(payment?.linkedBookingStatus || "").toUpperCase() === "CANCELLED" ||
                String(payment?.bookingPaymentStatus || "").toUpperCase() === "REFUNDED" ||
                !!payment?.bookingCancelled;

            if (bookingAlreadyCancelled) {
                alert("This booking is already cancelled.");
                return;
            }

            setCancelTarget({
                payment,
                booking: bookingData,
            });

            setCancelModalOpen(true);
        } catch (err) {
            console.error("Open cancel modal error:", err);
            alert("Failed to load booking details for cancellation");
        }
    };

    const handleCancelAction = async (actionType) => {
        try {
            if (!cancelTarget?.payment?.bookingId) {
                alert("Booking ID not found");
                return;
            }

            setCancelLoading(true);

            const res = await fetch(
                `/api/admin/bookings/${cancelTarget.payment.bookingId}/cancel`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders(),
                    },
                    body: JSON.stringify({
                        cancelActionType: actionType,
                    }),
                }
            );

            const json = await res.json();

            if (!res.ok || !json?.success) {
                throw new Error(json?.message || "Failed to cancel booking");
            }

            alert(json?.message || "Booking cancelled successfully");

            setCancelModalOpen(false);
            setCancelTarget(null);

            if (selectedPayment?.bookingId === cancelTarget?.payment?.bookingId) {
                setSelectedPayment(null);
                setBookingDetail(null);
            }

            fetchPayments();
        } catch (err) {
            console.error("Cancel booking error:", err);
            alert(err?.message || "Failed to cancel booking");
        } finally {
            setCancelLoading(false);
        }
    };

    const chartData = useMemo(() => {
        return (
            aggregates?.chartData || [
                {
                    key: "CASH",
                    label: "Cash",
                    amount: aggregates?.cash?.amount || 0,
                    count: aggregates?.cash?.count || 0,
                },
                {
                    key: "UPI",
                    label: "UPI",
                    amount: aggregates?.upi?.amount || 0,
                    count: aggregates?.upi?.count || 0,
                },
                {
                    key: "ONLINE",
                    label: "Online (Razorpay)",
                    amount: aggregates?.online?.amount || 0,
                    count: aggregates?.online?.count || 0,
                },
                {
                    key: "CANCELLED",
                    label: "Cancelled",
                    amount: aggregates?.cancelled?.amount || 0,
                    count: aggregates?.cancelled?.count || 0,
                },
            ]
        );
    }, [aggregates]);

    const maxChartAmount = Math.max(
        ...chartData.map((item) => Number(item.amount || 0)),
        1
    );

    return (
        <div className="min-h-screen bg-[#eef3f7] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1500px] space-y-6">
                {/* Header */}
                <div className="rounded-[28px] bg-gradient-to-r from-[#0b6b67] to-[#0f7a75] p-5 sm:p-6 shadow-[0_20px_60px_rgba(15,118,110,0.25)]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                                Morya Travels
                            </p>
                            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                                Payment History Dashboard
                            </h1>
                            <p className="mt-2 text-sm text-emerald-50/90 sm:text-base">
                                Track Cash, UPI, Online (Razorpay) and Cancelled bookings in one place
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleBackfillOffline}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 rounded-2xl bg-white/95 px-5 py-3 text-sm font-bold text-[#0b6b67] shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
                            >
                                <RefreshCw className={`h-4 w-4 ${submitting ? "animate-spin" : ""}`} />
                                {submitting ? "Syncing..." : "Sync Offline Payments"}
                            </button>

                            <button
                                onClick={() => fetchPayments()}
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b6b67]/10 text-[#0b6b67]">
                            <Filter className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Search & Filters</h2>
                            <p className="text-sm text-slate-500">Filter payment records by method, status and date</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-bold text-slate-700">Search</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) =>
                                            setFilters((prev) => ({ ...prev, search: e.target.value }))
                                        }
                                        placeholder="Search transaction / booking / gateway ID"
                                        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0b6b67] focus:bg-white"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="h-14 rounded-2xl bg-[#0b6b67] px-8 text-sm font-bold text-white transition hover:bg-[#095955]"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">Payment Method</label>
                            <select
                                value={filters.paymentMethod}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))
                                }
                                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none focus:border-[#0b6b67] focus:bg-white"
                            >
                                <option value="">All Methods</option>
                                <option value="OFFLINE_CASH">Cash</option>
                                <option value="OFFLINE_UPI">UPI</option>
                                <option value="ONLINE">Online (Razorpay)</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">Payment Status</label>
                            <select
                                value={filters.paymentStatus}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))
                                }
                                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none focus:border-[#0b6b67] focus:bg-white"
                            >
                                <option value="">All Status</option>
                                <option value="PAID">Paid</option>
                                <option value="SUCCESS">Success</option>
                                <option value="REFUNDED">Refunded</option>
                                <option value="PARTIAL_REFUNDED">Partial Refunded</option>
                                <option value="FAILED">Failed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-4">
                        <div className="lg:col-span-1">
                            <label className="mb-2 block text-sm font-bold text-slate-700">Start Date</label>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={filters.from}
                                    onChange={(e) =>
                                        setFilters((prev) => ({ ...prev, from: e.target.value }))
                                    }
                                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-[#0b6b67] focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <label className="mb-2 block text-sm font-bold text-slate-700">End Date</label>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={filters.to}
                                    onChange={(e) =>
                                        setFilters((prev) => ({ ...prev, to: e.target.value }))
                                    }
                                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-[#0b6b67] focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2 flex flex-wrap items-end gap-3">
                            <button
                                onClick={() => {
                                    const d = todayDate();
                                    const next = { ...filters, from: d, to: d, page: 1 };
                                    setFilters(next);
                                    fetchPayments(next);
                                }}
                                className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Today
                            </button>

                            <button
                                onClick={() => {
                                    const next = { ...filters, page: 1 };
                                    setFilters(next);
                                    fetchPayments(next);
                                }}
                                className="h-12 rounded-2xl bg-[#0b6b67] px-6 text-sm font-bold text-white hover:bg-[#095955]"
                            >
                                Apply Filters
                            </button>

                            <button
                                onClick={handleClear}
                                className="h-12 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={<IndianRupee className="h-6 w-6" />}
                        title="Total Revenue"
                        value={formatCurrency(aggregates?.totalRevenue || 0)}
                        subtitle="Cash + UPI + Online + Cancelled"
                        color="emerald"
                    />

                    <SummaryCard
                        icon={<Wallet className="h-6 w-6" />}
                        title="Net Revenue"
                        value={formatCurrency(aggregates?.netRevenue || 0)}
                        subtitle="Cash + UPI + Online"
                        color="teal"
                    />

                    <SummaryCard
                        icon={<Receipt className="h-6 w-6" />}
                        title="Refunded"
                        value={formatCurrency(aggregates?.refundedAmount || 0)}
                        subtitle={`${aggregates?.refundedCount || 0} refunded txn(s)`}
                        color="amber"
                    />

                    <SummaryCard
                        icon={<Ban className="h-6 w-6" />}
                        title="Cancelled Bookings"
                        value={String(aggregates?.cancelled?.count || 0)}
                        subtitle="Total cancelled bookings"
                        color="red"
                    />
                </div>

                {/* Method Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MethodCard
                        icon={<BadgeIndianRupee className="h-6 w-6" />}
                        title="Cash"
                        amount={aggregates?.cash?.amount || 0}
                        count={aggregates?.cash?.count || 0}
                        color="emerald"
                    />
                    <MethodCard
                        icon={<Smartphone className="h-6 w-6" />}
                        title="UPI"
                        amount={aggregates?.upi?.amount || 0}
                        count={aggregates?.upi?.count || 0}
                        color="sky"
                    />
                    <MethodCard
                        icon={<Wallet className="h-6 w-6" />}
                        title="Online (Razorpay)"
                        amount={aggregates?.online?.amount || 0}
                        count={aggregates?.online?.count || 0}
                        color="violet"
                    />
                    <MethodCard
                        icon={<Ban className="h-6 w-6" />}
                        title="Cancelled"
                        amount={aggregates?.cancelled?.amount || 0}
                        count={aggregates?.cancelled?.count || 0}
                        color="red"
                    />
                </div>

                {/* Visualization */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-3xl font-black text-slate-900">Revenue Visualization</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Cash, UPI, Online (Razorpay) and Cancelled comparison
                        </p>
                    </div>

                    <div className="space-y-6">
                        {chartData.map((item) => {
                            const amount = Number(item.amount || 0);
                            const percent = Math.max(6, Math.round((amount / maxChartAmount) * 100));

                            const barColor =
                                item.key === "CASH"
                                    ? "bg-emerald-500"
                                    : item.key === "UPI"
                                        ? "bg-sky-500"
                                        : item.key === "ONLINE"
                                            ? "bg-violet-500"
                                            : "bg-red-500";

                            return (
                                <div key={item.key}>
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <div className="text-lg font-bold text-slate-800">
                                            {item.label}{" "}
                                            <span className="text-slate-400">({item.count})</span>
                                        </div>
                                        <div className="text-2xl font-black text-slate-900">
                                            {formatCurrency(item.amount || 0)}
                                        </div>
                                    </div>

                                    <div className="h-5 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className={`h-full rounded-full ${barColor}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                    <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900">Payment Records</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Showing {payments.length} of {pagination?.total || 0} payment(s)
                            </p>
                        </div>

                        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-[#0b6b67]">
                            Modern Admin View
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[1350px] w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                                        Date
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                                        Booking / Ref
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                                        Amount
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                                        Method
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                                        Transaction
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                                            Loading payments...
                                        </td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                                            No payment records found
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => {
                                        const amount = Number(
                                            payment?.amount ??
                                            payment?.finalPayableAmount ??
                                            payment?.totalAmount ??
                                            0
                                        );

                                        const method =
                                            payment?.normalizedMethod || normalizeMethod(payment);

                                        const isCancelledRow = !!payment?.isCancelledRow;

                                        const isBookingAlreadyCancelled =
                                            isCancelledRow ||
                                            String(payment?.bookingStatus || "").toUpperCase() === "CANCELLED" ||
                                            String(payment?.linkedBookingStatus || "").toUpperCase() === "CANCELLED" ||
                                            String(payment?.bookingPaymentStatus || "").toUpperCase() === "REFUNDED" ||
                                            !!payment?.bookingCancelled;

                                        return (
                                            <tr
                                                key={payment._id}
                                                className={`border-t border-slate-100 ${isCancelledRow ? "bg-red-50/40" : ""
                                                    }`}
                                            >
                                                <td className="px-6 py-6 text-lg font-medium text-slate-700">
                                                    {formatDateTime(
                                                        payment?.paidAt ||
                                                        payment?.createdAt ||
                                                        payment?.initiatedAt
                                                    )}
                                                </td>

                                                <td className="px-6 py-6">
                                                    <div className="text-xl font-black text-slate-900">
                                                        {payment?.bookingCode ||
                                                            String(payment?.bookingId || "-")}
                                                    </div>
                                                    <div className="mt-1 text-sm text-slate-500">
                                                        {isCancelledRow
                                                            ? "Cancelled booking"
                                                            : payment?.gatewayPaymentId ||
                                                            payment?.gatewayOrderId ||
                                                            payment?._id}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-6 text-2xl font-black text-slate-900">
                                                    {formatCurrency(amount)}
                                                </td>

                                                <td className="px-6 py-6">
                                                    <span
                                                        className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${isBookingAlreadyCancelled
                                                                ? "bg-red-50 text-red-700 border border-red-200"
                                                                : statusBadge(payment?.paymentStatus)
                                                            }`}
                                                    >
                                                        {isBookingAlreadyCancelled
                                                            ? "CANCELLED"
                                                            : String(payment?.paymentStatus || "N/A").toUpperCase()}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-6">
                                                    <span
                                                        className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${isCancelledRow
                                                                ? "bg-red-50 text-red-700 border border-red-200"
                                                                : methodBadge(method)
                                                            }`}
                                                    >
                                                        {isCancelledRow ? "CANCELLED" : method}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-6 text-lg font-medium text-slate-700">
                                                    {isCancelledRow
                                                        ? "Booking Cancelled"
                                                        : payment?.gatewayPaymentId ||
                                                        payment?.gatewayOrderId ||
                                                        payment?._id}
                                                </td>

                                                <td className="px-6 py-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {!isCancelledRow && (
                                                            <button
                                                                onClick={() => openViewModal(payment)}
                                                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#0b6b67] hover:text-[#0b6b67]"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                View
                                                            </button>
                                                        )}

                                                        {!isBookingAlreadyCancelled && !isCancelledRow && (
                                                            <button
                                                                onClick={() => openCancelModal(payment)}
                                                                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                                                            >
                                                                <TicketX className="h-4 w-4" />
                                                                Cancel Booking
                                                            </button>
                                                        )}

                                                        {isBookingAlreadyCancelled && (
                                                            <span className="inline-flex items-center rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
                                                                Already Cancelled
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col gap-4 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="text-lg font-medium text-slate-700">
                            Page {pagination?.page || 1} of {pagination?.totalPages || 1}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePageChange((pagination?.page || 1) - 1)}
                                disabled={(pagination?.page || 1) <= 1}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-lg font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                Prev
                            </button>

                            <button
                                onClick={() => handlePageChange((pagination?.page || 1) + 1)}
                                disabled={(pagination?.page || 1) >= (pagination?.totalPages || 1)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-lg font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Payment Details</h3>
                                <p className="text-sm text-slate-500">Booking + payment information</p>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedPayment(null);
                                    setBookingDetail(null);
                                }}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-6 p-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoCard label="Payment ID" value={selectedPayment?._id} />
                                <InfoCard label="Booking ID" value={selectedPayment?.bookingId} />
                                <InfoCard
                                    label="Amount"
                                    value={formatCurrency(
                                        selectedPayment?.amount ??
                                        selectedPayment?.finalPayableAmount ??
                                        selectedPayment?.totalAmount ??
                                        0
                                    )}
                                />
                                <InfoCard
                                    label="Payment Method"
                                    value={normalizeMethod(selectedPayment)}
                                />
                                <InfoCard
                                    label="Payment Status"
                                    value={String(selectedPayment?.paymentStatus || "").toUpperCase()}
                                />
                                <InfoCard
                                    label="Provider"
                                    value={
                                        selectedPayment?.provider
                                            ? String(selectedPayment.provider).toUpperCase()
                                            : normalizeMethod(selectedPayment) === "ONLINE"
                                                ? "RAZORPAY"
                                                : "-"
                                    }
                                />
                                <InfoCard
                                    label="Gateway Payment ID"
                                    value={selectedPayment?.gatewayPaymentId || "-"}
                                />
                                <InfoCard
                                    label="Gateway Order ID"
                                    value={selectedPayment?.gatewayOrderId || "-"}
                                />
                            </div>

                            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <h4 className="text-xl font-black text-slate-900">Booking Details</h4>

                                    {bookingDetail && (
                                        <>
                                            {String(bookingDetail?.bookingStatus || "").toUpperCase() === "CANCELLED" ||
                                                String(bookingDetail?.paymentStatus || "").toUpperCase() === "REFUNDED" ? (
                                                <span className="inline-flex items-center rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
                                                    Already Cancelled
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => openCancelModal(selectedPayment)}
                                                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                                                >
                                                    <TicketX className="h-4 w-4" />
                                                    Cancel Booking
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {viewLoading ? (
                                    <p className="mt-4 text-sm font-semibold text-slate-500">
                                        Loading booking details...
                                    </p>
                                ) : bookingDetail ? (
                                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <InfoCard label="Booking Code" value={bookingDetail?.bookingCode || "-"} />
                                        <InfoCard label="Customer Name" value={bookingDetail?.customerName || "-"} />
                                        <InfoCard label="Customer Phone" value={bookingDetail?.customerPhone || "-"} />
                                        <InfoCard label="Travel Date" value={bookingDetail?.travelDate || "-"} />
                                        <InfoCard
                                            label="Seats"
                                            value={
                                                Array.isArray(bookingDetail?.seats)
                                                    ? bookingDetail.seats.join(", ")
                                                    : "-"
                                            }
                                        />
                                        <InfoCard
                                            label="Booking Status"
                                            value={bookingDetail?.bookingStatus || "-"}
                                        />
                                        <InfoCard
                                            label="Booking Payment Method"
                                            value={bookingDetail?.paymentMethod || "-"}
                                        />
                                        <InfoCard
                                            label="Booking Payment Status"
                                            value={bookingDetail?.paymentStatus || "-"}
                                        />
                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm font-semibold text-slate-500">
                                        Booking details not available
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Booking Modal */}
            <CancelBookingModal
                open={cancelModalOpen}
                seatNo={
                    Array.isArray(cancelTarget?.booking?.seats) && cancelTarget?.booking?.seats.length > 0
                        ? cancelTarget.booking.seats.join(", ")
                        : "-"
                }
                ticketNo={cancelTarget?.booking?.bookingCode || ""}
                passengerName={cancelTarget?.booking?.customerName || ""}
                passengerGender={cancelTarget?.booking?.customerGender || ""}
                loading={cancelLoading}
                onClose={() => {
                    if (cancelLoading) return;
                    setCancelModalOpen(false);
                    setCancelTarget(null);
                }}
                onRefundOriginal={() => handleCancelAction("REFUND_ORIGINAL")}
                onIssueVoucher={() => handleCancelAction("ISSUE_VOUCHER")}
                onMarkCancelled={() => handleCancelAction("MARK_CANCELLED")}
            />
        </div>
    );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */
function SummaryCard({ icon, title, value, subtitle, color = "emerald" }) {
    const map = {
        emerald: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700",
        teal: "from-teal-50 to-teal-100 border-teal-200 text-teal-700",
        amber: "from-amber-50 to-amber-100 border-amber-200 text-amber-700",
        red: "from-red-50 to-red-100 border-red-200 text-red-700",
    };

    return (
        <div className={`rounded-[24px] border bg-gradient-to-br p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] ${map[color]}`}>
            <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80">
                    {icon}
                </div>
            </div>
            <p className="mt-4 text-sm font-bold">{title}</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">{value}</h3>
            <p className="mt-2 text-xs font-semibold text-slate-500">{subtitle}</p>
        </div>
    );
}

function MethodCard({ icon, title, amount, count, color = "emerald" }) {
    const colorMap = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
        sky: "bg-sky-50 text-sky-700 border-sky-200",
        violet: "bg-violet-50 text-violet-700 border-violet-200",
        red: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${colorMap[color]}`}>
                    {icon}
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-bold border ${colorMap[color]}`}>
                    {count} txn(s)
                </div>
            </div>

            <p className="mt-4 text-sm font-bold text-slate-500">{title}</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">{formatCurrency(amount)}</h3>
        </div>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
            <div className="mt-2 break-all text-base font-bold text-slate-900">{value || "-"}</div>
        </div>
    );
}