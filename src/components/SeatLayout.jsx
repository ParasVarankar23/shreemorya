"use client";

import clsx from "clsx";
import { Bus } from "lucide-react";

function toStr(value) {
    return String(value || "");
}

export function getSeatRows(total) {
    const seatMaps = {
        21: [
            { left: [20, 21], right: null, isFront: true },
            { left: 1, right: [2, 3] },
            { left: 6, right: [5, 4] },
            { left: 7, right: [8, 9] },
            { left: 12, right: [11, 10] },
            { left: 13, right: [14, 15] },
            { bottom: [19, 18, 17, 16], onlyBottom: true },
        ],

        32: [
            { left: 32, right: null },
            { left: null, right: [1, 2] },
            { left: [6, 5], right: [4, 3] },
            { left: [7, 8], right: [9, 10] },
            { left: [14, 13], right: [12, 11] },
            { left: [15, 16], right: [17, 18] },
            { left: [22, 21], right: [20, 19] },
            { left: [23, 24], right: [25, 26] },
            { bottom: [31, 30, 29, 28, 27], onlyBottom: true },
        ],

        35: [
            { left: null, right: [1, 2] },
            { left: [6, 5], right: [4, 3] },
            { left: [7, 8], right: [9, 10] },
            { left: [14, 13], right: [12, 11] },
            { left: [15, 16], right: [17, 18] },
            { left: [22, 21], right: [20, 19] },
            { left: [23, 24], right: [25, 26] },
            { left: [30, 29], right: [28, 27] },
            { bottom: [31, 32, 33, 34, 35], onlyBottom: true },
        ],

        39: [
            { left: null, right: [1, 2] },
            { left: [6, 5], right: [4, 3] },
            { left: [7, 8], right: [9, 10] },
            { left: [14, 13], right: [12, 11] },
            { left: [15, 16], right: [17, 18] },
            { left: [22, 21], right: [20, 19] },
            { left: [23, 24], right: [25, 26] },
            { left: [30, 29], right: [28, 27] },
            { left: [31, 32], right: [33, 34] },
            { bottom: [39, 38, 37, 36, 35], onlyBottom: true },
        ],
    };

    return seatMaps[total] || seatMaps[39];
}

export default function SeatLayout({
    layout = "39",
    bookedSeats = [],
    bookedMap = {},
    selectedSeats = [],
    onSelect,
    onViewBooking,
    onBlockedSeat,
    compact = false,
    cabins = [],
    tables = [],
    cabinLimit = 10,
    tableLimit = 10,
}) {
    const totalSeats = Number(String(layout || "39")) || 39;
    const rows = getSeatRows(totalSeats);

    const safeCabins = Array.isArray(cabins) ? cabins.slice(0, cabinLimit) : [];
    const cabinSeatIds = safeCabins.map((c, i) => ({
        seatId: String(c?.seatNo || c?.label || `CB${i + 1}`),
        displayLabel: `C${i + 1}`,
    }));

    const safeTables = Array.isArray(tables) ? tables.slice(0, tableLimit) : [];
    const tableLabels = safeTables.map((t, i) => ({
        seatId: String(t?.seatNo || t?.label || `T${i + 1}`),
        displayLabel: `T${i + 1}`,
    }));

    const bookedSet = new Set((bookedSeats || []).map((s) => toStr(s)));
    const selectedSet = new Set((selectedSeats || []).map((s) => toStr(s)));

    const renderSeat = (seatValue, isCabin = false) => {
        if (!seatValue) return null;

        const id = toStr(seatValue);
        const booking = bookedMap?.[id] || null;
        const isBlocked = booking?.status === "blocked";
        const isBooked = bookedSet.has(id);
        const isSelected = selectedSet.has(id);

        const base =
            "flex items-center justify-center rounded-xl border font-semibold transition-all duration-200 select-none shrink-0 shadow-sm";

        const sizeCls = compact
            ? "h-8 min-w-[34px] px-1 text-[10px] sm:h-9 sm:min-w-[38px]"
            : "h-9 min-w-[36px] px-2 text-[11px] sm:h-10 sm:min-w-[42px] sm:text-xs md:h-11 md:min-w-[48px] md:text-sm";

        const cls = clsx(base, sizeCls, {
            "bg-red-200 border-red-400 text-red-900 cursor-pointer":
                isBooked && !isBlocked,
            "bg-amber-100 border-amber-300 text-amber-900 cursor-not-allowed opacity-90":
                isBlocked,
            "bg-[#0B5D5A] border-[#094B49] text-white shadow-md scale-[1.02]":
                isSelected && !isBooked && !isBlocked,
            "bg-sky-100 border-sky-300 text-sky-900 hover:bg-sky-200 cursor-pointer":
                isCabin && !isBooked && !isBlocked && !isSelected,
            "bg-white border-slate-300 text-slate-800 hover:bg-[#0B5D5A]/5 hover:border-[#0B5D5A]/30 cursor-pointer":
                !isBooked && !isBlocked && !isSelected && !isCabin,
        });

        return (
            <button
                key={id}
                type="button"
                onClick={() => {
                    if (isBlocked) {
                        if (onBlockedSeat) {
                            return onBlockedSeat(id, booking);
                        }
                        return;
                    }

                    if (isBooked) {
                        if (onViewBooking) return onViewBooking(id, booking);
                        return;
                    }

                    if (onSelect) onSelect(id);
                }}
                className={cls}
            >
                {id}
            </button>
        );
    };

    const renderSeatGroup = (group, isCabin = false) => {
        if (!group) return null;

        if (Array.isArray(group)) {
            return (
                <div className="flex gap-1.5 sm:gap-2">
                    {group.map((seat) => (
                        <div key={seat}>{renderSeat(seat, isCabin)}</div>
                    ))}
                </div>
            );
        }

        return renderSeat(group, isCabin);
    };

    return (
        <div className="w-full">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-bold text-slate-800 sm:text-base md:text-lg">
                    Seat Layout ({totalSeats})
                </div>

                <div className="rounded-full border border-[#0B5D5A]/20 bg-[#0B5D5A]/5 px-3 py-1 text-[11px] font-semibold text-[#0B5D5A]">
                    Cabin Limit: {cabinSeatIds.length}/{cabinLimit}
                </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3 shadow-sm sm:p-4 md:p-5">
                <div className="mb-4 flex justify-end">
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:px-4">
                        <Bus className="h-4 w-4 text-[#0B5D5A] sm:h-5 sm:w-5" />
                        <span className="text-[11px] font-semibold text-slate-700 sm:text-xs md:text-sm">
                            Driver
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className={clsx(compact ? "min-w-0" : "min-w-[320px] sm:min-w-[420px] md:min-w-[560px]")}>
                        <div className="space-y-2.5 sm:space-y-3">
                            {rows.map((row, index) => {
                                const isFront = !!row.isFront;
                                const isBack = !!row.isBack;
                                const onlyBottom = !!row.onlyBottom;

                                if (isFront) {
                                    return (
                                        <div key={index} className="mb-2 flex justify-start sm:mb-3">
                                            <div className="w-full">
                                                <div className="flex justify-start">{renderSeatGroup(row.left)}</div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (onlyBottom && Array.isArray(row.bottom)) {
                                    return (
                                        <div key={index} className="pt-2">
                                            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                                                {row.bottom.map((seat) => (
                                                    <div key={seat}>{renderSeat(seat)}</div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={index}
                                        className={clsx(
                                            "grid items-center gap-2 sm:gap-3 md:gap-4",
                                            compact
                                                ? "grid-cols-[1fr_26px_1fr]"
                                                : isBack
                                                    ? "grid-cols-[1fr_auto_1fr]"
                                                    : "grid-cols-[1fr_minmax(40px,1.1fr)_1fr]"
                                        )}
                                    >
                                        <div className="flex justify-start">{renderSeatGroup(row.left)}</div>

                                        <div className="flex justify-center">
                                            {row.center ? (
                                                renderSeat(row.center)
                                            ) : (
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11" />
                                            )}
                                        </div>

                                        <div className="flex justify-end">{renderSeatGroup(row.right)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {cabinSeatIds.length > 0 && (
                    <div className="mt-5 border-t border-slate-200 pt-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-xs font-semibold text-slate-700 sm:text-sm">Cabin Seats</div>
                            <div className="text-[11px] text-slate-500">Max 10 only</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5">
                            {cabinSeatIds.map((cabin) => (
                                <div key={cabin.displayLabel} className="flex flex-col items-center gap-1">
                                    <div className="rounded-full border border-sky-300 bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-900">
                                        {cabin.displayLabel}
                                    </div>
                                    {renderSeat(cabin.seatId, true)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tableLabels.length > 0 && (
                    <div className="mt-5 border-t border-slate-200 pt-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-xs font-semibold text-slate-700 sm:text-sm">Table Seats</div>
                            <div className="text-[11px] text-slate-500">Max 10 only</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5">
                            {tableLabels.map((table) => (
                                <div key={table.displayLabel} className="flex flex-col items-center gap-1">
                                    <div className="rounded-full border border-violet-300 bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-900">
                                        {table.displayLabel}
                                    </div>
                                    <div className="flex items-center justify-center rounded-xl border border-violet-300 bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-900 shadow-sm">
                                        {table.seatId}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-3 md:grid-cols-6 sm:text-[11px]">
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm">
                        <span className="h-3.5 w-3.5 rounded-full border border-slate-300 bg-white" />
                        Available
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-[#0B5D5A] bg-[#0B5D5A] px-3 py-2 text-white shadow-sm">
                        <span className="h-3.5 w-3.5 rounded-full bg-white" />
                        Selected
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-red-400 bg-red-100 px-3 py-2 text-red-900 shadow-sm">
                        <span className="h-3.5 w-3.5 rounded-full bg-red-400" />
                        Booked
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-sky-400 bg-sky-100 px-3 py-2 text-sky-900 shadow-sm">
                        <span className="h-3.5 w-3.5 rounded-full bg-sky-400" />
                        Cabin
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-amber-400 bg-amber-100 px-3 py-2 text-amber-900 shadow-sm">
                        <span className="h-3.5 w-3.5 rounded-full bg-amber-400" />
                        Blocked
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-violet-400 bg-violet-100 px-3 py-2 text-violet-900 shadow-sm">
                        <span className="h-3.5 w-3.5 rounded-full bg-violet-400" />
                        Table
                    </div>
                </div>
            </div>
        </div>
    );
}