"use client";

import { useAutoRefresh } from "@/context/AutoRefreshContext";
import {
    ArrowRightLeft,
    BusFront,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Edit3,
    Filter,
    Loader2,
    MapPin,
    Plus,
    RefreshCw,
    Route,
    Save,
    Search,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 10;

const initialForm = {
    busId: "",
    tripDirection: "FORWARD",
    pickupPointOrder: "",
    dropPointOrder: "",
    fareAmount: "",
    validFrom: "",
    validTill: "",
    fareType: "REGULAR",
    applyNextPickups: false,
    applyNextDrops: false,
    label: "",
    reason: "",
    status: "ACTIVE",
};

const emptyMessage = {
    type: "",
    text: "",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const toDateInputValue = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().slice(0, 10);
};

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return dateFormatter.format(date);
};

const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return `${dateFormatter.format(date)} • ${date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
    })}`;
};

const formatMoney = (value) => {
    const amount = Number(value || 0);
    return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
};

const getStoredToken = (key) => {
    try {
        return localStorage.getItem(key) || "";
    } catch {
        return "";
    }
};

const setStoredToken = (key, value) => {
    try {
        if (value) {
            localStorage.setItem(key, value);
        } else {
            localStorage.removeItem(key);
        }
    } catch {
        // ignore storage issues
    }
};

async function refreshAccessToken() {
    try {
        const refreshToken = getStoredToken("refreshToken");

        if (!refreshToken) return null;

        const res = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.accessToken) return null;

        setStoredToken("accessToken", data.accessToken);
        return data.accessToken;
    } catch {
        return null;
    }
}

async function fetchWithAutoRefresh(url, options = {}) {
    const doFetch = async (accessToken) => {
        const headers = new Headers(options.headers || undefined);

        if (accessToken) {
            headers.set("Authorization", `Bearer ${accessToken}`);
        }

        return fetch(url, {
            ...options,
            headers,
        });
    };

    let token = getStoredToken("accessToken");

    if (!token) {
        token = await refreshAccessToken();
    }

    let res = await doFetch(token);

    if (res.status === 401) {
        const newToken = await refreshAccessToken();

        if (newToken) {
            res = await doFetch(newToken);
        }
    }

    return res;
}

const getTripSnapshot = (bus, direction) => {
    if (!bus) {
        return {
            routeName: "",
            startPoint: "",
            endPoint: "",
            pickupPoints: [],
            dropPoints: [],
            baseFare: 0,
            hasReturnTrip: false,
        };
    }

    const trip = direction === "RETURN" ? bus.returnTrip : bus.forwardTrip;

    if (!trip) {
        return {
            routeName: "",
            startPoint: "",
            endPoint: "",
            pickupPoints: [],
            dropPoints: [],
            baseFare: 0,
            hasReturnTrip: Boolean(bus.returnTrip),
        };
    }

    return {
        routeName: String(trip.routeName || bus.routeName || "").trim(),
        startPoint: String(trip.startPoint || "").trim(),
        endPoint: String(trip.endPoint || "").trim(),
        pickupPoints: Array.isArray(trip.pickupPoints) ? trip.pickupPoints : [],
        dropPoints: Array.isArray(trip.dropPoints) ? trip.dropPoints : [],
        baseFare: Number(trip.baseFare || 0),
        hasReturnTrip: Boolean(bus.returnTrip),
    };
};

const getBusLabel = (bus) => {
    if (!bus) return "";

    const busNumber = String(bus.busNumber || "").trim();
    const busName = String(bus.busName || "").trim();

    if (busNumber && busName) return `${busNumber} • ${busName}`;
    return busNumber || busName || String(bus._id || "");
};

const getStatusTone = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "ACTIVE") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (normalized === "EXPIRED") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
};

export default function AdminFarePage() {
    return (
        <Suspense fallback={<AdminFarePageFallback />}>
            <AdminFarePageContent />
        </Suspense>
    );
}

function AdminFarePageFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#0B5D5A]/10 via-white to-[#DFF2EE] p-4">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading fare management...
            </div>
        </div>
    );
}

function AdminFarePageContent() {
    const { triggerRefresh } = useAutoRefresh();
    const searchParams = useSearchParams();

    const [buses, setBuses] = useState([]);
    const [fares, setFares] = useState([]);
    const [loadingBuses, setLoadingBuses] = useState(true);
    const [loadingFares, setLoadingFares] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: 0,
        totalPages: 1,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBusId, setFilterBusId] = useState("");
    const [filterTripDirection, setFilterTripDirection] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterFareType, setFilterFareType] = useState("");
    const [editingFareId, setEditingFareId] = useState("");
    const [message, setMessage] = useState(emptyMessage);
    const [form, setForm] = useState(initialForm);

    const busMap = useMemo(() => {
        return new Map(buses.map((bus) => [String(bus._id), bus]));
    }, [buses]);

    const selectedBus = useMemo(() => {
        return busMap.get(String(form.busId)) || null;
    }, [busMap, form.busId]);

    const selectedTrip = useMemo(() => {
        return getTripSnapshot(selectedBus, form.tripDirection);
    }, [selectedBus, form.tripDirection]);

    useEffect(() => {
        const busIdFromQuery = String(searchParams.get("busId") || "").trim();

        if (!busIdFromQuery || !buses.length || form.busId) {
            return;
        }

        const busExists = buses.some((bus) => String(bus._id) === busIdFromQuery);

        if (busExists) {
            syncTripDefaults(busIdFromQuery, form.tripDirection || "FORWARD");
        }
    }, [searchParams, buses, form.busId, form.tripDirection]);

    const visibleFares = useMemo(() => {
        const query = String(searchTerm || "").trim().toLowerCase();

        if (!query) return fares;

        return fares.filter((fare) => {
            const bus = busMap.get(String(fare.busId)) || null;
            const haystack = [
                fare.routeName,
                fare.pickupPointName,
                fare.dropPointName,
                fare.label,
                fare.reason,
                fare.tripDirection,
                fare.fareType,
                bus?.busNumber,
                bus?.busName,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [busMap, fares, searchTerm]);

    const stats = useMemo(() => {
        return {
            buses: buses.length,
            fares: pagination.total || fares.length,
            active: fares.filter((fare) => String(fare.status || "").toUpperCase() === "ACTIVE").length,
            expired: fares.filter((fare) => String(fare.status || "").toUpperCase() === "EXPIRED").length,
        };
    }, [buses.length, fares, pagination.total]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        window.clearTimeout(showMessage._timer);
        showMessage._timer = window.setTimeout(() => {
            setMessage(emptyMessage);
        }, 3500);
    };

    const updateForm = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const syncTripDefaults = (busId, direction) => {
        const bus = busMap.get(String(busId)) || null;
        const trip = getTripSnapshot(bus, direction);

        setForm((prev) => ({
            ...prev,
            busId,
            tripDirection: direction,
            pickupPointOrder: trip.pickupPoints[0]?.order ? String(trip.pickupPoints[0].order) : "",
            dropPointOrder: trip.dropPoints.at(-1)?.order ? String(trip.dropPoints.at(-1).order) : "",
        }));
    };

    const resetForm = () => {
        setEditingFareId("");
        setForm(initialForm);
    };

    const fetchBuses = async () => {
        try {
            setLoadingBuses(true);

            const res = await fetchWithAutoRefresh("/api/admin/buses?limit=200&page=1", {
                method: "GET",
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to fetch buses");
            }

            setBuses(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error(error);
            showMessage("error", error.message || "Failed to load buses");
        } finally {
            setLoadingBuses(false);
        }
    };

    const fetchFares = async (page = 1) => {
        try {
            setLoadingFares(true);

            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", String(ITEMS_PER_PAGE));

            if (filterBusId) params.set("busId", filterBusId);
            if (filterTripDirection) params.set("tripDirection", filterTripDirection);
            if (filterStatus) params.set("status", filterStatus);
            if (filterFareType) params.set("fareType", filterFareType);

            const res = await fetchWithAutoRefresh(`/api/admin/fare?${params.toString()}`, {
                method: "GET",
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to fetch fares");
            }

            setFares(Array.isArray(data.data) ? data.data : []);
            setPagination(
                data.pagination || {
                    page: 1,
                    limit: ITEMS_PER_PAGE,
                    total: 0,
                    totalPages: 1,
                }
            );
        } catch (error) {
            console.error(error);
            showMessage("error", error.message || "Failed to load fare rules");
        } finally {
            setLoadingFares(false);
        }
    };

    useEffect(() => {
        void fetchBuses();
    }, []);

    useEffect(() => {
        void fetchFares(currentPage);
    }, [currentPage, filterBusId, filterTripDirection, filterStatus, filterFareType]);

    useEffect(() => {
        if (!selectedBus) return;

        const trip = selectedTrip;
        const pickupOrders = new Set(trip.pickupPoints.map((point) => String(point.order)));
        const dropOrders = new Set(trip.dropPoints.map((point) => String(point.order)));

        setForm((prev) => {
            const next = { ...prev };

            if (next.pickupPointOrder && !pickupOrders.has(String(next.pickupPointOrder))) {
                next.pickupPointOrder = trip.pickupPoints[0]?.order ? String(trip.pickupPoints[0].order) : "";
            }

            if (next.dropPointOrder && !dropOrders.has(String(next.dropPointOrder))) {
                next.dropPointOrder = trip.dropPoints.at(-1)?.order ? String(trip.dropPoints.at(-1).order) : "";
            }

            return next;
        });
    }, [selectedBus, selectedTrip]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            if (!form.busId) {
                throw new Error("Please select a bus");
            }

            if (!selectedBus) {
                throw new Error("Selected bus not found");
            }

            if (form.tripDirection === "RETURN" && !selectedTrip.hasReturnTrip) {
                throw new Error("This bus does not have a return trip configured");
            }

            if (!selectedTrip.pickupPoints.length || !selectedTrip.dropPoints.length) {
                throw new Error("Pickup and drop points are required for the selected trip");
            }

            const pickupPointOrder = Number(form.pickupPointOrder);
            const dropPointOrder = Number(form.dropPointOrder);

            if (!Number.isFinite(pickupPointOrder) || !Number.isFinite(dropPointOrder)) {
                throw new Error("Please select valid pickup and drop point orders");
            }

            if (pickupPointOrder >= dropPointOrder) {
                throw new Error("Pickup point order must be before drop point order");
            }

            const basePayload = {
                fareAmount: Number(form.fareAmount),
                fareType: form.fareType,
                validFrom: form.validFrom,
                validTill: form.validTill,
                label: form.label.trim(),
                reason: form.reason.trim(),
            };

            let url = "/api/admin/fare";
            let method = "POST";
            let payload = {
                busId: form.busId,
                tripDirection: form.tripDirection,
                pickupPointOrder,
                dropPointOrder,
                ...basePayload,
                applyNextPickups: false,
                applyNextDrops: false,
            };

            if (!Number.isFinite(payload.fareAmount) || payload.fareAmount < 0) {
                throw new Error("Please enter a valid fare amount");
            }

            if (!payload.validFrom || !payload.validTill) {
                throw new Error("validFrom and validTill are required");
            }

            if (editingFareId) {
                method = "PUT";
                url = `/api/admin/fare/${editingFareId}`;
                payload = {
                    ...basePayload,
                    status: form.status,
                };
            } else {
                payload.applyNextPickups = Boolean(form.applyNextPickups);
                payload.applyNextDrops = Boolean(form.applyNextDrops);
            }

            const res = await fetchWithAutoRefresh(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || (editingFareId ? "Failed to update fare" : "Failed to create fare"));
            }

            showMessage(
                "success",
                editingFareId ? "Fare updated successfully" : "Fare created successfully"
            );
            resetForm();
            setCurrentPage(1);
            triggerRefresh();
            await fetchFares(1);
        } catch (error) {
            console.error(error);
            showMessage("error", error.message || "Unable to save fare rule");
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (fare) => {
        setEditingFareId(String(fare._id || ""));
        setForm({
            busId: String(fare.busId?._id || fare.busId || ""),
            tripDirection: fare.tripDirection || "FORWARD",
            pickupPointOrder: String(fare.pickupPointOrder || ""),
            dropPointOrder: String(fare.dropPointOrder || ""),
            fareAmount: String(fare.fareAmount ?? ""),
            validFrom: toDateInputValue(fare.validFrom),
            validTill: toDateInputValue(fare.validTill),
            fareType: fare.fareType || "REGULAR",
            applyNextPickups: Boolean(fare.applyNextPickups),
            applyNextDrops: Boolean(fare.applyNextDrops),
            label: fare.label || "",
            reason: fare.reason || "",
            status: fare.status || "ACTIVE",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (fare) => {
        const fareId = String(fare._id || "");

        if (!fareId) return;

        const confirmed = globalThis.confirm(
            `Delete fare rule for ${fare.routeName} (${fare.pickupPointName} -> ${fare.dropPointName})?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(fareId);

            const res = await fetchWithAutoRefresh(`/api/admin/fare/${fareId}`, {
                method: "DELETE",
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to delete fare");
            }

            showMessage("success", "Fare deleted successfully");
            await fetchFares(currentPage);
            triggerRefresh();
        } catch (error) {
            console.error(error);
            showMessage("error", error.message || "Unable to delete fare rule");
        } finally {
            setDeletingId("");
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterBusId("");
        setFilterTripDirection("");
        setFilterStatus("");
        setFilterFareType("");
        setCurrentPage(1);
    };

    const activePointCount = `${selectedTrip.pickupPoints.length} pickup • ${selectedTrip.dropPoints.length} drop`;

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0B5D5A]/10 via-white to-[#DFF2EE] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] space-y-6">
                {message.text ? (
                    <div className={`rounded-3xl border px-4 py-3 text-sm shadow-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-700" : message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700"}`}>
                        {message.text}
                    </div>
                ) : null}

                <section className="overflow-hidden rounded-[32px] border border-white/70 bg-linear-to-b from-[#0B5D5A] via-[#0D6663] to-[#0E6F6B] text-white shadow-[0_24px_80px_rgba(11,93,90,0.24)]">
                    <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1.3fr_0.9fr] lg:px-10 lg:py-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white/90 uppercase">
                                <Sparkles className="h-3.5 w-3.5" />
                                Fare Administration
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                                    Bus Fare Management
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                                    Create fare rules directly from the bus schedule, keep trip directions in sync, and manage fare validity from one connected screen.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0B5D5A] shadow-lg transition hover:translate-y-[-1px] hover:bg-[#F3FFFD]"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Fare Rule
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        void fetchBuses();
                                        void fetchFares(currentPage);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                            <StatCard label="Buses" value={stats.buses} hint="connected" />
                            <StatCard label="Fare Rules" value={stats.fares} hint="total" />
                            <StatCard label="Active" value={stats.active} hint="live" />
                            <StatCard label="Expired" value={stats.expired} hint="archived" />
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <section id="fare-form" className="rounded-[32px] border border-[#CBE5E0] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0B5D5A]">Fare Setup</p>
                                <h2 className="mt-1 text-2xl font-black text-slate-900">
                                    {editingFareId ? "Edit Fare Rule" : "Create Fare Rule"}
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    Required API fields: busId, tripDirection, pickupPointOrder, dropPointOrder, fareAmount, validFrom, validTill.
                                </p>
                            </div>

                            {editingFareId ? (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel Edit
                                </button>
                            ) : null}
                        </div>

                        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField label="Bus" icon={<BusFront className="h-4 w-4" />}>
                                    <select
                                        value={form.busId}
                                        onChange={(e) => syncTripDefaults(e.target.value, form.tripDirection)}
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                        required
                                        disabled={loadingBuses}
                                    >
                                        <option value="">Select bus</option>
                                        {buses.map((bus) => (
                                            <option key={bus._id} value={bus._id}>
                                                {getBusLabel(bus)}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Trip Direction" icon={<ArrowRightLeft className="h-4 w-4" />}>
                                    <select
                                        value={form.tripDirection}
                                        onChange={(e) => syncTripDefaults(form.busId, e.target.value)}
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                        required
                                    >
                                        <option value="FORWARD">FORWARD</option>
                                        <option value="RETURN" disabled={selectedBus ? !selectedTrip.hasReturnTrip : false}>
                                            RETURN
                                        </option>
                                    </select>
                                </FormField>

                                <FormField label="Pickup Point" icon={<MapPin className="h-4 w-4" />}>
                                    <select
                                        value={form.pickupPointOrder}
                                        onChange={(e) => updateForm("pickupPointOrder", e.target.value)}
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                        required
                                        disabled={!selectedTrip.pickupPoints.length}
                                    >
                                        <option value="">Select pickup</option>
                                        {selectedTrip.pickupPoints.map((point) => (
                                            <option key={point.order} value={point.order}>
                                                {point.order}. {point.name}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Drop Point" icon={<MapPin className="h-4 w-4" />}>
                                    <select
                                        value={form.dropPointOrder}
                                        onChange={(e) => updateForm("dropPointOrder", e.target.value)}
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                        required
                                        disabled={!selectedTrip.dropPoints.length}
                                    >
                                        <option value="">Select drop</option>
                                        {selectedTrip.dropPoints.map((point) => (
                                            <option key={point.order} value={point.order}>
                                                {point.order}. {point.name}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Fare Amount" icon={<Filter className="h-4 w-4" />}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={form.fareAmount}
                                        onChange={(e) => updateForm("fareAmount", e.target.value)}
                                        placeholder="Enter fare amount"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                        required
                                    />
                                </FormField>

                                <FormField label="Fare Type" icon={<Sparkles className="h-4 w-4" />}>
                                    <select
                                        value={form.fareType}
                                        onChange={(e) => updateForm("fareType", e.target.value)}
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                    >
                                        <option value="REGULAR">REGULAR</option>
                                        <option value="SEASONAL">SEASONAL</option>
                                        <option value="SPECIAL">SPECIAL</option>
                                    </select>
                                </FormField>

                                <FormField label="Valid From" icon={<CalendarDays className="h-4 w-4" />}>
                                    <input
                                        type="date"
                                        value={form.validFrom}
                                        onChange={(e) => updateForm("validFrom", e.target.value)}
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                        required
                                    />
                                </FormField>

                                <FormField label="Valid Till" icon={<CalendarDays className="h-4 w-4" />}>
                                    <input
                                        type="date"
                                        value={form.validTill}
                                        onChange={(e) => updateForm("validTill", e.target.value)}
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                        required
                                    />
                                </FormField>
                            </div>

                            {!editingFareId ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                        <input
                                            type="checkbox"
                                            checked={form.applyNextPickups}
                                            onChange={(e) => updateForm("applyNextPickups", e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0B5D5A] focus:ring-[#0B5D5A]"
                                        />
                                        <span>
                                            <span className="block text-sm font-semibold text-slate-900">Apply to next pickups</span>
                                            <span className="text-xs text-slate-500">Expand the selected pickup across following stops.</span>
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                        <input
                                            type="checkbox"
                                            checked={form.applyNextDrops}
                                            onChange={(e) => updateForm("applyNextDrops", e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0B5D5A] focus:ring-[#0B5D5A]"
                                        />
                                        <span>
                                            <span className="block text-sm font-semibold text-slate-900">Apply to next drops</span>
                                            <span className="text-xs text-slate-500">Extend the selected drop across later stops.</span>
                                        </span>
                                    </label>
                                </div>
                            ) : null}

                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField label="Label" icon={<Edit3 className="h-4 w-4" />}>
                                    <input
                                        type="text"
                                        value={form.label}
                                        onChange={(e) => updateForm("label", e.target.value)}
                                        placeholder="Example: Festival special"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                    />
                                </FormField>

                                {editingFareId ? (
                                    <FormField label="Status" icon={<Sparkles className="h-4 w-4" />}>
                                        <select
                                            value={form.status}
                                            onChange={(e) => updateForm("status", e.target.value)}
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                        >
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                            <option value="EXPIRED">EXPIRED</option>
                                        </select>
                                    </FormField>
                                ) : null}
                            </div>

                            <FormField label="Reason" icon={<Edit3 className="h-4 w-4" />}>
                                <textarea
                                    value={form.reason}
                                    onChange={(e) => updateForm("reason", e.target.value)}
                                    placeholder="Optional explanation for this fare"
                                    rows={3}
                                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                />
                            </FormField>

                            <div className="rounded-3xl border border-[#BFE3DD] bg-[#F4FBF9] p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Trip preview</p>
                                        <p className="text-xs text-slate-500">{activePointCount}</p>
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        {selectedTrip.routeName || "Select a bus to preview the trip"}
                                    </div>
                                </div>

                                {selectedBus ? (
                                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                        <PreviewBlock
                                            title="Bus"
                                            value={getBusLabel(selectedBus)}
                                            detail={selectedTrip.startPoint && selectedTrip.endPoint ? `${selectedTrip.startPoint} → ${selectedTrip.endPoint}` : selectedTrip.routeName}
                                        />
                                        <PreviewBlock
                                            title="Base Fare"
                                            value={formatMoney(selectedTrip.baseFare)}
                                            detail={form.tripDirection}
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-2xl border border-dashed border-[#A8D5CD] bg-white p-4 text-sm text-slate-500">
                                        Choose a bus to load its trip points.
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="submit"
                                    disabled={saving || loadingBuses || loadingFares}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-b from-[#0B5D5A] via-[#0D6663] to-[#0E6F6B] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0B5D5A]/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {editingFareId ? "Update Fare" : "Create Fare"}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    <X className="h-4 w-4" />
                                    Reset Form
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="space-y-6 rounded-[32px] border border-[#CBE5E0] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0B5D5A]">Fare List</p>
                                <h2 className="mt-1 text-2xl font-black text-slate-900">Connected fare rules</h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    View and maintain the rules created through the API.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                                Showing {visibleFares.length} of {pagination.total || fares.length} rules
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <FieldSelect label="Bus" value={filterBusId} onChange={(value) => { setFilterBusId(value); setCurrentPage(1); }}>
                                <option value="">All buses</option>
                                {buses.map((bus) => (
                                    <option key={bus._id} value={bus._id}>
                                        {getBusLabel(bus)}
                                    </option>
                                ))}
                            </FieldSelect>
                            <FieldSelect label="Direction" value={filterTripDirection} onChange={(value) => { setFilterTripDirection(value); setCurrentPage(1); }}>
                                <option value="">All directions</option>
                                <option value="FORWARD">FORWARD</option>
                                <option value="RETURN">RETURN</option>
                            </FieldSelect>
                            <FieldSelect label="Status" value={filterStatus} onChange={(value) => { setFilterStatus(value); setCurrentPage(1); }}>
                                <option value="">All statuses</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="EXPIRED">EXPIRED</option>
                            </FieldSelect>
                            <FieldSelect label="Fare Type" value={filterFareType} onChange={(value) => { setFilterFareType(value); setCurrentPage(1); }}>
                                <option value="">All types</option>
                                <option value="REGULAR">REGULAR</option>
                                <option value="SEASONAL">SEASONAL</option>
                                <option value="SPECIAL">SPECIAL</option>
                            </FieldSelect>
                        </div>

                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search route, pickup, drop, label, bus"
                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                Clear
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-slate-200">
                            {loadingFares ? (
                                <div className="flex min-h-[280px] items-center justify-center bg-slate-50 text-slate-500">
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Loading fares...
                                </div>
                            ) : visibleFares.length === 0 ? (
                                <div className="flex min-h-[280px] items-center justify-center bg-slate-50 p-6 text-center">
                                    <div>
                                        <p className="text-lg font-bold text-slate-900">No fare rules found</p>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Use the form on the left to create your first fare rule.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200 bg-white">
                                    {visibleFares.map((fare) => {
                                        const bus = busMap.get(String(fare.busId)) || null;

                                        return (
                                            <article key={fare._id} className="p-4 transition hover:bg-[#F4FBF9]">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="space-y-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(fare.status)}`}>
                                                                {String(fare.status || "").toUpperCase()}
                                                            </span>
                                                            <span className="rounded-full border border-[#CBE5E0] bg-[#F4FBF9] px-3 py-1 text-xs font-semibold text-[#0B5D5A]">
                                                                {fare.fareType || "REGULAR"}
                                                            </span>
                                                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                                                                {fare.tripDirection}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-black text-slate-900">
                                                                {fare.routeName}
                                                            </h3>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                {fare.label || "No label"}
                                                            </p>
                                                        </div>

                                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                            <DetailChip label="Bus" value={bus ? getBusLabel(bus) : String(fare.busId || "-")} icon={<BusFront className="h-4 w-4" />} />
                                                            <DetailChip label="Pickup" value={`${fare.pickupPointOrder}. ${fare.pickupPointName}`} icon={<MapPin className="h-4 w-4" />} />
                                                            <DetailChip label="Drop" value={`${fare.dropPointOrder}. ${fare.dropPointName}`} icon={<MapPin className="h-4 w-4" />} />
                                                            <DetailChip label="Fare" value={formatMoney(fare.fareAmount)} icon={<Route className="h-4 w-4" />} />
                                                            <DetailChip label="Validity" value={`${formatDate(fare.validFrom)} to ${formatDate(fare.validTill)}`} icon={<CalendarDays className="h-4 w-4" />} />
                                                            <DetailChip label="Created" value={formatDateTime(fare.createdAt)} icon={<Clock3 className="h-4 w-4" />} />
                                                        </div>

                                                        {fare.reason ? (
                                                            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                                                {fare.reason}
                                                            </p>
                                                        ) : null}
                                                    </div>

                                                    <div className="flex shrink-0 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(fare)}
                                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-linear-to-b from-[#0B5D5A] via-[#0D6663] to-[#0E6F6B] px-4 text-sm font-semibold text-white shadow-lg shadow-[#0B5D5A]/15 transition hover:opacity-95"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleDelete(fare)}
                                                            disabled={deletingId === fare._id}
                                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {deletingId === fare._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage <= 1}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>

                            <p className="text-sm font-medium text-slate-600">
                                Page {pagination.page || currentPage} of {pagination.totalPages || 1}
                            </p>

                            <button
                                type="button"
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                disabled={(pagination.totalPages || 1) <= currentPage}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, hint }) {
    return (
        <div className="rounded-3xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">{label}</p>
            <p className="mt-3 text-3xl font-black leading-none">{value}</p>
            <p className="mt-1 text-xs text-white/70">{hint}</p>
        </div>
    );
}

function FormField({ label, icon, children }) {
    return (
        <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                {icon}
                {label}
            </span>
            {children}
        </label>
    );
}

function FieldSelect({ label, value, onChange, children }) {
    return (
        <label className="space-y-2">
            <span className="block text-sm font-semibold text-slate-800">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
            >
                {children}
            </select>
        </label>
    );
}

function PreviewBlock({ title, value, detail }) {
    return (
        <div className="rounded-3xl border border-[#CBE5E0] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B5D5A]">{title}</p>
            <p className="mt-2 text-lg font-black text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{detail || "-"}</p>
        </div>
    );
}

function DetailChip({ label, value, icon }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {icon}
                {label}
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">{value || "-"}</p>
        </div>
    );
}
