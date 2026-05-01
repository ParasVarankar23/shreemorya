"use client";

import { BusFront, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BusTable({
    buses = [],
    loading = false,
    onEdit,
    onDelete,
    onViewLayout,
    role = "",
}) {
    const router = useRouter();

    const isStaff = String(role || "").toLowerCase() === "staff";

    if (loading) {
        return (
            <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                    <BusFront className="h-7 w-7 text-[#0B5D5A]" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-500">Loading buses...</p>
            </div>
        );
    }

    if (!buses.length) {
        return (
            <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                    <BusFront className="h-7 w-7 text-[#0B5D5A]" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-700">No buses found</p>
                <p className="mt-1 text-sm text-slate-500">
                    Create a new premium bus to see it listed here.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full">
                    <thead className="bg-slate-50/90">
                        <tr className="border-b border-slate-200">
                            <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                Bus Details
                            </th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                Route
                            </th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                Bus Type
                            </th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                Seat Layout
                            </th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                Fare Rules
                            </th>
                            <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {buses.map((bus) => (
                            <tr
                                key={bus._id}
                                className="transition-colors duration-200 hover:bg-[#0B5D5A]/[0.03]"
                            >
                                {/* Bus */}
                                <td className="px-6 py-5 align-top">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                                            <BusFront className="h-6 w-6 text-[#0B5D5A]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-base font-bold text-slate-900">
                                                {bus.busNumber}
                                            </p>
                                            <p className="mt-0.5 truncate text-sm text-slate-600">
                                                {bus.busName}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Route */}
                                <td className="px-6 py-5 align-top">
                                    <div className="space-y-1.5">
                                        <p className="text-sm font-semibold text-slate-800">{bus.routeName}</p>
                                    </div>
                                </td>

                                {/* Type */}
                                <td className="px-6 py-5 align-top">
                                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                        {String(bus.busType || "").replaceAll("_", " ")}
                                    </span>
                                </td>

                                {/* Layout */}
                                <td className="px-6 py-5 align-top">
                                    <button
                                        type="button"
                                        onClick={() => onViewLayout?.(bus)}
                                        className="inline-flex items-center rounded-full border border-[#0B5D5A]/15 bg-[#0B5D5A]/10 px-3.5 py-1.5 text-xs font-bold text-[#0B5D5A] transition hover:bg-[#0B5D5A]/15"
                                    >
                                        {bus.seatLayout} Seats
                                    </button>
                                </td>

                                {/* Fare Rules */}
                                <td className="px-6 py-5 align-top">
                                    <span className="inline-flex rounded-full border border-[#0B5D5A]/15 bg-[#0B5D5A]/10 px-3.5 py-1.5 text-xs font-bold text-[#0B5D5A]">
                                        Managed Separately
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-5 align-top">
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        {!isStaff && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit?.(bus)}
                                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A]"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/admin/bus/fares?busId=${bus._id}`)}
                                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A]"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Fares
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onDelete?.(bus)}
                                                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                        {isStaff && (
                                            <div className="text-sm font-medium text-slate-500">View Only</div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 p-4 md:hidden">
                {buses.map((bus) => (
                    <div
                        key={bus._id}
                        className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        {/* Top */}
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                                <BusFront className="h-6 w-6 text-[#0B5D5A]" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-base font-bold text-slate-900">{bus.busNumber}</p>
                                <p className="truncate text-sm text-slate-600">{bus.busName}</p>
                            </div>

                            <span className="rounded-full border border-[#0B5D5A]/15 bg-[#0B5D5A]/10 px-3 py-1 text-xs font-bold text-[#0B5D5A]">
                                {bus.seatLayout} Seats
                            </span>
                        </div>

                        {/* Route */}
                        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <p className="text-sm font-semibold text-slate-800">{bus.routeName}</p>
                            <p className="mt-1 text-xs text-slate-600">
                                {bus.forwardTrip?.from || "-"} → {bus.forwardTrip?.to || "-"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                    {String(bus.busType || "").replaceAll("_", " ")}
                                </span>
                                <span className="rounded-full border border-[#0B5D5A]/15 bg-[#0B5D5A]/10 px-2.5 py-1 text-[11px] font-semibold text-[#0B5D5A]">
                                    Fares managed separately
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {!isStaff ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => onEdit?.(bus)}
                                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A]"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => router.push(`/admin/bus/fares?busId=${bus._id}`)}
                                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A]"
                                    >
                                        Fares
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDelete?.(bus)}
                                        className="rounded-2xl border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-500">View</div>
                                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-500">Fares</div>
                                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-500">View Only</div>
                                </>
                            )}
                        </div>

                        {/* View Layout Button */}
                        <button
                            type="button"
                            onClick={() => onViewLayout?.(bus)}
                            className="mt-3 w-full rounded-2xl bg-[#0B5D5A] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#094B49]"
                        >
                            View Seat Layout
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}