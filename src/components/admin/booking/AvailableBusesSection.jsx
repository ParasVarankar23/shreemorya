"use client";

import AvailableBusCard from "@/components/admin/booking/AvailableBusCard";

export default function AvailableBusesSection({
    buses = [],
    loading = false,
    travelDate,
    onViewSeats,
}) {
    const hasBuses = buses.length > 0;

    return (
        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[30px]">
                    Available Buses
                </h2>

                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                    {loading
                        ? "Searching available buses..."
                        : hasBuses
                            ? `Showing ${buses.length} available bus(es) for ${travelDate}`
                            : "Select pickup, drop and date, then click Search Buses"}
                </p>
            </div>

            <div className="p-5 sm:p-6">
                {loading ? (
                    <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-[#0B5D5A]/10" />
                        <h3 className="text-lg font-semibold text-slate-800 sm:text-xl">
                            Searching buses...
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            Please wait while we find available schedules
                        </p>
                    </div>
                ) : !hasBuses ? (
                    <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                            <span className="text-2xl">🚌</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 sm:text-2xl">
                            No buses shown yet
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            Select pickup, drop and date, then click Search Buses
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {buses.map((bus) => (
                            <AvailableBusCard
                                key={bus._id}
                                bus={bus}
                                onViewSeats={() => onViewSeats?.(bus)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}