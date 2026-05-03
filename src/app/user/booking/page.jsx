"use client";

import AvailableBusCard from "@/components/admin/booking/AvailableBusCard";
import BookingProcessPanel from "@/components/admin/booking/BookingProcessPanel";
import BookingSearchPanel from "@/components/admin/booking/BookingSearchPanel";
import {
    getAuthHeaders,
    normalizeStopsFromSchedules,
    showAppToast,
} from "@/components/admin/booking/bookingHelpers";
import { useEffect, useMemo, useRef, useState } from "react";

export default function BookingPage() {
    const [loadingStops, setLoadingStops] = useState(true);
    const [searchingBuses, setSearchingBuses] = useState(false);

    const [allStops, setAllStops] = useState([]);

    const [pickupStop, setPickupStop] = useState(null);
    const [dropStop, setDropStop] = useState(null);
    const [travelDate, setTravelDate] = useState(() => new Date().toISOString().split("T")[0]);

    const [availableBuses, setAvailableBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);

    const [selectedPickupMeta, setSelectedPickupMeta] = useState(null);
    const [selectedDropMeta, setSelectedDropMeta] = useState(null);

    const canSearch = useMemo(() => {
        return !!pickupStop && !!dropStop && !!travelDate;
    }, [pickupStop, dropStop, travelDate]);

    const initialLoadRef = useRef(false);

    useEffect(() => {
        loadSchedulesAndStops();
    }, []);

    useEffect(() => {
        if (selectedBus) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedBus]);

    const loadSchedulesAndStops = async () => {
        try {
            setLoadingStops(true);

            const res = await fetch("/api/buses?page=1&limit=500&status=ACTIVE", {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to load schedules");
            }

            let items = [];

            if (Array.isArray(data?.items)) {
                items = data.items;
            } else if (Array.isArray(data?.data)) {
                items = data.data;
            }

            const normalizedStops = normalizeStopsFromSchedules(items);
            setAllStops(normalizedStops);
        } catch (error) {
            console.error("loadSchedulesAndStops error:", error);
            showAppToast("error", error.message || "Failed to load pickup/drop points");
        } finally {
            setLoadingStops(false);
            initialLoadRef.current = true;
        }
    };

    // Auto-run search when pickup/drop/date change (debounced)
    useEffect(() => {
        if (!initialLoadRef.current) return;

        let timer = null;

        if (canSearch) {
            timer = setTimeout(() => {
                handleSearchBuses();
            }, 300);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickupStop, dropStop, travelDate]);

    const handleSearchBuses = async () => {
        try {
            if (!pickupStop || !dropStop || !travelDate) {
                showAppToast("error", "Pickup, drop and date are mandatory");
                return;
            }

            if (pickupStop.value === dropStop.value) {
                showAppToast("error", "Pickup and drop cannot be same");
                return;
            }

            setSearchingBuses(true);
            setSelectedBus(null);

            const params = new URLSearchParams({
                pickup: pickupStop.value,
                drop: dropStop.value,
                date: travelDate,
            });

            const res = await fetch(`/api/bookings/search-buses?${params.toString()}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to search buses");
            }

            const buses = Array.isArray(data?.data) ? data.data : [];
            setAvailableBuses(buses);

            setSelectedPickupMeta(
                allStops.find((s) => s.value === pickupStop.value) || null
            );
            setSelectedDropMeta(
                allStops.find((s) => s.value === dropStop.value) || null
            );

            if (buses.length === 0) {
                showAppToast("info", "No buses found for selected route/date");
            } else {
                showAppToast("success", `${buses.length} bus(es) found`);
            }
        } catch (error) {
            console.error("handleSearchBuses error:", error);
            setAvailableBuses([]);
            showAppToast("error", error.message || "Failed to search buses");
        } finally {
            setSearchingBuses(false);
        }
    };

    const hasAvailableBuses = availableBuses.length > 0;
    const availableBusMessage = hasAvailableBuses
        ? `Showing ${availableBuses.length} available bus(es) for ${travelDate}`
        : "Select pickup, drop and date, then click Search Buses";

    let availableBusState = null;

    if (searchingBuses) {
        availableBusState = (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-[#0B5D5A]/10" />
                <h3 className="text-xl font-semibold text-slate-800">Searching buses...</h3>
                <p className="mt-2 text-slate-500">Please wait while we find available schedules</p>
            </div>
        );
    } else if (availableBuses.length === 0) {
        availableBusState = (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                    <span className="text-2xl">🚌</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">No buses shown yet</h3>
                <p className="mt-2 text-base text-slate-500">
                    Select pickup, drop and date, then click Search Buses
                </p>
            </div>
        );
    } else {
        availableBusState = (
            <div className="space-y-5">
                {availableBuses.map((bus) => (
                    <AvailableBusCard
                        key={bus._id}
                        bus={bus}
                        onViewSeats={() => setSelectedBus(bus)}
                    />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-[#F4F7FB] px-4 py-5 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Search Panel */}
                    <BookingSearchPanel
                        loadingStops={loadingStops}
                        allStops={allStops}
                        pickupStop={pickupStop}
                        setPickupStop={setPickupStop}
                        dropStop={dropStop}
                        setDropStop={setDropStop}
                        travelDate={travelDate}
                        setTravelDate={setTravelDate}
                        onSearch={handleSearchBuses}
                        searching={searchingBuses}
                        canSearch={canSearch}
                    />

                    {/* Available Buses */}
                    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Available Buses
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 sm:text-base">
                                {availableBusMessage}
                            </p>
                        </div>

                        <div className="p-5 sm:p-6">{availableBusState}</div>
                    </section>
                </div>
            </div>

            {/* ✅ MODAL OVERLAY */}
            {selectedBus && (
                <div className="fixed inset-0 z-100 flex items-start justify-center bg-slate-900/55 p-3 sm:p-5">
                    <div className="relative h-[96vh] w-full max-w-610362.5 overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(2,8,23,0.35)]">
                        <div className="h-full overflow-y-auto">
                            {/* Booking Process */}
                            <BookingProcessPanel
                                selectedBus={selectedBus}
                                travelDate={travelDate}
                                pickupStop={selectedPickupMeta}
                                dropStop={selectedDropMeta}
                                onCloseBus={() => setSelectedBus(null)}
                                isAdmin={false}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}