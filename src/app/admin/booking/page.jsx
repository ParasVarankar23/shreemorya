"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Search,
    CalendarDays,
    BusFront,
    MapPin,
    Ticket,
    IndianRupee,
    RefreshCw,
    Power,
    Ban,
} from "lucide-react";

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

function StatusBadge({ value, type = "booking" }) {
    const bookingStyles = {
        PENDING: "border-amber-200 bg-amber-50 text-amber-700",
        CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-700",
        PARTIAL: "border-blue-200 bg-blue-50 text-blue-700",
        CANCELLED: "border-red-200 bg-red-50 text-red-700",
    };

    const paymentStyles = {
        UNPAID: "border-red-200 bg-red-50 text-red-700",
        PARTIAL: "border-blue-200 bg-blue-50 text-blue-700",
        PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };

    const styles = type === "payment" ? paymentStyles : bookingStyles;

    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${styles[value] || "border-slate-200 bg-slate-100 text-slate-700"
                }`}
        >
            {value || "-"}
        </span>
    );
}

export default function page() {
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [markingPaidId, setMarkingPaidId] = useState("");
    const [cancellingId, setCancellingId] = useState("");

    // Search schedule for booking
    const [pickupPoint, setPickupPoint] = useState("");
    const [dropPoint, setDropPoint] = useState("");
    const [travelDate, setTravelDate] = useState("");
    const [availableSchedules, setAvailableSchedules] = useState([]);

    // Static points (replace later with API if you have route points API)
    const [points, setPoints] = useState([
        "Panvel",
        "Kalamboli",
        "Kamothe",
        "Kharghar",
        "Belapur",
        "Vashi",
        "Chembur",
        "Dadar",
        "Thane",
        "Pune",
    ]);

    // Bookings list filters
    const [search, setSearch] = useState("");
    const [bookingStatus, setBookingStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [filterDate, setFilterDate] = useState("");

    const [bookings, setBookings] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0,
        limit: 20,
    });

    const fetchBookings = async (page = 1) => {
        setLoadingBookings(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (bookingStatus) params.set("bookingStatus", bookingStatus);
            if (paymentStatus) params.set("paymentStatus", paymentStatus);
            if (filterDate) params.set("travelDate", filterDate);
            params.set("page", String(page));
            params.set("limit", "20");

            const res = await fetch(`/api/admin/bookings?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setBookings(data.data || []);
                setPagination(
                    data.pagination || {
                        page: 1,
                        totalPages: 1,
                        total: 0,
                        limit: 20,
                    }
                );
            } else {
                alert(data.message || "Failed to fetch bookings");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to fetch bookings");
        } finally {
            setLoadingBookings(false);
        }
    };

    useEffect(() => {
        fetchBookings(1);
    }, []);

    // NOTE:
    // This uses your schedules API with travelDate + search.
    // If you later add pickup/drop filter support in schedules API,
    // we can filter server-side perfectly.
    const handleSearchSchedules = async () => {
        if (!pickupPoint || !dropPoint || !travelDate) {
            alert("Please select pickup point, drop point and date");
            return;
        }

        if (pickupPoint === dropPoint) {
            alert("Pickup and Drop cannot be same");
            return;
        }

        setLoadingSchedules(true);

        try {
            const params = new URLSearchParams();
            params.set("travelDate", travelDate);
            params.set("status", "SCHEDULED");
            params.set("limit", "50");

            const res = await fetch(`/api/admin/schedules?${params.toString()}`);
            const data = await res.json();

            if (!data.success) {
                alert(data.message || "Failed to fetch schedules");
                setAvailableSchedules([]);
                return;
            }

            const allSchedules = data.data || [];

            // Frontend filtering by pickup/drop using schedule points
            const filtered = allSchedules.filter((schedule) => {
                const pickup = (schedule.pickupPoints || []).find(
                    (p) => (p.name || "").toLowerCase() === pickupPoint.toLowerCase()
                );
                const drop = (schedule.dropPoints || []).find(
                    (d) => (d.name || "").toLowerCase() === dropPoint.toLowerCase()
                );

                if (!pickup || !drop) return false;
                return Number(pickup.order) < Number(drop.order);
            });

            setAvailableSchedules(filtered);
        } catch (error) {
            console.error(error);
            alert("Failed to search available buses");
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleOpenBooking = (schedule) => {
        const pickup = (schedule.pickupPoints || []).find(
            (p) => (p.name || "").toLowerCase() === pickupPoint.toLowerCase()
        );
        const drop = (schedule.dropPoints || []).find(
            (d) => (d.name || "").toLowerCase() === dropPoint.toLowerCase()
        );

        if (!pickup || !drop) {
            alert("Pickup/Drop point not found in selected schedule");
            return;
        }

        const url = `/admin/bookings/create?scheduleId=${schedule._id}&pickupPointOrder=${pickup.order}&dropPointOrder=${drop.order}`;
        window.location.href = url;
    };

    const handleMarkPaid = async (bookingId) => {
        const amount = window.prompt("Enter payment amount:");
        if (amount === null) return;

        try {
            setMarkingPaidId(bookingId);

            const res = await fetch(`/api/admin/bookings/${bookingId}/mark-paid`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    paymentMethod: "CASH",
                    notes: "Marked paid from admin panel",
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(data.message || "Failed to mark paid");
                return;
            }

            alert("Payment updated successfully");
            fetchBookings(pagination.page || 1);
        } catch (error) {
            console.error(error);
            alert("Failed to mark paid");
        } finally {
            setMarkingPaidId("");
        }
    };

    const handleCancelBooking = async (bookingId) => {
        const ok = window.confirm("Are you sure you want to cancel this booking?");
        if (!ok) return;

        try {
            setCancellingId(bookingId);

            const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cancelReason: "Cancelled by admin",
                    issueVoucher: false,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(data.message || "Failed to cancel booking");
                return;
            }

            alert(data.message || "Booking cancelled successfully");
            fetchBookings(pagination.page || 1);
        } catch (error) {
            console.error(error);
            alert("Failed to cancel booking");
        } finally {
            setCancellingId("");
        }
    };

    const stats = useMemo(() => {
        return {
            total: pagination.total || bookings.length,
            confirmed: bookings.filter((b) => b.bookingStatus === "CONFIRMED").length,
            pending: bookings.filter((b) => b.bookingStatus === "PENDING").length,
            cancelled: bookings.filter((b) => b.bookingStatus === "CANCELLED").length,
        };
    }, [bookings, pagination]);

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-5 md:p-6">
            {/* Header */}
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0B5D5A]">
                    MORYA TRAVELS DASHBOARD
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Booking Management
                </h1>
                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                    Search available buses by pickup, drop and date. Then create bookings.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmed</p>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
                        <p className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cancelled</p>
                        <p className="mt-2 text-2xl font-bold text-red-600">{stats.cancelled}</p>
                    </div>
                </div>
            </div>

            {/* Search Available Buses */}
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                            <Search className="h-6 w-6 text-[#0B5D5A]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                                Search Available Buses
                            </h2>
                            <p className="text-sm text-slate-500">
                                First select pickup, drop and travel date
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Pickup Point <span className="text-red-500">*</span>
                            </label>
                            <Select value={pickupPoint} onChange={(e) => setPickupPoint(e.target.value)}>
                                <option value="">Select Pickup Point</option>
                                {points.map((point) => (
                                    <option key={point} value={point}>
                                        {point}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Drop Point <span className="text-red-500">*</span>
                            </label>
                            <Select value={dropPoint} onChange={(e) => setDropPoint(e.target.value)}>
                                <option value="">Select Drop Point</option>
                                {points.map((point) => (
                                    <option key={point} value={point}>
                                        {point}
                                    </option>
                                ))}
                            </Select>
                        </div>

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

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleSearchSchedules}
                                disabled={loadingSchedules}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B5D5A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0B5D5A]/20 transition hover:bg-[#094B49] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loadingSchedules ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4" />
                                        Search Buses
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Schedules */}
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 sm:p-5">
                    <h2 className="text-lg font-bold text-slate-900">Available Buses</h2>
                    <p className="text-sm text-slate-500">
                        Matching schedules for selected pickup, drop and date
                    </p>
                </div>

                <div className="p-4 sm:p-5">
                    {availableSchedules.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                            <BusFront className="mx-auto h-10 w-10 text-slate-300" />
                            <p className="mt-3 text-base font-semibold text-slate-700">
                                No buses shown yet
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Select pickup point, drop point and date, then click Search Buses
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {availableSchedules.map((schedule) => {
                                const pickup = (schedule.pickupPoints || []).find(
                                    (p) => (p.name || "").toLowerCase() === pickupPoint.toLowerCase()
                                );
                                const drop = (schedule.dropPoints || []).find(
                                    (d) => (d.name || "").toLowerCase() === dropPoint.toLowerCase()
                                );

                                return (
                                    <div
                                        key={schedule._id}
                                        className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                                                    <BusFront className="h-6 w-6 text-[#0B5D5A]" />
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold text-slate-900">
                                                        {schedule.busNumber} - {schedule.busName}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {schedule.routeName || "Route"}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="inline-flex w-fit rounded-full border border-[#0B5D5A]/15 bg-[#0B5D5A]/10 px-3 py-1 text-xs font-bold text-[#0B5D5A]">
                                                {schedule.tripDirection}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                                <p className="text-xs font-semibold text-slate-500">Pickup</p>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {pickup?.name || "-"}
                                                </p>
                                                <p className="text-xs text-slate-500">{pickup?.time || "--:--"}</p>
                                            </div>

                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                                <p className="text-xs font-semibold text-slate-500">Drop</p>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {drop?.name || "-"}
                                                </p>
                                                <p className="text-xs text-slate-500">{drop?.time || "--:--"}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                    Date
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {schedule.travelDate
                                                        ? new Date(schedule.travelDate).toLocaleDateString("en-GB")
                                                        : "-"}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                    Seats
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {schedule.seatLayout || 0}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                    Fare
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    ₹ {Number(schedule.effectiveFare || schedule.baseFare || 0)}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                    Status
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-emerald-600">
                                                    {schedule.isBookingOpen ? "OPEN" : "CLOSED"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenBooking(schedule)}
                                                className="inline-flex items-center gap-2 rounded-2xl bg-[#0B5D5A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0B5D5A]/20 transition hover:bg-[#094B49]"
                                            >
                                                <Ticket className="h-4 w-4" />
                                                Book This Bus
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 sm:p-5">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Bookings Table</h2>
                            <p className="text-sm text-slate-500">Manage existing bookings</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search booking code / name / phone / email"
                            />

                            <Select value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)}>
                                <option value="">All Booking Status</option>
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="PARTIAL">PARTIAL</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </Select>

                            <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                                <option value="">All Payment Status</option>
                                <option value="UNPAID">UNPAID</option>
                                <option value="PARTIAL">PARTIAL</option>
                                <option value="PAID">PAID</option>
                            </Select>

                            <div className="grid grid-cols-[1fr_130px] gap-3">
                                <Input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => fetchBookings(1)}
                                    className="rounded-2xl bg-[#0B5D5A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#094B49]"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loadingBookings ? (
                    <div className="p-8 text-center text-sm font-medium text-slate-500">
                        Loading bookings...
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-base font-semibold text-slate-700">No bookings found</p>
                        <p className="mt-1 text-sm text-slate-500">Try changing the filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="min-w-full">
                                <thead className="bg-slate-50/90">
                                    <tr className="border-b border-slate-200">
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Booking</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Passenger</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Route</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Travel Date</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Amount</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Booking Status</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Payment</th>
                                        <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {bookings.map((booking) => (
                                        <tr key={booking._id} className="transition-colors duration-200 hover:bg-[#0B5D5A]/[0.03]">
                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-bold text-slate-900">{booking.bookingCode}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Seats: {(booking.passengers || []).map((p) => p.seatNumber).join(", ")}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {booking.contactDetails?.fullName || "-"}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {booking.contactDetails?.phoneNumber || "-"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {booking.boardingPoint || "-"} → {booking.droppingPoint || "-"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {booking.travelDate
                                                        ? new Date(booking.travelDate).toLocaleDateString("en-GB")
                                                        : "-"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-bold text-slate-900">
                                                    ₹ {Number(booking.finalPayableAmount || 0)}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Paid: ₹ {Number(booking.amountPaid || 0)}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <StatusBadge value={booking.bookingStatus} type="booking" />
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <StatusBadge value={booking.paymentStatus} type="payment" />
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <div className="flex flex-wrap items-center justify-center gap-2">
                                                    {booking.bookingStatus !== "CANCELLED" && booking.paymentStatus !== "PAID" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMarkPaid(booking._id)}
                                                            disabled={markingPaidId === booking._id}
                                                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A] disabled:opacity-60"
                                                        >
                                                            <IndianRupee className="h-4 w-4" />
                                                            {markingPaidId === booking._id ? "Processing..." : "Mark Paid"}
                                                        </button>
                                                    )}

                                                    {booking.bookingStatus !== "CANCELLED" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCancelBooking(booking._id)}
                                                            disabled={cancellingId === booking._id}
                                                            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                            {cancellingId === booking._id ? "Cancelling..." : "Cancel"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="grid gap-4 p-4 lg:hidden">
                            {bookings.map((booking) => (
                                <div
                                    key={booking._id}
                                    className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{booking.bookingCode}</p>
                                            <p className="text-xs text-slate-500">
                                                {booking.contactDetails?.fullName || "-"}
                                            </p>
                                        </div>
                                        <StatusBadge value={booking.bookingStatus} type="booking" />
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <p className="text-slate-500">Route</p>
                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {booking.boardingPoint || "-"} → {booking.droppingPoint || "-"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Travel Date</p>
                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {booking.travelDate
                                                        ? new Date(booking.travelDate).toLocaleDateString("en-GB")
                                                        : "-"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Amount</p>
                                                <p className="mt-1 font-semibold text-slate-800">
                                                    ₹ {Number(booking.finalPayableAmount || 0)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Paid</p>
                                                <p className="mt-1 font-semibold text-slate-800">
                                                    ₹ {Number(booking.amountPaid || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <StatusBadge value={booking.paymentStatus} type="payment" />
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        {booking.bookingStatus !== "CANCELLED" && booking.paymentStatus !== "PAID" && (
                                            <button
                                                type="button"
                                                onClick={() => handleMarkPaid(booking._id)}
                                                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A]"
                                            >
                                                Mark Paid
                                            </button>
                                        )}

                                        {booking.bookingStatus !== "CANCELLED" && (
                                            <button
                                                type="button"
                                                onClick={() => handleCancelBooking(booking._id)}
                                                className="rounded-2xl border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing page <span className="font-semibold text-slate-700">{pagination.page}</span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-700">{pagination.totalPages || 1}</span>
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={pagination.page <= 1}
                                    onClick={() => fetchBookings((pagination.page || 1) - 1)}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    disabled={pagination.page >= (pagination.totalPages || 1)}
                                    onClick={() => fetchBookings((pagination.page || 1) + 1)}
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