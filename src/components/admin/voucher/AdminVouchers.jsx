"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BadgeIndianRupee,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    Loader2,
    Search,
    Ticket,
    Wallet,
    X,
    History,
    Copy,
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

function getStatusBadgeClass(status = "") {
    const normalized = String(status).toUpperCase();

    if (normalized === "ACTIVE") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
    if (normalized === "PARTIALLY_USED") {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
    if (normalized === "USED") {
        return "border-blue-200 bg-blue-50 text-blue-700";
    }
    if (normalized === "EXPIRED") {
        return "border-red-200 bg-red-50 text-red-700";
    }
    if (normalized === "CANCELLED") {
        return "border-slate-300 bg-slate-100 text-slate-700";
    }

    return "border-slate-200 bg-slate-100 text-slate-700";
}

function getStatusOptions() {
    return [
        { label: "All Status", value: "ALL" },
        { label: "Active", value: "ACTIVE" },
        { label: "Partially Used", value: "PARTIALLY_USED" },
        { label: "Used", value: "USED" },
        { label: "Expired", value: "EXPIRED" },
        { label: "Cancelled", value: "CANCELLED" },
    ];
}

export default function AdminVouchers() {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [datePreset, setDatePreset] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    });

    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        loadVouchers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, statusFilter, datePreset, startDate, endDate]);

    const loadVouchers = async (searchOverride) => {
        setLoading(true);

        try {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", String(limit));

            const searchValue =
                typeof searchOverride === "string" ? searchOverride : search;

            if (searchValue.trim()) params.set("search", searchValue.trim());
            if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
            if (datePreset && datePreset !== "ALL") params.set("preset", datePreset);
            if (startDate) params.set("startDate", startDate);
            if (endDate) params.set("endDate", endDate);

            const res = await fetch(`/api/admin/vouchers?${params.toString()}`, {
                headers: getAuthHeaders(),
            });

            const json = await res.json();

            if (!res.ok || !json?.success) {
                throw new Error(json?.message || "Failed to load vouchers");
            }

            setVouchers(Array.isArray(json?.data) ? json.data : []);
            setPagination(
                json?.pagination || {
                    page: 1,
                    limit,
                    total: 0,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                }
            );
        } catch (err) {
            console.error("Failed to load vouchers:", err);
            setVouchers([]);
            setPagination({
                page: 1,
                limit,
                total: 0,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = () => {
        setPage(1);
        loadVouchers(search);
    };

    const handleRowClick = async (voucherId) => {
        if (!voucherId) return;

        setDetailsOpen(true);
        setDetailsLoading(true);
        setSelectedVoucher(null);

        try {
            const res = await fetch(`/api/admin/vouchers/${voucherId}`, {
                headers: getAuthHeaders(),
            });

            const json = await res.json();

            if (!res.ok || !json?.success) {
                throw new Error(json?.message || "Failed to fetch voucher details");
            }

            setSelectedVoucher(json.data || null);
        } catch (error) {
            console.error("Failed to fetch voucher details:", error);
            setSelectedVoucher(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const stats = useMemo(() => {
        const totalCount = vouchers.length;
        const totalOriginal = vouchers.reduce(
            (sum, item) => sum + Number(item?.originalAmount || 0),
            0
        );
        const totalRemaining = vouchers.reduce(
            (sum, item) => sum + Number(item?.remainingAmount || 0),
            0
        );
        const activeCount = vouchers.filter((item) =>
            ["ACTIVE", "PARTIALLY_USED"].includes(String(item?.status || "").toUpperCase())
        ).length;

        return {
            totalCount,
            totalOriginal,
            totalRemaining,
            activeCount,
        };
    }, [vouchers]);

    const presetButtons = [
        { label: "All", value: "ALL" },
        { label: "Today", value: "TODAY" },
        { label: "Weekly", value: "WEEKLY" },
        { label: "Monthly", value: "MONTHLY" },
        { label: "Yearly", value: "YEARLY" },
    ];

    return (
        <div className="min-h-screen bg-[#F5F8F8] p-4 sm:p-6">
            <div className="mx-auto max-w-[1700px] space-y-6">
                {/* Header */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#CFE5E3] bg-[#F7FBFB] px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#0B5D5A]">
                                <Ticket className="h-4 w-4" />
                                Voucher Management
                            </div>

                            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                Admin Vouchers
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 sm:text-base">
                                View active, used, partially used, expired and cancelled vouchers with usage history.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => loadVouchers()}
                            disabled={loading}
                            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0B5D5A] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#094B49] disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Refreshing...
                                </>
                            ) : (
                                "Refresh Vouchers"
                            )}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Current Page"
                        value={stats.totalCount}
                        icon={<Ticket className="h-5 w-5" />}
                    />
                    <StatCard
                        title="Original Amount"
                        value={formatCurrency(stats.totalOriginal)}
                        icon={<BadgeIndianRupee className="h-5 w-5" />}
                    />
                    <StatCard
                        title="Remaining Amount"
                        value={formatCurrency(stats.totalRemaining)}
                        icon={<Wallet className="h-5 w-5" />}
                    />
                    <StatCard
                        title="Active / Usable"
                        value={stats.activeCount}
                        icon={<Filter className="h-5 w-5" />}
                    />
                </div>

                {/* Filters */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B5D5A]/10 text-[#0B5D5A]">
                            <Filter className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Filters & Search</h3>
                            <p className="text-sm text-slate-500">
                                Search by voucher code, guest details, issue reason, notes and date range
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-10">
                        <div className="xl:col-span-4">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Search
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                setPage(1);
                                                handleSearchSubmit();
                                            }
                                        }}
                                        placeholder="Search by code, guest, phone, email..."
                                        className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSearchSubmit}
                                    className="h-14 rounded-2xl bg-[#0B5D5A] px-5 text-sm font-bold text-white transition hover:bg-[#094B49]"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        <div className="xl:col-span-2">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
                            >
                                {getStatusOptions().map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="xl:col-span-2">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Start Date
                            </label>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setPage(1);
                                    }}
                                    className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
                                />
                            </div>
                        </div>

                        <div className="xl:col-span-2">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                End Date
                            </label>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setPage(1);
                                    }}
                                    className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        {presetButtons.map((preset) => {
                            const active = datePreset === preset.value;

                            return (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => {
                                        setDatePreset(preset.value);
                                        setPage(1);
                                    }}
                                    className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition-all ${active
                                            ? "bg-[#0B5D5A] text-white shadow-sm"
                                            : "border border-slate-300 bg-white text-slate-700 hover:border-[#0B5D5A]/30 hover:text-[#0B5D5A]"
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("ALL");
                                setDatePreset("ALL");
                                setStartDate("");
                                setEndDate("");
                                setPage(1);
                            }}
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
                                    Voucher Records
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Showing {vouchers.length} of {pagination.total} voucher(s)
                                </p>
                            </div>

                            <div className="rounded-full border border-[#CFE5E3] bg-[#F7FBFB] px-4 py-2 text-sm font-bold text-[#0B5D5A]">
                                Active + Used + History View
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr className="border-b border-slate-200">
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Code
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Guest
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Original
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Remaining
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Used
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Issued
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Expires
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-5 py-12 text-center text-sm font-medium text-slate-500"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-[#0B5D5A]" />
                                                Loading vouchers...
                                            </div>
                                        </td>
                                    </tr>
                                ) : vouchers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-5 py-12 text-center text-sm text-slate-500"
                                        >
                                            <div className="mx-auto flex max-w-md flex-col items-center">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                                                    <Ticket className="h-6 w-6" />
                                                </div>
                                                <div className="mt-3 text-base font-bold text-slate-700">
                                                    No vouchers found
                                                </div>
                                                <div className="mt-1 text-sm text-slate-500">
                                                    Try changing filters or search terms
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    vouchers.map((v) => {
                                        const usedAmount =
                                            Number(v?.originalAmount || 0) -
                                            Number(v?.remainingAmount || 0);

                                        return (
                                            <tr
                                                key={v._id}
                                                className="cursor-pointer transition-colors hover:bg-[#F8FBFB]"
                                                onClick={() => handleRowClick(v._id)}
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-slate-900">
                                                        {v.voucherCode || "-"}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-slate-800">
                                                        {v.guestName || "-"}
                                                    </div>
                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {v.guestPhoneNumber || v.guestEmail || "-"}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-sm font-bold text-slate-800">
                                                    {formatCurrency(v.originalAmount)}
                                                </td>

                                                <td className="px-5 py-4 text-sm font-bold text-[#0B5D5A]">
                                                    {formatCurrency(v.remainingAmount)}
                                                </td>

                                                <td className="px-5 py-4 text-sm font-bold text-amber-600">
                                                    {formatCurrency(usedAmount)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadgeClass(
                                                            v.status
                                                        )}`}
                                                    >
                                                        {v.status || "-"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-700">
                                                    {formatDateTime(v.createdAt)}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-700">
                                                    {formatDateTime(v.expiresAt)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRowClick(v._id);
                                                        }}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#0B5D5A]/30 hover:text-[#0B5D5A]"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="text-sm font-medium text-slate-600">
                            Page {pagination.page} of {pagination.totalPages || 1}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={!pagination.hasPrevPage || loading}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Prev
                            </button>

                            <button
                                type="button"
                                disabled={!pagination.hasNextPage || loading}
                                onClick={() =>
                                    setPage((prev) =>
                                        Math.min(prev + 1, pagination.totalPages || 1)
                                    )
                                }
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {detailsOpen && (
                <VoucherDetailsModal
                    open={detailsOpen}
                    onClose={() => {
                        setDetailsOpen(false);
                        setSelectedVoucher(null);
                    }}
                    loading={detailsLoading}
                    voucher={selectedVoucher}
                />
            )}
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

function VoucherDetailsModal({ open, onClose, loading, voucher }) {
    if (!open) return null;

    const usedAmount =
        Number(voucher?.originalAmount || 0) - Number(voucher?.remainingAmount || 0);

    const usageHistory = Array.isArray(voucher?.usedBookings) ? voucher.usedBookings : [];

    const handleCopy = async () => {
        try {
            if (!voucher?.voucherCode) return;
            await navigator.clipboard.writeText(voucher.voucherCode);
            alert("Voucher code copied");
        } catch (error) {
            console.error("Copy failed:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <div className="text-xs font-black uppercase tracking-[0.18em] text-[#0B5D5A]">
                            Voucher Details
                        </div>
                        <h3 className="mt-1 text-2xl font-black text-slate-900">
                            {voucher?.voucherCode || "Loading..."}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[calc(92vh-76px)] overflow-y-auto p-5 sm:p-6">
                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center gap-2 text-slate-500">
                            <Loader2 className="h-5 w-5 animate-spin text-[#0B5D5A]" />
                            Loading voucher details...
                        </div>
                    ) : !voucher ? (
                        <div className="flex min-h-[300px] items-center justify-center text-slate-500">
                            Voucher details not found
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Top summary */}
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                                <MiniCard title="Original Amount" value={formatCurrency(voucher.originalAmount)} />
                                <MiniCard title="Remaining Amount" value={formatCurrency(voucher.remainingAmount)} highlight />
                                <MiniCard title="Used Amount" value={formatCurrency(usedAmount)} amber />
                                <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                                    <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        Status
                                    </div>
                                    <div className="mt-3">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadgeClass(
                                                voucher.status
                                            )}`}
                                        >
                                            {voucher.status || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Voucher Info */}
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                <SectionCard title="Voucher Information">
                                    <InfoRow label="Voucher Code" value={voucher.voucherCode || "-"} />
                                    <InfoRow label="Guest Name" value={voucher.guestName || "-"} />
                                    <InfoRow label="Guest Phone" value={voucher.guestPhoneNumber || "-"} />
                                    <InfoRow label="Guest Email" value={voucher.guestEmail || "-"} />
                                    <InfoRow label="Issue Reason" value={voucher.issueReason || "-"} />
                                    <InfoRow label="Notes" value={voucher.notes || "-"} />
                                    <InfoRow label="Created At" value={formatDateTime(voucher.createdAt)} />
                                    <InfoRow label="Expires At" value={formatDateTime(voucher.expiresAt)} />

                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#0B5D5A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#094B49]"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Copy Voucher Code
                                    </button>
                                </SectionCard>

                                <SectionCard title="Source Booking">
                                    <InfoRow
                                        label="Booking Code"
                                        value={voucher?.sourceBookingId?.bookingCode || "-"}
                                    />
                                    <InfoRow
                                        label="Customer Name"
                                        value={voucher?.sourceBookingId?.customerName || "-"}
                                    />
                                    <InfoRow
                                        label="Customer Phone"
                                        value={voucher?.sourceBookingId?.customerPhone || "-"}
                                    />
                                    <InfoRow
                                        label="Customer Email"
                                        value={voucher?.sourceBookingId?.customerEmail || "-"}
                                    />
                                    <InfoRow
                                        label="Travel Date"
                                        value={voucher?.sourceBookingId?.travelDate || "-"}
                                    />
                                    <InfoRow
                                        label="Seats"
                                        value={
                                            Array.isArray(voucher?.sourceBookingId?.seats)
                                                ? voucher.sourceBookingId.seats.join(", ")
                                                : "-"
                                        }
                                    />
                                </SectionCard>
                            </div>

                            {/* Usage History */}
                            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                                        <History className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900">Voucher Usage History</h4>
                                        <p className="text-sm text-slate-500">
                                            All bookings where this voucher was used
                                        </p>
                                    </div>
                                </div>

                                {usageHistory.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                        This voucher has not been used yet
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                        <table className="min-w-full">
                                            <thead className="bg-slate-50">
                                                <tr className="border-b border-slate-200">
                                                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                                                        Booking Code
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                                                        Customer
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                                                        Travel Date
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                                                        Seats
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                                                        Amount Used
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                                                        Used At
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {usageHistory.map((usage, index) => (
                                                    <tr key={`${usage?.usedAt || index}-${index}`}>
                                                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                                                            {usage?.bookingId?.bookingCode || "-"}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-700">
                                                            {usage?.bookingId?.customerName || "-"}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-700">
                                                            {usage?.bookingId?.travelDate || "-"}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-700">
                                                            {Array.isArray(usage?.bookingId?.seats)
                                                                ? usage.bookingId.seats.join(", ")
                                                                : "-"}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-bold text-amber-700">
                                                            {formatCurrency(usage?.amountUsed || 0)}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-700">
                                                            {formatDateTime(usage?.usedAt)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MiniCard({ title, value, highlight = false, amber = false }) {
    return (
        <div
            className={`rounded-[22px] border p-4 ${highlight
                    ? "border-[#CFE5E3] bg-[#F7FBFB]"
                    : amber
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-200 bg-white"
                }`}
        >
            <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                {title}
            </div>
            <div
                className={`mt-3 text-2xl font-black ${highlight ? "text-[#0B5D5A]" : amber ? "text-amber-700" : "text-slate-900"
                    }`}
            >
                {value}
            </div>
        </div>
    );
}

function SectionCard({ title, children }) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <h4 className="mb-4 text-lg font-black text-slate-900">{title}</h4>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col gap-1 rounded-2xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-sm font-bold text-slate-500">{label}</div>
            <div className="text-sm font-semibold text-slate-800 sm:text-right">{value}</div>
        </div>
    );
}