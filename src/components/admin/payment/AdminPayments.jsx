"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BadgeIndianRupee,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Filter,
    Loader2,
    ReceiptIndianRupee,
    Search,
    Wallet,
} from "lucide-react";

function getAccessToken() {
    if (typeof window === "undefined") return "";
    return (
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        ""
    );
}

function getAuthHeaders() {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatCurrency(amount) {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDateTime(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-IN");
}

function startOfDay(d) {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt.toISOString();
}

function endOfDay(d) {
    const dt = new Date(d);
    dt.setHours(23, 59, 59, 999);
    return dt.toISOString();
}

function getStatusBadgeClass(status = "") {
    const normalized = String(status).toUpperCase();

    if (normalized === "SUCCESS" || normalized === "PAID") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (normalized === "FAILED") {
        return "border-red-200 bg-red-50 text-red-700";
    }

    if (normalized === "PENDING" || normalized === "UNPAID") {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (normalized === "REFUNDED") {
        return "border-blue-200 bg-blue-50 text-blue-700";
    }

    return "border-slate-200 bg-slate-100 text-slate-700";
}

function getMethodBadgeClass(method = "") {
    const normalized = String(method).toUpperCase();

    if (normalized === "ONLINE") {
        return "border-violet-200 bg-violet-50 text-violet-700";
    }

    if (normalized === "OFFLINE_CASH") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (normalized === "OFFLINE_UPI") {
        return "border-sky-200 bg-sky-50 text-sky-700";
    }

    if (normalized === "OFFLINE_UNPAID") {
        return "border-slate-200 bg-slate-100 text-slate-700";
    }

    return "border-slate-200 bg-slate-100 text-slate-700";
}

function getPresetRange(preset, currentFrom = "", currentTo = "") {
    const now = new Date();
    let from = "";
    let to = "";

    if (preset === "today") {
        from = startOfDay(now);
        to = endOfDay(now);
    } else if (preset === "week") {
        const first = new Date(now);
        const day = first.getDay();
        const diff = day === 0 ? 6 : day - 1;
        first.setDate(first.getDate() - diff);
        from = startOfDay(first);
        to = endOfDay(now);
    } else if (preset === "month") {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        from = startOfDay(first);
        to = endOfDay(now);
    } else if (preset === "year") {
        const first = new Date(now.getFullYear(), 0, 1);
        from = startOfDay(first);
        to = endOfDay(now);
    } else if (preset === "custom") {
        from = currentFrom || "";
        to = currentTo || "";
    } else {
        from = "";
        to = "";
    }

    return { from, to };
}

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);

    const [filterMethod, setFilterMethod] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [preset, setPreset] = useState("today");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const range = getPresetRange(preset, dateFrom, dateTo);
        setDateFrom(range.from);
        setDateTo(range.to);
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preset]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filterMethod, filterStatus, dateFrom, dateTo]);

    const loadData = async (searchOverride) => {
        setLoading(true);

        try {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", String(limit));

            const searchValue =
                typeof searchOverride === "string" ? searchOverride : search;

            if (filterMethod) params.set("paymentMethod", filterMethod);
            if (filterStatus) params.set("paymentStatus", filterStatus);
            if (searchValue.trim()) params.set("search", searchValue.trim());
            if (dateFrom) params.set("from", dateFrom);
            if (dateTo) params.set("to", dateTo);

            const res = await fetch(`/api/admin/payments?${params.toString()}`, {
                headers: getAuthHeaders(),
            });

            const json = await res.json();

            if (!res.ok || !json?.success) {
                throw new Error(json?.message || "Failed to load payments");
            }

            setPayments(Array.isArray(json?.data) ? json.data : []);
            setTotal(json?.pagination?.total || 0);
        } catch (err) {
            console.error("Failed to load payments:", err);
            setPayments([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        loadData(search);
    };

    const clearFilters = () => {
        setSearch("");
        setFilterMethod("");
        setFilterStatus("");
        setPreset("all");
        setDateFrom("");
        setDateTo("");
        setPage(1);
    };

    const totalAmount = useMemo(
        () =>
            payments.reduce(
                (sum, p) => sum + Number(p?.amount || p?.totalAmount || 0),
                0
            ),
        [payments]
    );

    const successCount = useMemo(
        () =>
            payments.filter((p) =>
                ["SUCCESS", "PAID"].includes(
                    String(p?.paymentStatus || p?.status || "").toUpperCase()
                )
            ).length,
        [payments]
    );

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const presetButtons = [
        { label: "All", value: "all" },
        { label: "Today", value: "today" },
        { label: "Weekly", value: "week" },
        { label: "Monthly", value: "month" },
        { label: "Yearly", value: "year" },
        { label: "Custom", value: "custom" },
    ];

    return (
        <div className="min-h-screen bg-[#F5F8F8] p-4 sm:p-6">
            <div className="mx-auto max-w-[1700px] space-y-6">
                {/* Header */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#CFE5E3] bg-[#F7FBFB] px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#0B5D5A]">
                                <ReceiptIndianRupee className="h-4 w-4" />
                                Payment Dashboard
                            </div>

                            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                Admin Payments
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 sm:text-base">
                                Track payments with modern clean premium admin UI.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => loadData()}
                            disabled={loading}
                            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0B5D5A] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#094B49] disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Refreshing...
                                </>
                            ) : (
                                "Refresh Payments"
                            )}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Current Page Records"
                        value={payments.length}
                        icon={<CreditCard className="h-5 w-5" />}
                    />
                    <StatCard
                        title="Total Records"
                        value={total}
                        icon={<Wallet className="h-5 w-5" />}
                    />
                    <StatCard
                        title="Page Amount"
                        value={formatCurrency(totalAmount)}
                        icon={<BadgeIndianRupee className="h-5 w-5" />}
                    />
                    <StatCard
                        title="Successful"
                        value={successCount}
                        icon={<Filter className="h-5 w-5" />}
                    />
                </div>

                {/* Filters */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B5D5A]/10 text-[#0B5D5A]">
                            <Filter className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">Filters & Search</h3>
                            <p className="text-sm text-slate-500">
                                Search by transaction, order, booking and filter by method, status and date range
                            </p>
                        </div>
                    </div>

                    {/* ROW 1 */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                        {/* Search */}
                        <div className="lg:col-span-5">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Search
                            </label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSearch();
                                        }}
                                        placeholder="Search transaction, order or booking"
                                        className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    className="h-14 min-w-[130px] rounded-2xl bg-[#0B5D5A] px-6 text-sm font-bold text-white transition hover:bg-[#094B49]"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="lg:col-span-3">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Payment Method
                            </label>
                            <select
                                value={filterMethod}
                                onChange={(e) => {
                                    setFilterMethod(e.target.value);
                                    setPage(1);
                                }}
                                className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
                            >
                                <option value="">All Methods</option>
                                <option value="ONLINE">Online</option>
                                <option value="OFFLINE_CASH">Cash</option>
                                <option value="OFFLINE_UPI">UPI</option>
                                <option value="OFFLINE_UNPAID">Unpaid</option>
                            </select>
                        </div>

                        {/* Payment Status */}
                        <div className="lg:col-span-4">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Payment Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setPage(1);
                                }}
                                className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
                            >
                                <option value="">All Status</option>
                                <option value="SUCCESS">Success</option>
                                <option value="FAILED">Failed</option>
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Paid</option>
                                <option value="UNPAID">Unpaid</option>
                                <option value="REFUNDED">Refunded</option>
                            </select>
                        </div>
                    </div>

                    {/* ROW 2 */}
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Start Date
                            </label>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={dateFrom ? new Date(dateFrom).toISOString().slice(0, 10) : ""}
                                    onChange={(e) => {
                                        setPreset("custom");
                                        setDateFrom(e.target.value ? startOfDay(e.target.value) : "");
                                        setPage(1);
                                    }}
                                    className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                End Date
                            </label>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={dateTo ? new Date(dateTo).toISOString().slice(0, 10) : ""}
                                    onChange={(e) => {
                                        setPreset("custom");
                                        setDateTo(e.target.value ? endOfDay(e.target.value) : "");
                                        setPage(1);
                                    }}
                                    className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ROW 3 */}
                    <div className="mt-6 flex flex-wrap gap-3">
                        {presetButtons.map((item) => {
                            const active = preset === item.value;

                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setPreset(item.value)}
                                    className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all ${active
                                            ? "bg-[#0B5D5A] text-white shadow-sm"
                                            : "border border-slate-300 bg-white text-slate-700 hover:border-[#0B5D5A]/30 hover:text-[#0B5D5A]"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                    <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                    Payment Records
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Showing {payments.length} of {total} payment(s)
                                </p>
                            </div>

                            <div className="rounded-full border border-[#CFE5E3] bg-[#F7FBFB] px-4 py-2 text-sm font-bold text-[#0B5D5A]">
                                Modern Admin View
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr className="border-b border-slate-200">
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Date
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Booking / Ref
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Amount
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Method
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Transaction
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center text-sm font-medium text-slate-500"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-[#0B5D5A]" />
                                                Loading payments...
                                            </div>
                                        </td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center text-sm text-slate-500"
                                        >
                                            <div className="mx-auto flex max-w-md flex-col items-center">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                                                    <ReceiptIndianRupee className="h-6 w-6" />
                                                </div>
                                                <div className="mt-3 text-base font-bold text-slate-700">
                                                    No payments found
                                                </div>
                                                <div className="mt-1 text-sm text-slate-500">
                                                    Try changing filters or search terms
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((p) => (
                                        <tr
                                            key={p._id}
                                            className="transition-colors hover:bg-[#F8FBFB]"
                                        >
                                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                {formatDateTime(p.createdAt)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-800">
                                                    {p.bookingId || p.paymentId || p.gatewayOrderId || "-"}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-500">
                                                    {p.gatewayPaymentId || "-"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm font-bold text-slate-900">
                                                {formatCurrency(p.amount || p.totalAmount || 0)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadgeClass(
                                                        p.paymentStatus || p.status
                                                    )}`}
                                                >
                                                    {p.paymentStatus || p.status || "-"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getMethodBadgeClass(
                                                        p.paymentMethod || p.transactionType
                                                    )}`}
                                                >
                                                    {p.paymentMethod || p.transactionType || "-"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                {p.gatewayPaymentId || p.gatewayOrderId || "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="text-sm font-medium text-slate-600">
                            Page {page} of {totalPages}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Prev
                            </button>

                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        {title}
                    </div>
                    <div className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
                        {value}
                    </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B5D5A]/10 text-[#0B5D5A]">
                    {icon}
                </div>
            </div>
        </div>
    );
}