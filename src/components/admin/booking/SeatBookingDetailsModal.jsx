"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { formatCurrency } from "./bookingHelpers";

export default function SeatBookingDetailsModal({
    open,
    data,
    loading = false,
    onClose,
    onEdit,
    onCancel,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    useEffect(() => {
        if (data) {
            setCustomerName(data?.customerName || "");
            setCustomerPhone(data?.customerPhone || "");
            setCustomerEmail(data?.customerEmail || "");
            setIsEditing(false);
        }
    }, [data]);

    if (!open || !data) return null;

    const handleSave = () => {
        onEdit?.({
            customerName,
            customerPhone,
            customerEmail,
        });
    };

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 px-4 py-6">
            <div className="w-full max-w-[640px] rounded-[36px] bg-white p-6 shadow-[0_30px_70px_rgba(0,0,0,0.25)] sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                            Seat {data?.seatNo} — {data?.bookingCode || "BOOKING"}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:bg-slate-50"
                    >
                        <X className="h-7 w-7" />
                    </button>
                </div>

                {!isEditing ? (
                    <>
                        <div className="mt-4">
                            <div className="text-3xl font-bold text-slate-800">{data?.customerName || "-"}</div>
                            <div className="mt-2 text-2xl font-medium text-slate-500">{data?.customerPhone || "-"}</div>
                        </div>

                        <div className="mt-5">
                            <span className="inline-flex rounded-full bg-emerald-100 px-5 py-2 text-lg font-bold text-emerald-700">
                                {data?.status === "blocked" ? "BLOCKED SEAT" : "BOOKED SEAT"}
                            </span>
                        </div>

                        <div className="mt-5 text-2xl font-medium text-slate-500">
                            {data?.pickupName || "-"} ({data?.pickupTime || "--:--"}) → {data?.dropName || "-"} ({data?.dropTime || "--:--"})
                        </div>

                        <div className="mt-5 text-3xl font-bold text-slate-800">
                            Fare: {formatCurrency(data?.fare || 0)}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="inline-flex h-14 items-center justify-center rounded-3xl border border-slate-300 bg-white px-8 text-xl font-semibold text-slate-800 transition-all duration-200 hover:bg-slate-50"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={onCancel}
                                className="inline-flex h-14 items-center justify-center rounded-3xl border border-red-300 bg-white px-8 text-xl font-semibold text-red-600 transition-all duration-200 hover:bg-red-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-800">
                                    Passenger Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="h-14 w-full rounded-3xl border border-slate-300 px-4 text-lg font-medium text-slate-800 outline-none focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-800">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="h-14 w-full rounded-3xl border border-slate-300 px-4 text-lg font-medium text-slate-800 outline-none focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-800">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="h-14 w-full rounded-3xl border border-slate-300 px-4 text-lg font-medium text-slate-800 outline-none focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="inline-flex h-14 items-center justify-center rounded-3xl border border-slate-300 bg-white px-8 text-xl font-semibold text-slate-800 transition-all duration-200 hover:bg-slate-50"
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleSave}
                                className="inline-flex h-14 items-center justify-center rounded-3xl bg-[#0B5D5A] px-8 text-xl font-bold text-white transition-all duration-200 hover:bg-[#094B49] disabled:opacity-60"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}