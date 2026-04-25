"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency } from "./bookingHelpers";

export default function SeatBookingDetailsModal({
    open,
    data,
    loading = false,
    onClose,
    onEdit,
    onCancel,
    onUnblock,
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
        <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-4 sm:py-6">
            <div className="w-full max-w-[640px] my-auto rounded-[36px] bg-white p-6 shadow-[0_30px_70px_rgba(0,0,0,0.25)] sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Seat {data?.seatNo} — {data?.bookingCode || "BOOKING"}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:bg-slate-50 sm:h-14 sm:w-14"
                    >
                        <X className="h-5 w-5 sm:h-7 sm:w-7" />
                    </button>
                </div>

                {!isEditing ? (
                    <>
                        <div className="mt-4">
                            <div className="text-xl font-bold text-slate-800 sm:text-3xl">{data?.customerName || "-"}</div>
                            <div className="mt-1 text-lg font-medium text-slate-500 sm:mt-2 sm:text-2xl">{data?.customerPhone || "-"}</div>
                        </div>

                        <div className="mt-4 sm:mt-5">
                            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-700 sm:px-5 sm:py-2 sm:text-lg">
                                {data?.status === "blocked" ? "BLOCKED SEAT" : "BOOKED SEAT"}
                            </span>
                        </div>

                        <div className="mt-4 text-base font-medium text-slate-500 sm:mt-5 sm:text-2xl">
                            {data?.pickupName || "-"} ({data?.pickupTime || "--:--"}) → {data?.dropName || "-"} ({data?.dropTime || "--:--"})
                        </div>

                        <div className="mt-4 text-xl font-bold text-slate-800 sm:mt-5 sm:text-3xl">
                            Fare: {formatCurrency(data?.fare || 0)}
                        </div>

                        <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:gap-3 sm:flex-row sm:justify-end">
                            {data?.status === "blocked" ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={onUnblock}
                                        disabled={loading}
                                        className="inline-flex h-12 items-center justify-center rounded-3xl bg-emerald-600 px-6 text-base font-semibold text-white transition-all duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:px-8 sm:text-xl"
                                    >
                                        {loading ? "Unblocking..." : "Unblock Seat"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex h-12 items-center justify-center rounded-3xl border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 transition-all duration-200 hover:bg-slate-50 sm:h-14 sm:px-8 sm:text-xl"
                                    >
                                        Close
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex h-12 items-center justify-center rounded-3xl border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 transition-all duration-200 hover:bg-slate-50 sm:h-14 sm:px-8 sm:text-xl"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        className="inline-flex h-12 items-center justify-center rounded-3xl border border-red-300 bg-white px-6 text-base font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 sm:h-14 sm:px-8 sm:text-xl"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                                    Passenger Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="h-11 w-full rounded-3xl border border-slate-300 px-4 text-base font-medium text-slate-800 outline-none focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10 sm:h-14 sm:text-lg"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="h-11 w-full rounded-3xl border border-slate-300 px-4 text-base font-medium text-slate-800 outline-none focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10 sm:h-14 sm:text-lg"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="h-11 w-full rounded-3xl border border-slate-300 px-4 text-base font-medium text-slate-800 outline-none focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10 sm:h-14 sm:text-lg"
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="inline-flex h-12 items-center justify-center rounded-3xl border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 transition-all duration-200 hover:bg-slate-50 sm:h-14 sm:px-8 sm:text-xl"
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleSave}
                                className="inline-flex h-12 items-center justify-center rounded-3xl bg-[#0B5D5A] px-6 text-base font-bold text-white transition-all duration-200 hover:bg-[#094B49] disabled:opacity-60 sm:h-14 sm:px-8 sm:text-xl"
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