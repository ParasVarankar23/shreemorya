"use client";

import React from "react";
import { Bus, Pencil, Trash2, Eye } from "lucide-react";

const THEME = "#0E6B68";

export default function BusTable({
    buses = [],
    loading = false,
    onEdit,
    onDelete,
    onView,
}) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" style={{ borderTopColor: THEME }} />
                <p className="mt-4 text-sm text-slate-500">Loading buses...</p>
            </div>
        );
    }

    if (!buses.length) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <div
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: "#E8F5F4" }}
                >
                    <Bus className="h-7 w-7" style={{ color: THEME }} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No buses found</h3>
                <p className="mt-1 text-sm text-slate-500">
                    Add your first bus to start managing routes and seat layouts.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Desktop / Tablet Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200">
                                {["Bus", "Type", "Seats", "Route", "Trip", "Status", "Actions"].map((head) => (
                                    <th
                                        key={head}
                                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {buses.map((bus) => (
                                <tr key={bus._id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="font-semibold text-slate-900">{bus.busName}</p>
                                            <p className="text-xs text-slate-500">{bus.busNumber}</p>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-700">{bus.busType}</td>

                                    <td className="px-4 py-4">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                            {bus.seatLayout} Seats
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="max-w-[260px]">
                                            <p className="truncate text-sm font-medium text-slate-800">{bus.routeName}</p>
                                            <p className="truncate text-xs text-slate-500">
                                                {bus.forwardTrip?.from} → {bus.forwardTrip?.to}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-700">{bus.tripType}</td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${bus.status === "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : bus.status === "MAINTENANCE"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-slate-100 text-slate-700"
                                                }`}
                                        >
                                            {bus.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onView?.(bus)}
                                                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                                                title="View"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit?.(bus)}
                                                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete?.(bus)}
                                                className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
                {buses.map((bus) => (
                    <div key={bus._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-base font-semibold text-slate-900">{bus.busName}</p>
                                <p className="text-xs text-slate-500">{bus.busNumber}</p>
                            </div>

                            <span
                                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${bus.status === "ACTIVE"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : bus.status === "MAINTENANCE"
                                            ? "bg-amber-50 text-amber-700"
                                            : "bg-slate-100 text-slate-700"
                                    }`}
                            >
                                {bus.status}
                            </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[11px] uppercase tracking-wide text-slate-500">Type</p>
                                <p className="mt-1 font-medium text-slate-800">{bus.busType}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[11px] uppercase tracking-wide text-slate-500">Seats</p>
                                <p className="mt-1 font-medium text-slate-800">{bus.seatLayout}</p>
                            </div>
                        </div>

                        <div className="mt-3 rounded-xl bg-slate-50 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Route</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">{bus.routeName}</p>
                            <p className="mt-1 text-xs text-slate-500">
                                {bus.forwardTrip?.from} → {bus.forwardTrip?.to}
                            </p>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <button
                                onClick={() => onView?.(bus)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                <Eye className="h-4 w-4" />
                                View
                            </button>
                            <button
                                onClick={() => onEdit?.(bus)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white transition"
                                style={{ backgroundColor: THEME }}
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete?.(bus)}
                                className="flex items-center justify-center rounded-xl border border-red-200 px-3 py-2.5 text-red-600 transition hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}