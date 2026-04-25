"use client";

import { Loader2, Ticket, Wallet, X } from "lucide-react";

export default function CancelBookingModal({
    open,
    seatNo,
    loading = false,
    onClose,
    onRefundOriginal,
    onIssueVoucher,
    onMarkCancelled,
}) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/55 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[560px] rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_70px_rgba(2,8,23,0.30)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <div className="text-xs font-bold tracking-[0.28em] text-[#0B5D5A]">
                            CANCEL BOOKING
                        </div>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-[28px]">
                            Seat {seatNo || "-"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 sm:text-base">
                            Choose how you want to cancel this booking
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-60"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
                    <ActionCard
                        icon={<Wallet className="h-5 w-5" />}
                        title="Refund Original Payment"
                        desc="Cancel booking and refund to original payment source."
                        tone="green"
                        onClick={onRefundOriginal}
                        disabled={loading}
                    />

                    <ActionCard
                        icon={<Ticket className="h-5 w-5" />}
                        title="Issue Voucher"
                        desc="Cancel booking and generate a reusable travel voucher."
                        tone="amber"
                        onClick={onIssueVoucher}
                        disabled={loading}
                    />

                    <ActionCard
                        icon={<X className="h-5 w-5" />}
                        title="Mark Cancelled (No Refund)"
                        desc="Cancel booking without refund or voucher."
                        tone="red"
                        onClick={onMarkCancelled}
                        disabled={loading}
                    />

                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Close"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionCard({ icon, title, desc, tone, onClick, disabled }) {
    const toneMap = {
        green:
            "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        amber:
            "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        red: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`w-full rounded-[20px] border p-4 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${toneMap[tone]
                }`}
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                    {icon}
                </div>

                <div className="min-w-0">
                    <div className="text-base font-bold sm:text-lg">{title}</div>
                    <div className="mt-1 text-sm opacity-90">{desc}</div>
                </div>
            </div>
        </button>
    );
}