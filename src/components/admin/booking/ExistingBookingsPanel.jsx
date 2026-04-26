"use client";

import { useMemo, useState } from "react";
import { Ban, Eye, Search } from "lucide-react";
import { formatCurrency } from "./bookingHelpers";

export default function ExistingBookingsPanel({
    bookings = [],
    loading = false,
    onViewBooking,
    onViewBlockedSeat,
}) {
    const [query, setQuery] = useState("");

    // ✅ Separate real bookings from blocked bookings
    const { activeBookings, blockedBookingItems } = useMemo(() => {
        const active = [];
        const blocked = [];

        bookings.forEach((booking) => {
            const seatStatus = String(booking?.seatStatus || "").toLowerCase();
            const bookingStatus = String(booking?.bookingStatus || "").toUpperCase();

            // ✅ Only real blocked seats go to blocked section
            if (seatStatus === "blocked") {
                const seats = Array.isArray(booking?.seats) ? booking.seats : [];
                seats.forEach((seatNo) => {
                    blocked.push({
                        seatNo: String(seatNo),
                        booking,
                    });
                });
                return;
            }

            // ✅ Cancelled bookings should NOT appear anywhere in panel
            if (
                seatStatus === "cancelled" ||
                (bookingStatus === "CANCELLED" && seatStatus !== "blocked")
            ) {
                return;
            }

            // ✅ Only active bookings show in Existing Bookings
            active.push(booking);
        });

        return {
            activeBookings: active,
            blockedBookingItems: blocked,
        };
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return activeBookings;

        return activeBookings.filter((booking) => {
            const seatText = (booking?.seats || []).join(",").toLowerCase();
            const name = String(booking?.customerName || "").toLowerCase();
            const phone = String(booking?.customerPhone || "").toLowerCase();
            const pickup = String(booking?.pickupName || "").toLowerCase();
            const drop = String(booking?.dropName || "").toLowerCase();
            const code = String(booking?.bookingCode || "").toLowerCase();

            return (
                seatText.includes(q) ||
                name.includes(q) ||
                phone.includes(q) ||
                pickup.includes(q) ||
                drop.includes(q) ||
                code.includes(q)
            );
        });
    }, [activeBookings, query]);

    const filteredBlocked = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return blockedBookingItems;

        return blockedBookingItems.filter((item) => {
            const seatText = String(item?.seatNo || "").toLowerCase();
            const code = String(item?.booking?.bookingCode || "").toLowerCase();
            return seatText.includes(q) || code.includes(q);
        });
    }, [blockedBookingItems, query]);

    return (
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-[28px] font-bold leading-tight text-slate-900">
                            Existing Bookings
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 sm:text-base">
                            {filteredBookings.length} booking(s) • {filteredBlocked.length} blocked
                        </p>
                    </div>

                    <div className="rounded-full bg-[#0B5D5A]/10 px-3 py-1.5 text-sm font-bold text-[#0B5D5A]">
                        Total: {filteredBookings.length + filteredBlocked.length}
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                <div className="relative mb-4">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search seat, name, phone..."
                        className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                    />
                </div>

                <div className="max-h-[650px] space-y-3 overflow-y-auto pr-1">
                    {loading ? (
                        <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
                            Loading bookings...
                        </div>
                    ) : (
                        <>
                            {filteredBookings.length === 0 && filteredBlocked.length === 0 ? (
                                <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                                    <div className="text-lg font-semibold text-slate-700">
                                        No bookings or blocked seats
                                    </div>
                                    <div className="mt-2 text-sm text-slate-500">
                                        Once seats are booked or blocked, they will appear here.
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {filteredBookings.map((booking) => (
                                        <button
                                            key={booking._id}
                                            type="button"
                                            onClick={() => onViewBooking?.(booking)}
                                            className="w-full rounded-[20px] border border-slate-200 bg-slate-50 p-3 text-left transition-all duration-200 hover:border-[#0B5D5A]/20 hover:bg-white"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-[#0B5D5A]/10 px-2.5 py-1 text-[11px] font-bold text-[#0B5D5A]">
                                                            Seat {Array.isArray(booking?.seats) ? booking.seats.join(", ") : "-"}
                                                        </span>
                                                        <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                                                            {booking?.bookingCode || "BOOKING"}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 text-base font-bold text-slate-900">
                                                        {booking?.customerName || "Passenger"}
                                                    </div>

                                                    <div className="mt-0.5 text-xs font-medium text-slate-500">
                                                        {booking?.customerPhone || "-"}
                                                    </div>

                                                    <div className="mt-2 text-xs font-medium text-slate-500">
                                                        {booking?.pickupName || "-"} ({booking?.pickupTime || "--:--"}) →{" "}
                                                        {booking?.dropName || "-"} ({booking?.dropTime || "--:--"})
                                                    </div>

                                                    <div className="mt-2 text-sm font-bold text-slate-800">
                                                        Fare: {formatCurrency(booking?.finalPayableAmount || booking?.fare || 0)}
                                                    </div>
                                                </div>

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0B5D5A] shadow-sm">
                                                    <Eye className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}

                                    {filteredBlocked.length > 0 && (
                                        <div className="pt-1">
                                            <div className="mb-2 text-xs font-bold tracking-[0.2em] text-[#EA580C]">
                                                BLOCKED SEATS
                                            </div>

                                            <div className="space-y-2">
                                                {filteredBlocked.map((item) => (
                                                    <button
                                                        key={`${item.booking?._id}-${item.seatNo}`}
                                                        type="button"
                                                        onClick={() => onViewBlockedSeat?.(item.seatNo)}
                                                        className="flex w-full items-center justify-between rounded-[18px] border border-orange-200 bg-orange-50 px-3 py-3 text-left transition hover:bg-orange-100"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#EA580C] shadow-sm">
                                                                <Ban className="h-4 w-4" />
                                                            </div>

                                                            <div>
                                                                <div className="text-sm font-bold text-[#C2410C]">
                                                                    Seat {item.seatNo}
                                                                </div>
                                                                <div className="text-xs text-orange-700">
                                                                    Blocked seat
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#C2410C]">
                                                            View
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}