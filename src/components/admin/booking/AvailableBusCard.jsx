"use client";

import { BusFront, Clock3, Eye, MapPin, Route } from "lucide-react";

export default function AvailableBusCard({ bus, onViewSeats }) {
    const baseSeats = Number(bus?.seatLayout || 39);
    const cabins = Number(bus?.cabinCount || 0);
    const tables = Number(bus?.tableCount || 0);
    const totalSeats = baseSeats + cabins + tables;
    const booked = Number(bus?.bookedCount || 0);
    const blocked = Number(bus?.blockedCount || 0);
    const available = Math.max(totalSeats - booked - blocked, 0);

    return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] sm:p-5">
            {/* Top Section */}
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                {/* Left */}
                <div className="flex min-w-0 flex-1 gap-3.5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[#0B5D5A]/8 text-[#0B5D5A] ring-1 ring-[#0B5D5A]/8">
                        <BusFront className="h-8 w-8" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[32px]">
                            {bus?.busNumber || "MH00XX0000"}
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-base font-medium text-slate-500 sm:text-lg">
                            <span>{bus?.operatorName || "ShreeMorya"}</span>
                            <span className="text-slate-300">•</span>
                            <span>{bus?.busType || "NON_AC"}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2.5">
                            <span className="rounded-full bg-[#0B5D5A]/8 px-4 py-1.5 text-sm font-bold text-[#0B5D5A] sm:text-base">
                                {totalSeats} Seats
                            </span>

                            <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 sm:text-base">
                                {bus?.busType || "NON_AC"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Button */}
                <button
                    type="button"
                    onClick={onViewSeats}
                    className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-[18px] bg-gradient-to-r from-[#0B5D5A] to-[#0A524F] px-5 text-base font-bold text-white shadow-[0_8px_18px_rgba(11,93,90,0.18)] transition-all duration-200 hover:from-[#094B49] hover:to-[#083F3E] hover:shadow-[0_12px_22px_rgba(11,93,90,0.24)] xl:w-auto xl:min-w-[190px]"
                >
                    <Eye className="h-5 w-5" />
                    View Seats
                </button>
            </div>

            {/* Stats */}
            <div className="mt-5 space-y-3">
                {/* Row 1 */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="TOTAL" value={totalSeats} tone="teal" />
                    <StatCard label="BOOKED" value={booked} tone="slate" />
                    <StatCard label="BLOCKED" value={blocked} tone="amber" />
                </div>
                {/* Row 2 */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="CABINS" value={cabins} tone="indigo" />
                    <StatCard label="TABLE" value={tables} tone="violet" />
                    <StatCard label="AVAILABLE" value={available} tone="green" />
                </div>
            </div>

            {/* Route Info */}
            <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <InfoCard
                    icon={<Route className="h-4.5 w-4.5" />}
                    label="ROUTE"
                    value={bus?.routeName || "-"}
                />
                <InfoCard
                    icon={<MapPin className="h-4.5 w-4.5" />}
                    label="PATH"
                    value={`${bus?.pickupName || "-"} → ${bus?.dropName || "-"}`}
                />
                <InfoCard
                    icon={<Clock3 className="h-4.5 w-4.5" />}
                    label="TIMING"
                    value={`${bus?.startTime || "--:--"} → ${bus?.endTime || "--:--"}`}
                />
            </div>
        </div>
    );
}

function StatCard({ label, value, tone = "slate" }) {
    const toneMap = {
        teal: "bg-[#0B5D5A]/8 text-[#0B5D5A] border border-[#0B5D5A]/8",
        slate: "bg-slate-100 text-slate-700 border border-slate-200",
        amber: "bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]",
        indigo: "bg-indigo-50 text-indigo-700 border border-indigo-100",
        violet: "bg-violet-50 text-violet-700 border border-violet-100",
        green: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    };

    return (
        <div className={`rounded-[20px] p-4 ${toneMap[tone] || toneMap.slate}`}>
            <div className="text-[11px] font-bold tracking-[0.22em] uppercase opacity-90">
                {label}
            </div>
            <div className="mt-2.5 text-3xl font-extrabold sm:text-[36px]">{value}</div>
        </div>
    );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="mb-2.5 flex items-center gap-2.5 text-[#0B5D5A]">
                {icon}
                <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-slate-500">
                    {label}
                </span>
            </div>
            <div className="text-lg font-bold leading-snug text-slate-900 sm:text-[20px]">
                {value}
            </div>
        </div>
    );
}