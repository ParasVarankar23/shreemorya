"use client";

import { Ban, Eye, Search, Ticket, User, VenusAndMars } from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency } from "./bookingHelpers";

function getSeatItemsFromBooking(booking = {}) {
    if (Array.isArray(booking?.seatItems) && booking.seatItems.length > 0) {
        return booking.seatItems;
    }

    const seats = Array.isArray(booking?.seats) ? booking.seats : [];
    const topSeatStatus = String(booking?.seatStatus || "").toLowerCase();

    const fallbackStatus =
        topSeatStatus === "blocked"
            ? "blocked"
            : topSeatStatus === "cancelled"
                ? "cancelled"
                : "booked";

    return seats.map((seatNo) => ({
        seatNo: String(seatNo),
        ticketNo: `${booking?.bookingCode || "BOOK"}-${String(seatNo)}`,
        passengerName: booking?.customerName || "",
        passengerGender: String(booking?.customerGender || "").toLowerCase(),
        fare: booking?.fare || 0,
        seatStatus: fallbackStatus,
    }));
}

export default function ExistingBookingsPanel({
    bookings = [],
    loading = false,
    onViewBooking,
    onViewBlockedSeat,
    onCancel, // (booking, seatNo, actionType)
    onIssueVoucher, // (booking, seatNo)
}) {
    const [query, setQuery] = useState("");

    // NEW: make seat-wise rows
    const { activeSeatRows, blockedSeatRows } = useMemo(() => {
        const active = [];
        const blocked = [];

        bookings.forEach((booking) => {
            const bookingStatus = String(booking?.bookingStatus || "").toUpperCase();
            const seatItems = getSeatItemsFromBooking(booking);

            seatItems.forEach((seatItem) => {
                const seatNo = String(seatItem?.seatNo || "");
                if (!seatNo) return;

                const seatStatus = String(seatItem?.seatStatus || booking?.seatStatus || "").toLowerCase();

                const row = {
                    booking,
                    seatNo,
                    ticketNo: seatItem?.ticketNo || `${booking?.bookingCode || "BOOK"}-${seatNo}`,
                    passengerName: seatItem?.passengerName || booking?.customerName || "Passenger",
                    passengerGender:
                        String(
                            seatItem?.passengerGender || booking?.customerGender || ""
                        ).toLowerCase(),
                    fare: seatItem?.fare || booking?.fare || 0,
                    bookingCode: booking?.bookingCode || "",
                    customerPhone: booking?.customerPhone || "-",
                    pickupName: booking?.pickupName || "-",
                    pickupTime: booking?.pickupTime || "--:--",
                    dropName: booking?.dropName || "-",
                    dropTime: booking?.dropTime || "--:--",
                    paymentStatus: booking?.paymentStatus || "UNPAID",
                    paymentMethod: booking?.paymentMethod || "UNPAID",
                };

                // blocked seat
                if (seatStatus === "blocked") {
                    blocked.push(row);
                    return;
                }

                // cancelled seat => don't show in active
                if (
                    seatStatus === "cancelled" ||
                    (bookingStatus === "CANCELLED" && seatStatus !== "blocked")
                ) {
                    return;
                }

                // active seat
                active.push(row);
            });
        });

        return {
            activeSeatRows: active,
            blockedSeatRows: blocked,
        };
    }, [bookings]);

    const filteredActive = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return activeSeatRows;

        return activeSeatRows.filter((row) => {
            return (
                String(row?.seatNo || "").toLowerCase().includes(q) ||
                String(row?.ticketNo || "").toLowerCase().includes(q) ||
                String(row?.passengerName || "").toLowerCase().includes(q) ||
                String(row?.customerPhone || "").toLowerCase().includes(q) ||
                String(row?.pickupName || "").toLowerCase().includes(q) ||
                String(row?.dropName || "").toLowerCase().includes(q) ||
                String(row?.bookingCode || "").toLowerCase().includes(q)
            );
        });
    }, [activeSeatRows, query]);

    const filteredBlocked = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return blockedSeatRows;

        return blockedSeatRows.filter((row) => {
            return (
                String(row?.seatNo || "").toLowerCase().includes(q) ||
                String(row?.ticketNo || "").toLowerCase().includes(q) ||
                String(row?.bookingCode || "").toLowerCase().includes(q)
            );
        });
    }, [blockedSeatRows, query]);

    return (
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-[28px] font-bold leading-tight text-slate-900">
                            Existing Bookings
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 sm:text-base">
                            {filteredActive.length} active seat(s) • {filteredBlocked.length} blocked
                        </p>
                    </div>

                    <div className="rounded-full bg-[#0B5D5A]/10 px-3 py-1.5 text-sm font-bold text-[#0B5D5A]">
                        Total: {filteredActive.length + filteredBlocked.length}
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
                        placeholder="Search seat, ticket, name, phone..."
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
                            {filteredActive.length === 0 && filteredBlocked.length === 0 ? (
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
                                    {/* ACTIVE SEAT-WISE BOOKINGS */}
                                    {filteredActive.map((row) => (
                                        <div
                                            key={`${row.booking?._id}-${row.seatNo}-${row.ticketNo}`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => onViewBooking?.(row.booking, row.seatNo)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    onViewBooking?.(row.booking, row.seatNo);
                                                }
                                            }}
                                            className="w-full rounded-[20px] border border-slate-200 bg-slate-50 p-3 text-left transition-all duration-200 hover:border-[#0B5D5A]/20 hover:bg-white"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-[#0B5D5A]/10 px-2.5 py-1 text-[11px] font-bold text-[#0B5D5A]">
                                                            Seat {row.seatNo}
                                                        </span>

                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                                                            <Ticket className="h-3 w-3" />
                                                            {row.ticketNo || row.bookingCode || "TICKET"}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        <div className="text-base font-bold text-slate-900">
                                                            {row.passengerName || "Passenger"}
                                                        </div>

                                                        {row.passengerGender && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-pink-700">
                                                                <VenusAndMars className="h-3 w-3" />
                                                                {row.passengerGender.charAt(0).toUpperCase() +
                                                                    row.passengerGender.slice(1)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <User className="h-3.5 w-3.5" />
                                                            {row.customerPhone || "-"}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 text-xs font-medium text-slate-500">
                                                        {row.pickupName || "-"} ({row.pickupTime || "--:--"}) →{" "}
                                                        {row.dropName || "-"} ({row.dropTime || "--:--"})
                                                    </div>

                                                    <div className="mt-2 text-sm font-bold text-slate-800">
                                                        Fare: {formatCurrency(row?.fare || 0)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {onCancel ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    onCancel?.(row.booking, row.seatNo, "NO_REFUND");
                                                                } catch (err) {
                                                                    // swallow
                                                                }
                                                            }}
                                                            className="rounded-md bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    ) : null}

                                                    {onIssueVoucher ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    onIssueVoucher?.(row.booking, row.seatNo);
                                                                } catch (err) {
                                                                    // swallow
                                                                }
                                                            }}
                                                            className="rounded-md bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                                                        >
                                                            Issue Voucher
                                                        </button>
                                                    ) : null}

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0B5D5A] shadow-sm">
                                                        <Eye className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* BLOCKED SEATS */}
                                    {filteredBlocked.length > 0 && (
                                        <div className="pt-1">
                                            <div className="mb-2 text-xs font-bold tracking-[0.2em] text-[#EA580C]">
                                                BLOCKED SEATS
                                            </div>

                                            <div className="space-y-2">
                                                {filteredBlocked.map((row) => (
                                                    <div
                                                        key={`${row.booking?._id}-${row.seatNo}-${row.ticketNo}`}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => onViewBlockedSeat?.(row.seatNo)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" || e.key === " ") {
                                                                e.preventDefault();
                                                                onViewBlockedSeat?.(row.seatNo);
                                                            }
                                                        }}
                                                        className="flex w-full items-center justify-between rounded-[18px] border border-orange-200 bg-orange-50 px-3 py-3 text-left transition hover:bg-orange-100"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-[#EA580C] shadow-sm">
                                                                <Ban className="h-4 w-4" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <div className="text-sm font-bold text-[#C2410C]">
                                                                        Seat {row.seatNo}
                                                                    </div>

                                                                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#C2410C]">
                                                                        {row.ticketNo || row.bookingCode || "BLOCKED"}
                                                                    </span>
                                                                </div>

                                                                <div className="text-xs text-orange-700">
                                                                    Blocked seat
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#C2410C]">
                                                            View
                                                        </span>
                                                    </div>
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