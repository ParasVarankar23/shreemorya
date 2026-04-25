"use client";

import { useRef } from "react";
import { CalendarDays, Search } from "lucide-react";
import StopSearchDropdown from "./StopSearchDropdown";

export default function BookingSearchPanel({
    loadingStops,
    allStops,
    pickupStop,
    setPickupStop,
    dropStop,
    setDropStop,
    travelDate,
    setTravelDate,
    onSearch,
    searching,
    canSearch,
}) {
    const dateInputRef = useRef(null);
    const today = new Date().toISOString().split("T")[0];

    const handleOpenDatePicker = () => {
        if (dateInputRef.current?.showPicker) {
            dateInputRef.current.showPicker();
        } else {
            dateInputRef.current?.focus();
        }
    };

    return (
        <section className="mx-auto w-full max-w-5xl overflow-visible rounded-[28px] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            {/* Header */}
            <div className="border-b border-slate-200/80 px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex items-start gap-4 sm:gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B5D5A]/12 to-[#0B5D5A]/6 text-[#0B5D5A] ring-1 ring-[#0B5D5A]/8">
                        <Search className="h-7 w-7" />
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[34px]">
                            Search Available Buses
                        </h1>
                        <p className="mt-1.5 text-sm font-medium text-slate-500 sm:text-base">
                            Select pickup, drop and travel date to find available buses
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="overflow-visible px-5 py-5 sm:px-6 sm:py-6">
                <div className="space-y-5">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Pickup */}
                        <div className="relative z-30">
                            <label className="mb-2.5 block text-sm font-semibold text-slate-800 sm:text-base">
                                Pickup Point <span className="text-red-500">*</span>
                            </label>

                            <StopSearchDropdown
                                label="pickup"
                                placeholder="Select pickup point"
                                value={pickupStop}
                                onChange={setPickupStop}
                                options={allStops}
                                loading={loadingStops}
                                excludeValue={dropStop?.value || ""}
                            />
                        </div>

                        {/* Drop */}
                        <div className="relative z-20">
                            <label className="mb-2.5 block text-sm font-semibold text-slate-800 sm:text-base">
                                Drop Point <span className="text-red-500">*</span>
                            </label>

                            <StopSearchDropdown
                                label="drop"
                                placeholder="Select drop point"
                                value={dropStop}
                                onChange={setDropStop}
                                options={allStops}
                                loading={loadingStops}
                                excludeValue={pickupStop?.value || ""}
                            />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_220px] lg:items-end">
                        {/* Travel Date */}
                        <div>
                            <label className="mb-2.5 block text-sm font-semibold text-slate-800 sm:text-base">
                                Travel Date <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    value={travelDate}
                                    min={today}
                                    onChange={(e) => setTravelDate(e.target.value)}
                                    onClick={handleOpenDatePicker}
                                    className="h-14 w-full rounded-[22px] border border-slate-300 bg-white px-4 pr-12 text-base font-medium text-slate-800 outline-none transition-all duration-200 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10 hover:border-slate-400 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-12 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                />

                                <button
                                    type="button"
                                    onClick={handleOpenDatePicker}
                                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-[#0B5D5A]"
                                    aria-label="Open date picker"
                                >
                                    <CalendarDays className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Search Button */}
                        <button
                            type="button"
                            onClick={onSearch}
                            disabled={!canSearch || searching}
                            className="inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-[22px] bg-gradient-to-r from-[#0B5D5A] to-[#0A524F] px-5 text-base font-bold text-white shadow-[0_10px_24px_rgba(11,93,90,0.22)] transition-all duration-200 hover:from-[#094B49] hover:to-[#083F3E] hover:shadow-[0_14px_28px_rgba(11,93,90,0.28)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:text-white/90 disabled:shadow-none"
                        >
                            <Search className="h-5 w-5" />
                            {searching ? "Searching..." : "Search"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}