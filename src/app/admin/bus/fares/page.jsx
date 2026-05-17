"use client";

import { showAppToast } from "@/lib/toast";

import {
    ArrowRightLeft,
    BusFront,
    CalendarDays,
    IndianRupee,
    Loader2,
    MapPin,
    Pencil,
    Plus,
    Route,
    Search,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";

import { getStopDisplayFromObject } from "@/lib/fare";
import { useEffect, useMemo, useState } from "react";

export default function FarePage() {
    /* =====================================================
       STATES
    ===================================================== */

    const [list, setList] = useState([]);
    const [buses, setBuses] = useState([]);

    const [loading, setLoading] = useState(false);

    const [openModal, setOpenModal] = useState(false);

    const [editingId, setEditingId] = useState("");

    const [confirmDelete, setConfirmDelete] = useState("");

    const [search, setSearch] = useState("");

    const [filterDirection, setFilterDirection] =
        useState("All");

    const [filterType, setFilterType] =
        useState("All");

    // modalSearch removed per UX request

    const [form, setForm] = useState({
        busId: "",

        tripDirection: "FORWARD",

        pickupPointName: "",

        dropPointName: "",

        fareAmount: "",

        fareType: "REGULAR",

        validFrom: "",
        validTill: "",
        applyNextPickups: true,
        applyNextDrops: true,
    });

    const selectedBus = useMemo(() => {
        return buses.find((b) => b._id === form.busId) || null;
    }, [buses, form.busId]);

    const [searchPickup, setSearchPickup] = useState("");
    const [searchDrop, setSearchDrop] = useState("");

    function getTripPointsForBus(bus, direction) {
        if (!bus) return { pickup: [], drop: [] };

        const forward = bus.forwardTrip || {};
        const returnTrip = bus.returnTrip || null;

        if ((direction || "FORWARD").toUpperCase() === "FORWARD") {
            const pickup = (forward.pickupPoints || []).slice();
            const drop = (forward.dropPoints || []).slice();

            // include start (from) as first pickup if not present
            if (forward.from) {
                const exists = pickup.find((p) => String(p.name || p).trim() === String(forward.from).trim());
                if (!exists) pickup.unshift({ name: forward.from, nameMr: "", time: forward.departureTime || "", order: 0 });
            }

            // include end (to) as last drop if not present
            if (forward.to) {
                const exists2 = drop.find((p) => String(p.name || p).trim() === String(forward.to).trim());
                if (!exists2) drop.push({ name: forward.to, nameMr: "", time: forward.arrivalTime || "", order: (drop.length || 0) + 1 });
            }

            return { pickup, drop };
        }

        // RETURN
        if (returnTrip) {
            const pickup = (returnTrip.pickupPoints || []).slice();
            const drop = (returnTrip.dropPoints || []).slice();

            if (returnTrip.from) {
                const exists = pickup.find((p) => String(p.name || p).trim() === String(returnTrip.from).trim());
                if (!exists) pickup.unshift({ name: returnTrip.from, nameMr: "", time: returnTrip.departureTime || "", order: 0 });
            }

            if (returnTrip.to) {
                const exists2 = drop.find((p) => String(p.name || p).trim() === String(returnTrip.to).trim());
                if (!exists2) drop.push({ name: returnTrip.to, nameMr: "", time: returnTrip.arrivalTime || "", order: (drop.length || 0) + 1 });
            }

            return { pickup, drop };
        }

        // derive reversed from forward trip if returnTrip missing
        const reversedPickup = (forward.dropPoints || []).slice().reverse().map((p, i) => ({
            name: p.name,
            nameMr: p.nameMr || "",
            time: p.time || "",
            order: i + 1,
        }));

        const reversedDrop = (forward.pickupPoints || []).slice().reverse().map((p, i) => ({
            name: p.name,
            nameMr: p.nameMr || "",
            time: p.time || "",
            order: i + 1,
        }));

        // include forward.to as start for reversed pickup (if not present)
        if (forward.to) {
            const exists = reversedPickup.find((p) => String(p.name || p).trim() === String(forward.to).trim());
            if (!exists) reversedPickup.unshift({ name: forward.to, nameMr: "", time: forward.arrivalTime || "", order: 0 });
        }

        // include forward.from as end for reversed drop (if not present)
        if (forward.from) {
            const exists2 = reversedDrop.find((p) => String(p.name || p).trim() === String(forward.from).trim());
            if (!exists2) reversedDrop.push({ name: forward.from, nameMr: "", time: forward.departureTime || "", order: (reversedDrop.length || 0) + 1 });
        }

        return { pickup: reversedPickup, drop: reversedDrop };
    }

    const tripPoints = useMemo(() => {
        return getTripPointsForBus(selectedBus, form.tripDirection);
    }, [selectedBus, form.tripDirection]);

    useEffect(() => {
        // when bus or direction changes, set defaults for pickup/drop if empty
        if (!selectedBus) return;

        const firstPickup = String(tripPoints.pickup?.[0]?.name || "").trim();
        const firstDrop = String(tripPoints.drop?.[0]?.name || "").trim();

        setForm((prev) => ({
            ...prev,
            pickupPointName: prev.pickupPointName ? String(prev.pickupPointName).trim() : firstPickup,
            dropPointName: prev.dropPointName ? String(prev.dropPointName).trim() : firstDrop,
        }));
        setSearchPickup("");
        setSearchDrop("");
    }, [selectedBus, tripPoints.pickup?.length, tripPoints.drop?.length, form.busId, form.tripDirection]);

    function getTripEndpoints(bus, direction) {
        if (!bus) return { start: "", end: "", startTime: "", endTime: "" };

        const forward = bus.forwardTrip || {};
        const returnTrip = bus.returnTrip || null;

        if ((direction || "FORWARD").toUpperCase() === "FORWARD") {
            return {
                start: forward.from || "",
                end: forward.to || "",
                startTime: forward.departureTime || "",
                endTime: forward.arrivalTime || "",
            };
        }

        if (returnTrip) {
            return {
                start: returnTrip.from || "",
                end: returnTrip.to || "",
                startTime: returnTrip.departureTime || "",
                endTime: returnTrip.arrivalTime || "",
            };
        }

        // derive reversed
        return {
            start: forward.to || "",
            end: forward.from || "",
            startTime: "",
            endTime: "",
        };
    }

    const tripEndpoints = useMemo(() => getTripEndpoints(selectedBus, form.tripDirection), [selectedBus, form.tripDirection]);

    /* =====================================================
       FETCH
    ===================================================== */

    const fetchFares = async () => {
        try {
            const res = await apiFetch("/api/fare");

            const data = await res.json();

            if (!data?.success) {
                showAppToast(
                    "error",
                    data?.message || "Failed"
                );

                return;
            }

            setList(data?.data || []);
        } catch {
            showAppToast(
                "error",
                "Failed to fetch fares"
            );
        }
    };

    const fetchBuses = async () => {
        try {
            const res = await apiFetch("/api/buses?page=1&limit=500&status=ACTIVE");

            const data = await res.json();

            console.log("fetchBuses ->", data);

            if (data?.success) {
                const items = data?.items || [];
                setBuses(items);

                if (items.length === 0) {
                    showAppToast(
                        "info",
                        "No buses returned from server"
                    );
                }
            } else {
                console.log("Bus fetch failed:", data);
            }
        } catch {
            console.log("Bus fetch failed");
        }
    };

    useEffect(() => {
        fetchFares();
        fetchBuses();
    }, []);

    /* =====================================================
       API FETCH
    ===================================================== */

    const getToken = () =>
        localStorage.getItem("accessToken") || "";

    async function apiFetch(url, options = {}) {
        const headers = new Headers(
            options.headers || {}
        );

        const token = getToken();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        return fetch(url, {
            ...options,
            headers,
        });
    }

    /* =====================================================
       RESET
    ===================================================== */

    const resetForm = () => {
        setEditingId("");

        setForm({
            busId: "",
            tripDirection: "FORWARD",
            pickupPointName: "",

            dropPointName: "",

            fareAmount: "",

            fareType: "REGULAR",

            validFrom: "",
            validTill: "",
            applyNextPickups: true,
            applyNextDrops: true,
        });
    };

    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const method = editingId
                ? "PUT"
                : "POST";

            const url = editingId
                ? `/api/fare?id=${editingId}`
                : "/api/fare";

            const res = await apiFetch(url, {
                method,

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!data?.success) {
                showAppToast(
                    "error",
                    data?.message || "Failed"
                );

                return;
            }

            showAppToast(
                "success",
                editingId
                    ? "Fare updated"
                    : "Fare created"
            );

            fetchFares();

            resetForm();

            setOpenModal(false);
        } catch {
            showAppToast(
                "error",
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async () => {
        try {
            const res = await apiFetch(
                `/api/fare?id=${confirmDelete}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!data?.success) {
                showAppToast(
                    "error",
                    data?.message
                );

                return;
            }

            showAppToast(
                "success",
                "Fare deleted"
            );

            setConfirmDelete("");

            fetchFares();
        } catch {
            showAppToast(
                "error",
                "Delete failed"
            );
        }
    };

    /* =====================================================
       FILTER
    ===================================================== */

    const filtered = useMemo(() => {
        return list.filter((i) => {
            const text = `
            ${i.routeName}
            ${i.pickupPointName}
            ${i.dropPointName}
            `
                .toLowerCase();

            return (
                text.includes(
                    search.toLowerCase()
                ) &&
                (filterDirection === "All" ||
                    i.tripDirection ===
                    filterDirection) &&
                (filterType === "All" ||
                    i.fareType === filterType)
            );
        });
    }, [
        list,
        search,
        filterDirection,
        filterType,
    ]);

    /* =====================================================
       STATS
    ===================================================== */

    const stats = {
        total: list.length,

        active: list.filter(
            (i) => i.status === "ACTIVE"
        ).length,

        regular: list.filter(
            (i) => i.fareType === "REGULAR"
        ).length,

        special: list.filter(
            (i) => i.fareType === "SPECIAL"
        ).length,
    };

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="min-h-screen bg-[#F6FBFA] p-3 sm:p-5 lg:p-6 overflow-x-hidden">

            {/* =====================================================
               HERO
            ===================================================== */}

            <section className="relative overflow-hidden rounded-[36px] border border-white/20 bg-gradient-to-br from-[#0B5D5A] via-[#0D6663] to-[#12A39B] text-white shadow-[0_25px_100px_rgba(11,93,90,0.35)]">

                <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[#6EE7D8]/20 blur-3xl" />

                <div className="relative grid gap-6 px-6 py-6 lg:grid-cols-[1.3fr_0.9fr]">

                    {/* LEFT */}

                    <div className="space-y-4">

                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                            <Sparkles size={14} />
                            Fare Administration
                        </div>

                        <div>

                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
                                Fare Management
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/80 leading-7">
                                Create connected fare
                                rules, manage
                                routes, pricing,
                                validity, and live
                                bus fare management
                                from one dashboard.
                            </p>

                        </div>

                        <div className="flex flex-wrap gap-3">

                            <button
                                onClick={() => {
                                    resetForm();

                                    setOpenModal(
                                        true
                                    );
                                }}
                                className="inline-flex items-center gap-2 rounded-3xl bg-white px-5 py-3 text-sm font-bold text-[#0B5D5A] shadow-lg hover:scale-[1.02] transition"
                            >
                                <Plus size={18} />
                                New Fare
                            </button>

                            <button
                                onClick={() =>
                                    fetchFares()
                                }
                                className="inline-flex items-center gap-2 rounded-3xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15 transition"
                            >
                                <Route size={18} />
                                Refresh
                            </button>

                        </div>

                    </div>

                    {/* RIGHT */}

                    <div className="grid grid-cols-2 gap-4">

                        <StatCard
                            label="Total"
                            value={stats.total}
                            hint="rules"
                        />

                        <StatCard
                            label="Active"
                            value={stats.active}
                            hint="live"
                        />

                        <StatCard
                            label="Regular"
                            value={stats.regular}
                            hint="fares"
                        />

                        <StatCard
                            label="Special"
                            value={stats.special}
                            hint="pricing"
                        />

                    </div>

                </div>

            </section>

            {/* =====================================================
               FILTER
            ===================================================== */}

            <div className="mt-6 bg-white rounded-[36px] border border-gray-100 shadow-sm p-4">

                <div className="flex flex-col lg:flex-row gap-4">

                    {/* SEARCH */}

                    <div className="relative flex-1">

                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />

                        <input
                            placeholder="Search route, pickup, drop..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            className="h-14 w-full rounded-3xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                        />

                    </div>

                    {/* DIRECTION */}

                    <select
                        value={filterDirection}
                        onChange={(e) =>
                            setFilterDirection(
                                e.target.value
                            )
                        }
                        className="h-14 px-4 rounded-3xl border border-slate-200 bg-white text-sm font-medium"
                    >
                        <option>All</option>

                        <option>FORWARD</option>

                        <option>RETURN</option>

                    </select>

                    {/* TYPE */}

                    <select
                        value={filterType}
                        onChange={(e) =>
                            setFilterType(
                                e.target.value
                            )
                        }
                        className="h-14 px-4 rounded-3xl border border-slate-200 bg-white text-sm font-medium"
                    >
                        <option>All</option>

                        <option>REGULAR</option>

                        <option>SPECIAL</option>

                        <option>SEASONAL</option>

                    </select>

                </div>

            </div>

            {/* =====================================================
               LIST
            ===================================================== */}

            <div className="grid gap-4 mt-6">

                {filtered.length === 0 ? (

                    <div className="flex min-h-[350px] items-center justify-center rounded-[36px] border border-slate-200 bg-gradient-to-b from-[#F8FFFD] to-white p-6 text-center">

                        <div>

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0B5D5A]/10">
                                <Route className="h-10 w-10 text-[#0B5D5A]" />
                            </div>

                            <p className="mt-5 text-2xl font-black text-slate-900">
                                No Fare Rules Found
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                Create your first
                                connected fare
                                route.
                            </p>

                        </div>

                    </div>

                ) : (

                    filtered.map((i) => (

                        <div
                            key={i._id}
                            className="group rounded-[36px] border border-slate-200 bg-white p-5 transition-all duration-300 hover:bg-[#F8FFFD] hover:shadow-[0_10px_40px_rgba(11,93,90,0.08)]"
                        >

                            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">

                                {/* LEFT */}

                                <div className="space-y-4 flex-1">

                                    {/* TOP */}

                                    <div className="flex flex-wrap items-center gap-2">

                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                            {
                                                i.status
                                            }
                                        </span>

                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                            {
                                                i.fareType
                                            }
                                        </span>

                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                            {
                                                i.tripDirection
                                            }
                                        </span>

                                    </div>

                                    {/* ROUTE */}

                                    <div>

                                        <h2 className="text-2xl font-black text-slate-900">
                                            {
                                                i.routeName
                                            }
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Connected fare route
                                        </p>

                                    </div>

                                    {/* DETAILS */}

                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                                        <DetailCard
                                            icon={<MapPin size={16} />}
                                            label="Pickup"
                                            value={i.pickupPointName}
                                        />

                                        <DetailCard
                                            icon={<MapPin size={16} />}
                                            label="Drop"
                                            value={i.dropPointName}
                                        />

                                        <DetailCard
                                            icon={
                                                <IndianRupee size={16} />
                                            }
                                            label="Fare"
                                            value={`₹${i.fareAmount}`}
                                        />

                                        <DetailCard
                                            icon={
                                                <CalendarDays size={16} />
                                            }
                                            label="Validity"
                                            value={`${i.validFrom?.slice(
                                                0,
                                                10
                                            )} → ${i.validTill?.slice(
                                                0,
                                                10
                                            )}`}
                                        />

                                    </div>

                                    {/* reason removed */}

                                </div>

                                {/* ACTIONS */}

                                <div className="flex gap-3">

                                    <button
                                        onClick={() => {
                                            setEditingId(
                                                i._id
                                            );

                                            setForm({
                                                busId: i.busId || "",
                                                tripDirection: i.tripDirection || "FORWARD",
                                                pickupPointName: i.pickupPointName ? String(i.pickupPointName).trim() : "",
                                                dropPointName: i.dropPointName ? String(i.dropPointName).trim() : "",
                                                fareAmount: i.fareAmount || "",
                                                fareType: i.fareType || "REGULAR",
                                                validFrom: i.validFrom ? i.validFrom.slice(0, 10) : "",
                                                validTill: i.validTill ? i.validTill.slice(0, 10) : "",
                                                applyNextPickups: !!i.applyNextPickups,
                                                applyNextDrops: !!i.applyNextDrops,
                                            });

                                            setOpenModal(
                                                true
                                            );
                                        }}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-[#0B5D5A] to-[#12A39B] px-5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02]"
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            setConfirmDelete(
                                                i._id
                                            )
                                        }
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-3xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))

                )}

            </div>

            {/* =====================================================
               MODAL
            ===================================================== */}

            {openModal && (

                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

                    <div className="w-full max-w-3xl rounded-[36px] bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

                        {/* HEADER */}

                        <div className="flex items-center justify-between mb-6">

                            <div>

                                <h2 className="text-3xl font-black text-slate-900">
                                    {editingId
                                        ? "Edit Fare"
                                        : "Create Fare"}
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Manage connected
                                    fare routes
                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setOpenModal(
                                        false
                                    )
                                }
                                className="h-11 w-11 rounded-full hover:bg-gray-100 flex items-center justify-center"
                            >
                                <X size={18} />
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            <div className="grid gap-4 md:grid-cols-2">

                                <InputSelect
                                    label="Bus"
                                    icon={
                                        <BusFront size={16} />
                                    }
                                    value={
                                        form.busId
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            busId:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    }
                                >

                                    <option value="">
                                        Select bus
                                    </option>

                                    {buses.map((bus) => (
                                        <option
                                            key={bus._id}
                                            value={bus._id}
                                        >
                                            {bus.routeName}
                                        </option>
                                    ))}

                                </InputSelect>

                                {/* removed separate bus search input */}

                                <InputSelect
                                    label="Direction"
                                    icon={
                                        <ArrowRightLeft size={16} />
                                    }
                                    value={
                                        form.tripDirection
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            tripDirection:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    }
                                >
                                    <option>
                                        FORWARD
                                    </option>

                                    <option>
                                        RETURN
                                    </option>

                                </InputSelect>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm text-slate-600">
                                            <strong>Start:</strong> {getStopDisplayFromObject(tripEndpoints.start)} {tripEndpoints.startTime ? ` — ${tripEndpoints.startTime}` : ""}
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            <strong>End:</strong> {getStopDisplayFromObject(tripEndpoints.end)} {tripEndpoints.endTime ? ` — ${tripEndpoints.endTime}` : ""}
                                        </div>
                                    </div>

                                    <InputField
                                        label="Search pickup"
                                        icon={<Search size={16} />}
                                        value={searchPickup}
                                        onChange={(e) => setSearchPickup(e.target.value)}
                                    />

                                    <InputSelect
                                        label="Pickup Point"
                                        icon={<MapPin size={16} />}
                                        value={form.pickupPointName}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                pickupPointName: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select pickup</option>
                                        {tripPoints.pickup
                                            ?.filter((p) =>
                                                `${p.name} ${p.nameMr || ""}`
                                                    .toLowerCase()
                                                    .includes(searchPickup.toLowerCase())
                                            )
                                            .map((p, idx) => {
                                                const val = String(p.name || "").trim();
                                                return (
                                                    <option key={`${val}-pickup-${idx}`} value={val}>
                                                        {getStopDisplayFromObject(p)}{p.time ? ` — ${p.time}` : ""}
                                                    </option>
                                                );
                                            })}
                                    </InputSelect>
                                </div>

                                <div>
                                    <InputField
                                        label="Search drop"
                                        icon={<Search size={16} />}
                                        value={searchDrop}
                                        onChange={(e) => setSearchDrop(e.target.value)}
                                    />

                                    <InputSelect
                                        label="Drop Point"
                                        icon={<MapPin size={16} />}
                                        value={form.dropPointName}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                dropPointName: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select drop</option>
                                        {tripPoints.drop
                                            ?.filter((p) =>
                                                `${p.name} ${p.nameMr || ""}`
                                                    .toLowerCase()
                                                    .includes(searchDrop.toLowerCase())
                                            )
                                            .map((p, idx) => {
                                                const val = String(p.name || "").trim();
                                                return (
                                                    <option key={`${val}-drop-${idx}`} value={val}>
                                                        {getStopDisplayFromObject(p)}{p.time ? ` — ${p.time}` : ""}
                                                    </option>
                                                );
                                            })}
                                    </InputSelect>
                                </div>

                                {/* pickup/drop order removed */}

                                <InputField
                                    label="Fare Amount"
                                    type="number"
                                    icon={
                                        <IndianRupee size={16} />
                                    }
                                    value={
                                        form.fareAmount
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            fareAmount:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    }
                                />

                                <InputSelect
                                    label="Fare Type"
                                    icon={
                                        <Sparkles size={16} />
                                    }
                                    value={
                                        form.fareType
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            fareType:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    }
                                >
                                    <option>
                                        REGULAR
                                    </option>

                                    <option>
                                        SPECIAL
                                    </option>

                                    <option>
                                        SEASONAL
                                    </option>

                                </InputSelect>

                                <InputField
                                    label="Valid From"
                                    type="date"
                                    value={
                                        form.validFrom
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            validFrom:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    }
                                />

                                <InputField
                                    label="Valid Till"
                                    type="date"
                                    value={
                                        form.validTill
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            validTill:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    }
                                />

                            </div>

                            <div className="flex gap-4 items-center">
                                <label className="inline-flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.applyNextPickups}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                applyNextPickups:
                                                    e.target.checked,
                                            })
                                        }
                                    />

                                    <span className="text-sm">
                                        Apply to next pickups
                                    </span>
                                </label>

                                <label className="inline-flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.applyNextDrops}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                applyNextDrops:
                                                    e.target.checked,
                                            })
                                        }
                                    />

                                    <span className="text-sm">
                                        Apply to next drops
                                    </span>
                                </label>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full h-14 rounded-3xl bg-gradient-to-r from-[#0B5D5A] to-[#12A39B] text-white font-bold shadow-xl hover:scale-[1.01] transition"
                            >

                                {loading ? (

                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" />
                                        Saving...
                                    </span>

                                ) : editingId ? (
                                    "Update Fare"
                                ) : (
                                    "Create Fare"
                                )}

                            </button>

                        </form>

                    </div>

                </div>

            )}

            {/* =====================================================
               DELETE MODAL
            ===================================================== */}

            {confirmDelete && (

                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

                    <div className="bg-white rounded-[36px] p-6 w-full max-w-md shadow-2xl">

                        <h2 className="text-2xl font-black text-slate-900">
                            Delete Fare
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Are you sure you want
                            to delete this fare
                            rule?
                        </p>

                        <div className="flex gap-3 mt-6">

                            <button
                                onClick={() =>
                                    setConfirmDelete(
                                        ""
                                    )
                                }
                                className="flex-1 h-12 rounded-3xl border border-slate-200 font-semibold"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleDelete
                                }
                                className="flex-1 h-12 rounded-3xl bg-red-500 text-white font-semibold"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

/* =====================================================
   COMPONENTS
===================================================== */

function StatCard({
    label,
    value,
    hint,
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md p-4">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                {label}
            </p>

            <div className="mt-3 flex items-end gap-2">

                <h3 className="text-4xl font-black leading-none text-white">
                    {value}
                </h3>

                <span className="pb-1 text-xs text-white/60">
                    {hint}
                </span>

            </div>

        </div>
    );
}

function DetailCard({
    icon,
    label,
    value,
}) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-4">

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">

                {icon}

                {label}

            </div>

            <p className="mt-2 text-sm font-bold text-slate-900">
                {value}
            </p>

        </div>
    );
}

function InputField({
    label,
    icon,
    type = "text",
    value,
    onChange,
}) {
    return (
        <label className="space-y-2 block">

            <span className="flex items-center gap-2 text-sm font-bold text-slate-700">

                {icon}

                {label}

            </span>

            <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full h-14 rounded-3xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-[#0B5D5A]/10 focus:border-[#0B5D5A]"
            />

        </label>
    );
}

function InputSelect({
    label,
    icon,
    value,
    onChange,
    children,
}) {
    return (
        <label className="space-y-2 block">

            <span className="flex items-center gap-2 text-sm font-bold text-slate-700">

                {icon}

                {label}

            </span>

            <select
                value={value}
                onChange={onChange}
                className="w-full h-14 rounded-3xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-[#0B5D5A]/10 focus:border-[#0B5D5A]"
            >
                {children}
            </select>

        </label>
    );
}

function TextAreaField({
    label,
    value,
    onChange,
}) {
    return (
        <label className="space-y-2 block">

            <span className="text-sm font-bold text-slate-700">
                {label}
            </span>

            <textarea
                rows={4}
                value={value}
                onChange={onChange}
                className="w-full rounded-3xl border border-slate-200 p-4 outline-none focus:ring-4 focus:ring-[#0B5D5A]/10 focus:border-[#0B5D5A]"
            />

        </label>
    );
}