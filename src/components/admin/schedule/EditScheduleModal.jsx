"use client";

import { X } from "lucide-react";

function Input({ className = "", ...props }) {
    return (
        <input
            {...props}
            className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0B5D5A]/40 focus:ring-2 focus:ring-[#0B5D5A]/10 ${className}`}
        />
    );
}

function Select({ className = "", children, ...props }) {
    return (
        <select
            {...props}
            className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0B5D5A]/40 focus:ring-2 focus:ring-[#0B5D5A]/10 ${className}`}
        >
            {children}
        </select>
    );
}

export default function EditScheduleModal({
    open,
    onClose,
    form,
    setForm,
    onSave,
    saving,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 p-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Edit Schedule</h2>
                        <p className="text-sm text-slate-500">Update schedule details</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Travel Date
                        </label>
                        <Input
                            type="date"
                            value={form.travelDate || ""}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, travelDate: e.target.value }))
                            }
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Status
                        </label>
                        <Select
                            value={form.status || "SCHEDULED"}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, status: e.target.value }))
                            }
                        >
                            <option value="SCHEDULED">SCHEDULED</option>
                            <option value="DEPARTED">DEPARTED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </Select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Start Time
                        </label>
                        <Input
                            type="time"
                            value={form.startTime || ""}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, startTime: e.target.value }))
                            }
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            End Time
                        </label>
                        <Input
                            type="time"
                            value={form.endTime || ""}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, endTime: e.target.value }))
                            }
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Base Fare
                        </label>
                        <Input
                            type="number"
                            min="0"
                            value={form.baseFare || ""}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, baseFare: e.target.value }))
                            }
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Effective Fare
                        </label>
                        <Input
                            type="number"
                            min="0"
                            value={form.effectiveFare || ""}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, effectiveFare: e.target.value }))
                            }
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
                    <button
                        onClick={onClose}
                        className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="rounded-2xl bg-[#0B5D5A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#094B49] disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}