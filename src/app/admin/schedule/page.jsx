"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    Plus,
    Search,
    BusFront,
    Route,
    Clock3,
    Power,
    Ban,
    RefreshCw,
} from "lucide-react";

function SummaryCard({ title, value, icon }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function Input({ className = "", ...props }) {
    return (
        <input
            {...props}
            className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B5D5A]/40 focus:ring-2 focus:ring-[#0B5D5A]/10 ${className}`}
        />
    );
}

function Select({ className = "", children, ...props }) {
    return (
        <select
            {...props}
            className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#0B5D5A]/40 focus:ring-2 focus:ring-[#0B5D5A]/10 ${className}`}
        >
            {children}
        </select>
    );
}

function StatusBadge({ status }) {
    const styles = {
        SCHEDULED: "border-[#0B5D5A]/15 bg-[#0B5D5A]/10 text-[#0B5D5A]",
        RUNNING: "border-blue-200 bg-blue-50 text-blue-700",
        COMPLETED: "border-slate-200 bg-slate-100 text-slate-700",
        CANCELLED: "border-red-200 bg-red-50 text-red-700",
    };

    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${styles[status] || "border-slate-200 bg-slate-100 text-slate-700"
                }`}
        >
            {status || "SCHEDULED"}
        </span>
    );
}

export default function page() {
    const [buses, setBuses] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    // Filter states
    const [search, setSearch] = useState("");
    const [filterBusId, setFilterBusId] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDirection, setFilterDirection] = useState("");

    // Filter date mode
    const [filterDateMode, setFilterDateMode] = useState("single");
    const [filterTravelDate, setFilterTravelDate] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    // Create form states
    const [createBusId, setCreateBusId] = useState("");
    const [createMode, setCreateMode] = useState("FORWARD");

    // Create date mode
    const [createDateMode, setCreateDateMode] = useState("single");
    const [travelDate, setTravelDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [status, setStatus] = useState("SCHEDULED");
    const [isBookingOpen, setIsBookingOpen] = useState(true);
    const [notes, setNotes] = useState("");

    const fetchBuses = async () => {
        try {
            const res = await fetch("/api/admin/buses");
            const data = await res.json();

            if (data.success) {
                setBuses(data.items || data.data || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSchedules = async (currentPage = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (search) params.set("search", search);
            if (filterBusId) params.set("busId", filterBusId);
            if (filterStatus) params.set("status", filterStatus);
            if (filterDirection) params.set("tripDirection", filterDirection);

            if (filterDateMode === "single") {
                if (filterTravelDate) {
                    params.set("travelDate", filterTravelDate);
                }
            } else {
                if (filterStartDate && filterEndDate) {
                    params.set("startDate", filterStartDate);
                    params.set("endDate", filterEndDate);
                }
            }

            params.set("page", String(currentPage));
            params.set("limit", "10");

            const res = await fetch(`/api/admin/schedules?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setSchedules(data.data || []);
                setPagination(
                    data.pagination || {
                        page: 1,
                        limit: 10,
                        total: 0,
                        totalPages: 1,
                    }
                );
                setPage(currentPage);
            } else {
                alert(data.message || "Failed to fetch schedules");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to fetch schedules");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuses();
        fetchSchedules(1);
    }, []);

    const handleCreateSchedule = async () => {
        if (!createBusId) {
            alert("Please select a bus");
            return;
        }

        if (createDateMode === "single" && !travelDate) {
            alert("Please select travel date");
            return;
        }

        if (createDateMode === "range" && (!startDate || !endDate)) {
            alert("Please select start date and end date");
            return;
        }

        setCreating(true);

        try {
            const payload = {
                busId: createBusId,
                createMode,
                status,
                isBookingOpen,
                notes,
            };

            if (createDateMode === "single") {
                payload.travelDate = travelDate;
            } else {
                payload.startDate = startDate;
                payload.endDate = endDate;
            }

            const res = await fetch("/api/admin/schedules", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(data.message || "Failed to create schedule");
                return;
            }

            alert(data.message || "Schedule created successfully");

            // Reset
            setCreateBusId("");
            setCreateMode("FORWARD");
            setTravelDate("");
            setStartDate("");
            setEndDate("");
            setStatus("SCHEDULED");
            setIsBookingOpen(true);
            setNotes("");

            fetchSchedules(1);
        } catch (error) {
            console.error(error);
            alert("Failed to create schedule");
        } finally {
            setCreating(false);
        }
    };

    const handleToggleBooking = async (scheduleId, currentState) => {
        try {
            const res = await fetch(`/api/admin/schedules/${scheduleId}/toggle-booking`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isBookingOpen: !currentState,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(data.message || "Failed to update booking");
                return;
            }

            fetchSchedules(page);
        } catch (error) {
            console.error(error);
            alert("Failed to update booking");
        }
    };

    const handleCancelSchedule = async (scheduleId) => {
        const ok = window.confirm("Are you sure you want to cancel this schedule?");
        if (!ok) return;

        try {
            const res = await fetch(`/api/admin/schedules/${scheduleId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(data.message || "Failed to cancel schedule");
                return;
            }

            fetchSchedules(page);
        } catch (error) {
            console.error(error);
            alert("Failed to cancel schedule");
        }
    };

    const stats = useMemo(() => {
        return {
            total: pagination.total || schedules.length,
            scheduled: schedules.filter((s) => s.status === "SCHEDULED").length,
            running: schedules.filter((s) => s.status === "RUNNING").length,
            cancelled: schedules.filter((s) => s.status === "CANCELLED").length,
        };
    }, [schedules, pagination]);

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-5 md:p-6">
            {/* Header */}
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0B5D5A]">
                        MORYA TRAVELS DASHBOARD
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                        Schedule Management
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 sm:text-base">
                        Create schedules using single date or start date to end date.
                    </p>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Schedules"
                        value={stats.total}
                        icon={<CalendarDays className="h-6 w-6 text-[#0B5D5A]" />}
                    />
                    <SummaryCard
                        title="Scheduled"
                        value={stats.scheduled}
                        icon={<Route className="h-6 w-6 text-[#0B5D5A]" />}
                    />
                    <SummaryCard
                        title="Running"
                        value={stats.running}
                        icon={<Clock3 className="h-6 w-6 text-[#0B5D5A]" />}
                    />
                    <SummaryCard
                        title="Cancelled"
                        value={stats.cancelled}
                        icon={<Ban className="h-6 w-6 text-[#0B5D5A]" />}
                    />
                </div>
            </div>

            {/* Create Schedule */}
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                            <Plus className="h-6 w-6 text-[#0B5D5A]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Create Schedule</h2>
                            <p className="text-sm text-slate-500">
                                Choose single date or start date to end date.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 p-4 sm:p-5">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Select Bus <span className="text-red-500">*</span>
                            </label>
                            <Select value={createBusId} onChange={(e) => setCreateBusId(e.target.value)}>
                                <option value="">Select Bus</option>
                                {buses.map((bus) => (
                                    <option key={bus._id} value={bus._id}>
                                        {bus.busNumber} - {bus.busName} ({bus.seatLayout} Seats)
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Create Mode <span className="text-red-500">*</span>
                            </label>
                            <Select value={createMode} onChange={(e) => setCreateMode(e.target.value)}>
                                <option value="FORWARD">FORWARD</option>
                                <option value="RETURN">RETURN</option>
                                <option value="BOTH">BOTH</option>
                            </Select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Date Option <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={createDateMode}
                                onChange={(e) => setCreateDateMode(e.target.value)}
                            >
                                <option value="single">Single Date</option>
                                <option value="range">Start Date to End Date</option>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2 Date Inputs */}
                    {createDateMode === "single" ? (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Travel Date <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={travelDate}
                                    onChange={(e) => setTravelDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Status
                                </label>
                                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="SCHEDULED">SCHEDULED</option>
                                    <option value="RUNNING">RUNNING</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Booking Status
                                </label>
                                <Select
                                    value={isBookingOpen ? "OPEN" : "CLOSED"}
                                    onChange={(e) => setIsBookingOpen(e.target.value === "OPEN")}
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                </Select>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Status
                                </label>
                                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="SCHEDULED">SCHEDULED</option>
                                    <option value="RUNNING">RUNNING</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Booking Status
                                </label>
                                <Select
                                    value={isBookingOpen ? "OPEN" : "CLOSED"}
                                    onChange={(e) => setIsBookingOpen(e.target.value === "OPEN")}
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Optional notes..."
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B5D5A]/40 focus:ring-2 focus:ring-[#0B5D5A]/10"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleCreateSchedule}
                            disabled={creating}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#0B5D5A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0B5D5A]/20 transition hover:bg-[#094B49] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {creating ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Create Schedule
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                            <Search className="h-5 w-5 text-[#0B5D5A]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Search & Filters</h2>
                            <p className="text-sm text-slate-500">Search and filter schedule table</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by route, bus number, start/end point..."
                        />

                        <Select value={filterBusId} onChange={(e) => setFilterBusId(e.target.value)}>
                            <option value="">All Buses</option>
                            {buses.map((bus) => (
                                <option key={bus._id} value={bus._id}>
                                    {bus.busNumber} - {bus.busName}
                                </option>
                            ))}
                        </Select>

                        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="SCHEDULED">SCHEDULED</option>
                            <option value="RUNNING">RUNNING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </Select>

                        <Select
                            value={filterDirection}
                            onChange={(e) => setFilterDirection(e.target.value)}
                        >
                            <option value="">All Directions</option>
                            <option value="FORWARD">FORWARD</option>
                            <option value="RETURN">RETURN</option>
                        </Select>

                        <Select
                            value={filterDateMode}
                            onChange={(e) => setFilterDateMode(e.target.value)}
                        >
                            <option value="single">Single Date</option>
                            <option value="range">Start Date to End Date</option>
                        </Select>
                    </div>

                    {filterDateMode === "single" ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px]">
                            <Input
                                type="date"
                                value={filterTravelDate}
                                onChange={(e) => setFilterTravelDate(e.target.value)}
                            />

                            <button
                                type="button"
                                onClick={() => fetchSchedules(1)}
                                className="rounded-2xl bg-[#0B5D5A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#094B49]"
                            >
                                Apply Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_180px]">
                            <Input
                                type="date"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                            />
                            <Input
                                type="date"
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => fetchSchedules(1)}
                                className="rounded-2xl bg-[#0B5D5A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#094B49]"
                            >
                                Apply Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 sm:p-5">
                    <h2 className="text-lg font-bold text-slate-900">Schedule Table</h2>
                    <p className="text-sm text-slate-500">Clean premium schedule listing</p>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-sm font-medium text-slate-500">
                        Loading schedules...
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-base font-semibold text-slate-700">No schedules found</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Create a schedule or change the filters.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="min-w-full">
                                <thead className="bg-slate-50/90">
                                    <tr className="border-b border-slate-200">
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                            Bus
                                        </th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                            Route
                                        </th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                            Travel Date
                                        </th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                            Direction
                                        </th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                            Timing
                                        </th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                            Fare
                                        </th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                            Status
                                        </th>
                                        <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {schedules.map((item) => (
                                        <tr
                                            key={item._id}
                                            className="transition-colors duration-200 hover:bg-[#0B5D5A]/[0.03]"
                                        >
                                            <td className="px-5 py-4 align-top">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                                                        <BusFront className="h-5 w-5 text-[#0B5D5A]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{item.busNumber}</p>
                                                        <p className="text-xs text-slate-500">{item.busName}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-semibold text-slate-800">{item.routeName}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.startPoint} → {item.endPoint}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {item.travelDate
                                                        ? new Date(item.travelDate).toLocaleDateString("en-GB")
                                                        : "-"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <span className="inline-flex rounded-full border border-[#0B5D5A]/15 bg-[#0B5D5A]/10 px-3 py-1 text-xs font-bold text-[#0B5D5A]">
                                                    {item.tripDirection}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {item.startTime || "--:--"} → {item.endTime || "--:--"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-bold text-slate-900">
                                                    ₹ {Number(item.effectiveFare || item.baseFare || 0)}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <div className="space-y-2">
                                                    <StatusBadge status={item.status} />
                                                    <div>
                                                        <span
                                                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${item.isBookingOpen
                                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                    : "border-red-200 bg-red-50 text-red-700"
                                                                }`}
                                                        >
                                                            {item.isBookingOpen ? "BOOKING OPEN" : "BOOKING CLOSED"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <div className="flex flex-wrap items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleBooking(item._id, item.isBookingOpen)}
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A]"
                                                    >
                                                        <Power className="h-4 w-4" />
                                                        {item.isBookingOpen ? "Close Booking" : "Open Booking"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelSchedule(item._id)}
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="grid gap-4 p-4 lg:hidden">
                            {schedules.map((item) => (
                                <div
                                    key={item._id}
                                    className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                                            <BusFront className="h-5 w-5 text-[#0B5D5A]" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-900">{item.busNumber}</p>
                                            <p className="text-xs text-slate-500">{item.busName}</p>
                                        </div>

                                        <StatusBadge status={item.status} />
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                        <p className="text-sm font-semibold text-slate-800">{item.routeName}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {item.startPoint} → {item.endPoint}
                                        </p>

                                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <p className="text-slate-500">Travel Date</p>
                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {item.travelDate
                                                        ? new Date(item.travelDate).toLocaleDateString("en-GB")
                                                        : "-"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Direction</p>
                                                <p className="mt-1 font-semibold text-[#0B5D5A]">{item.tripDirection}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Timing</p>
                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {item.startTime || "--:--"} → {item.endTime || "--:--"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Fare</p>
                                                <p className="mt-1 font-semibold text-slate-800">
                                                    ₹ {Number(item.effectiveFare || item.baseFare || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${item.isBookingOpen
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                    : "border-red-200 bg-red-50 text-red-700"
                                                }`}
                                        >
                                            {item.isBookingOpen ? "BOOKING OPEN" : "BOOKING CLOSED"}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleBooking(item._id, item.isBookingOpen)}
                                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A]"
                                        >
                                            {item.isBookingOpen ? "Close Booking" : "Open Booking"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleCancelSchedule(item._id)}
                                            className="rounded-2xl border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing page <span className="font-semibold text-slate-700">{pagination.page}</span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-700">
                                    {pagination.totalPages || 1}
                                </span>
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => fetchSchedules(page - 1)}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    disabled={page >= (pagination.totalPages || 1)}
                                    onClick={() => fetchSchedules(page + 1)}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}