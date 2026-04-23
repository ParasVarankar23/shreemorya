"use client";

import clsx from "clsx";
import { Bus } from "lucide-react";

function toStr(value) {
    return String(value || "");
}

/**
 * Supported layouts:
 * 21, 32, 35, 39
 *
 * Row formats:
 * {
 *   left: number | number[] | null,
 *   center: number | null,
 *   right: number | number[] | null,
 *   isFront?: boolean,
 *   isBack?: boolean,
 *   bottom?: number[],
 *   onlyBottom?: boolean,
 * }
 */
export function getSeatRows(total) {
    const seatMaps = {
        // =========================
        // 21 SEAT LAYOUT
        // Front: 20, 21
        // Back: 19,18,17,16
        // =========================
        21: [
            { left: [20, 21], right: null, isFront: true },

            { left: 1, right: [2, 3] },
            { left: 6, right: [5, 4] },
            { left: 7, right: [8, 9] },
            { left: 12, right: [11, 10] },
            { left: 13, right: [14, 15] },

            { bottom: [19, 18, 17, 16], onlyBottom: true },
        ],

        // =========================
        // 32 SEAT LAYOUT
        // =========================
        32: [
            { left: null, right: [1, 2] },
            { left: [6, 5], right: [4, 3] },
            { left: [7, 8], right: [9, 10] },
            { left: [14, 13], right: [12, 11] },
            { left: [15, 16], right: [17, 18] },
            { left: [22, 21], right: [20, 19] },
            { left: [23, 24], right: [25, 26] },

            { bottom: [31, 30, 29, 28, 27], onlyBottom: true },
        ],

        // =========================
        // 35 SEAT LAYOUT
        // =========================
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

        // =========================
        // 39 SEAT LAYOUT
        // =========================
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
    compact = false,
    cabins = [],
    cabinLimit = 10,
}) {
    const totalSeats = Number(String(layout || "39")) || 39;
    const rows = getSeatRows(totalSeats);

    // Cabin max 10
    const safeCabins = Array.isArray(cabins) ? cabins.slice(0, cabinLimit) : [];
    const cabinSeatIds = safeCabins.map((c, i) => String(c?.seatNo || `CB${i + 1}`));

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
            "bg-red-100 border-red-300 text-red-700 cursor-pointer":
                isBooked && !isBlocked,
            "bg-amber-100 border-amber-300 text-amber-700 cursor-pointer":
                isBlocked,
            "bg-[#f97316] border-[#ea580c] text-white shadow-md scale-[1.02]":
                isSelected && !isBooked && !isBlocked,
            "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer":
                isCabin && !isBooked && !isBlocked && !isSelected,
            "bg-white border-slate-300 text-slate-800 hover:bg-orange-50 hover:border-orange-300 cursor-pointer":
                !isBooked && !isBlocked && !isSelected && !isCabin,
        });

        return (
            <button
                key={id}
                type="button"
                onClick={() => {
                    if (isBooked || isBlocked) {
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
            {/* Header */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-bold text-slate-800 sm:text-base md:text-lg">
                    Seat Layout ({totalSeats})
                </div>

                <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700">
                    Cabin Limit: {cabinSeatIds.length}/{cabinLimit}
                </div>
            </div>

            {/* Bus Container */}
            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3 shadow-sm sm:p-4 md:p-5">
                {/* Driver */}
                <div className="mb-4 flex justify-end">
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:px-4">
                        <Bus className="h-4 w-4 text-orange-600 sm:h-5 sm:w-5" />
                        <span className="text-[11px] font-semibold text-slate-700 sm:text-xs md:text-sm">
                            Driver
                        </span>
                    </div>
                </div>

                {/* Seat Layout */}
                <div className="overflow-x-auto">
                    <div className="min-w-[320px] sm:min-w-[420px] md:min-w-[560px]">
                        <div className="space-y-2.5 sm:space-y-3">
                            {rows.map((row, index) => {
                                const isFront = !!row.isFront;
                                const isBack = !!row.isBack;
                                const onlyBottom = !!row.onlyBottom;

                                // Front row support (like 20,21 in 21 layout)
                                if (isFront) {
                                    return (
                                        <div key={index} className="mb-2 flex justify-start sm:mb-3">
                                            <div className="w-full">
                                                <div className="flex justify-start">{renderSeatGroup(row.left)}</div>
                                            </div>
                                        </div>
                                    );
                                }

                                // Bottom full row support
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
                                            isBack
                                                ? "grid-cols-[1fr_auto_1fr]"
                                                : "grid-cols-[1fr_minmax(40px,1.1fr)_1fr]"
                                        )}
                                    >
                                        {/* Left block */}
                                        <div className="flex justify-start">{renderSeatGroup(row.left)}</div>

                                        {/* Center / aisle */}
                                        <div className="flex justify-center">
                                            {row.center ? (
                                                renderSeat(row.center)
                                            ) : (
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11" />
                                            )}
                                        </div>

                                        {/* Right block */}
                                        <div className="flex justify-end">{renderSeatGroup(row.right)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Cabin Seats */}
                {cabinSeatIds.length > 0 && (
                    <div className="mt-5 border-t border-slate-200 pt-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-xs font-semibold text-slate-700 sm:text-sm">
                                Cabin Seats
                            </div>
                            <div className="text-[11px] text-slate-500">Max 10 only</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5">
                            {cabinSeatIds.map((seatId) => (
                                <div key={seatId} className="flex flex-col items-center gap-1">
                                    <div className="text-[10px] font-semibold text-slate-500">CB</div>
                                    {renderSeat(seatId, true)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="mt-5 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-3 md:grid-cols-5 sm:text-[11px]">
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded border border-slate-300 bg-white" />
                        Available
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded bg-[#f97316]" />
                        Selected
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded border border-red-300 bg-red-100" />
                        Booked
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded border border-slate-300 bg-slate-100" />
                        Cabin
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded border border-amber-300 bg-amber-100" />
                        Blocked
                    </div>
                </div>
            </div>
        </div>
    );
}