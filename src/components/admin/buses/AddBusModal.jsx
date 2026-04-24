"use client";

import SeatLayout from "@/components/SeatLayout";
import {
    BUS_TYPES,
    getDefaultFareAmountByRoute,
    getFarePreviewByRoute,
    ROUTES,
} from "@/lib/fare";
import {
    Bus,
    ChevronDown,
    ChevronUp,
    Clock3,
    IndianRupee,
    MapPin,
    PencilLine,
    Route,
    Save,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const THEME = "#0E6B68";
const MAX_ROUTE_POINTS = 150;
const DEFAULT_ROUTE_POINTS = 10;

const initialForm = {
    busNumber: "",
    busName: "",
    busType: BUS_TYPES.NON_AC,
    seatLayout: 32,
    cabinSeatCount: 0,
    cabinSeats: [],
    routeName: "Shrivardhan - Borli - Borivali - Virar",
    routeCode: ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR,
    tripType: "ONE_WAY",
    forwardTrip: {
        from: "Shrivardhan Bus Depot",
        to: "Borivali Depot",
        departureTime: "08:00",
        arrivalTime: "12:30",
        pickupPoints: [],
        dropPoints: [],
    },
    returnTrip: {
        from: "Borivali Depot",
        to: "Shrivardhan Bus Depot",
        departureTime: "18:00",
        arrivalTime: "22:30",
        pickupPoints: [],
        dropPoints: [],
    },
    fareConfig: {
        route: ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR,
        busType: BUS_TYPES.NON_AC,
        defaultAmount: 0,
    },
    status: "ACTIVE",
    notes: "",
};

function normalizeRoutePoints(points = []) {
    if (!Array.isArray(points)) return [];

    return points
        .slice(0, MAX_ROUTE_POINTS)
        .map((point, index) => {
            if (typeof point === "string") {
                return {
                    name: String(point).trim(),
                    time: "",
                    order: index + 1,
                };
            }

            return {
                name: String(point?.name || "").trim(),
                time: String(point?.time || "").trim(),
                order: Number(point?.order) > 0 ? Number(point.order) : index + 1,
            };
        })
        .filter((point) => point.name);
}

function createDefaultPoints(count = DEFAULT_ROUTE_POINTS) {
    return Array.from({ length: count }, (_, index) => ({
        name: "",
        time: "",
        order: index + 1,
    }));
}

function Field({ label, required, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label} {required ? <span className="text-red-500">*</span> : null}
            </label>
            {children}
        </div>
    );
}

function Input(props) {
    return (
        <input
            {...props}
            className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-transparent focus:ring-2 ${props.className || ""
                }`}
            style={{ "--tw-ring-color": `${THEME}33` }}
        />
    );
}

function Select(props) {
    return (
        <select
            {...props}
            className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-transparent focus:ring-2 ${props.className || ""
                }`}
            style={{ "--tw-ring-color": `${THEME}33` }}
        />
    );
}

function normalizeBusToForm(busData = {}) {
    const routeCode =
        busData?.routeCode ||
        busData?.fareConfig?.route ||
        ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR;

    const busType = busData?.busType || BUS_TYPES.NON_AC;

    const existingDefaultAmount = Number(busData?.fareConfig?.defaultAmount || 0);

    const fallbackDefaultAmount = getDefaultFareAmountByRoute(routeCode, busType);

    return {
        ...initialForm,
        ...busData,

        busNumber: busData?.busNumber || "",
        busName: busData?.busName || "",
        busType,
        seatLayout: Number(busData?.seatLayout || 32),
        cabinSeatCount: Number(busData?.cabinSeatCount || 0),
        cabinSeats: Array.isArray(busData?.cabinSeats)
            ? busData.cabinSeats.map((n) => Number(n))
            : [],
        routeName:
            busData?.routeName || "Shrivardhan - Borli - Borivali - Virar",
        routeCode,
        tripType: busData?.tripType || "ONE_WAY",

        forwardTrip: {
            ...initialForm.forwardTrip,
            ...(busData?.forwardTrip || {}),
            from: busData?.forwardTrip?.from || initialForm.forwardTrip.from,
            to: busData?.forwardTrip?.to || initialForm.forwardTrip.to,
            departureTime:
                busData?.forwardTrip?.departureTime ||
                initialForm.forwardTrip.departureTime,
            arrivalTime:
                busData?.forwardTrip?.arrivalTime || initialForm.forwardTrip.arrivalTime,
            pickupPoints: normalizeRoutePoints(busData?.forwardTrip?.pickupPoints),
            dropPoints: normalizeRoutePoints(busData?.forwardTrip?.dropPoints),
        },

        returnTrip: {
            ...initialForm.returnTrip,
            ...(busData?.returnTrip || {}),
            from: busData?.returnTrip?.from || initialForm.returnTrip.from,
            to: busData?.returnTrip?.to || initialForm.returnTrip.to,
            departureTime:
                busData?.returnTrip?.departureTime ||
                initialForm.returnTrip.departureTime,
            arrivalTime:
                busData?.returnTrip?.arrivalTime || initialForm.returnTrip.arrivalTime,
            pickupPoints: normalizeRoutePoints(busData?.returnTrip?.pickupPoints),
            dropPoints: normalizeRoutePoints(busData?.returnTrip?.dropPoints),
        },

        fareConfig: {
            route: routeCode,
            busType,
            defaultAmount:
                existingDefaultAmount > 0 ? existingDefaultAmount : fallbackDefaultAmount,
        },

        status: busData?.status || "ACTIVE",
        notes: busData?.notes || "",
    };
}

export default function AddBusModal({
    open,
    mode = "add",
    bus = null,
    onClose,
    onSuccess,
}) {
    const router = useRouter();
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [expandedZone, setExpandedZone] = useState(null);

    const getAccessToken = () => {
        try {
            return localStorage.getItem("accessToken") || "";
        } catch {
            return "";
        }
    };

    const getRefreshToken = () => {
        try {
            return localStorage.getItem("refreshToken") || "";
        } catch {
            return "";
        }
    };

    const setAccessToken = (token) => {
        try {
            localStorage.setItem("accessToken", token);
        } catch {
            // ignore
        }
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) return null;

            const res = await fetch("/api/auth/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.accessToken) {
                return null;
            }

            setAccessToken(data.accessToken);
            return data.accessToken;
        } catch {
            return null;
        }
    };

    const fetchWithAutoRefresh = async (url, options = {}) => {
        let token = getAccessToken();

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

        let res = await doFetch(token);

        if (res.status === 401) {
            const newToken = await refreshAccessToken();

            if (newToken) {
                res = await doFetch(newToken);
            }
        }

        return res;
    };

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && bus) {
            setForm(normalizeBusToForm(bus));
        } else {
            setForm({
                ...initialForm,
                forwardTrip: {
                    ...initialForm.forwardTrip,
                    pickupPoints: createDefaultPoints(),
                    dropPoints: createDefaultPoints(),
                },
                fareConfig: {
                    ...initialForm.fareConfig,
                    defaultAmount: getDefaultFareAmountByRoute(
                        initialForm.routeCode,
                        initialForm.busType
                    ),
                },
            });
        }

        setExpandedZone(null);
    }, [open, mode, bus]);

    const farePreview = useMemo(() => {
        return getFarePreviewByRoute(
            form?.routeCode || ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR,
            form?.busType || BUS_TYPES.NON_AC
        );
    }, [form.routeCode, form.busType]);

    useEffect(() => {
        if (!open) return;

        setForm((prev) => {
            const currentDefaultAmount = Number(prev?.fareConfig?.defaultAmount || 0);
            const existingRoute = prev?.fareConfig?.route;
            const existingBusType = prev?.fareConfig?.busType;

            const routeChanged = existingRoute !== prev.routeCode;
            const busTypeChanged = existingBusType !== prev.busType;

            if (mode === "add") {
                return {
                    ...prev,
                    fareConfig: {
                        route: prev.routeCode,
                        busType: prev.busType,
                        defaultAmount: getDefaultFareAmountByRoute(prev.routeCode, prev.busType),
                    },
                };
            }

            if (mode === "edit" && (routeChanged || busTypeChanged || currentDefaultAmount <= 0)) {
                return {
                    ...prev,
                    fareConfig: {
                        route: prev.routeCode,
                        busType: prev.busType,
                        defaultAmount:
                            currentDefaultAmount > 0 && !routeChanged && !busTypeChanged
                                ? currentDefaultAmount
                                : getDefaultFareAmountByRoute(prev.routeCode, prev.busType),
                    },
                };
            }

            return {
                ...prev,
                fareConfig: {
                    ...prev.fareConfig,
                    route: prev.routeCode,
                    busType: prev.busType,
                },
            };
        });
    }, [form.routeCode, form.busType, mode, open]);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleTripChange = (tripKey, field, value) => {
        setForm((prev) => ({
            ...prev,
            [tripKey]: {
                ...prev[tripKey],
                [field]: value,
            },
        }));
    };

    const handleRoutePointChange = (tripKey, listKey, index, field, value) => {
        setForm((prev) => {
            const current = Array.isArray(prev?.[tripKey]?.[listKey])
                ? [...prev[tripKey][listKey]]
                : [];

            current[index] = {
                ...current[index],
                [field]: value,
            };

            return {
                ...prev,
                [tripKey]: {
                    ...prev[tripKey],
                    [listKey]: current,
                },
            };
        });
    };

    const addRoutePoint = (tripKey, listKey) => {
        setForm((prev) => {
            const current = Array.isArray(prev?.[tripKey]?.[listKey])
                ? [...prev[tripKey][listKey]]
                : [];

            if (current.length >= MAX_ROUTE_POINTS) {
                return prev;
            }

            current.push({
                name: "",
                time: "",
                order: current.length + 1,
            });

            return {
                ...prev,
                [tripKey]: {
                    ...prev[tripKey],
                    [listKey]: current,
                },
            };
        });
    };

    const removeRoutePoint = (tripKey, listKey, index) => {
        setForm((prev) => {
            const current = Array.isArray(prev?.[tripKey]?.[listKey])
                ? [...prev[tripKey][listKey]]
                : [];

            current.splice(index, 1);

            const withOrder = current.map((point, idx) => ({
                ...point,
                order: idx + 1,
            }));

            return {
                ...prev,
                [tripKey]: {
                    ...prev[tripKey],
                    [listKey]: withOrder,
                },
            };
        });
    };

    const handleCabinSeats = (value) => {
        const seats = String(value || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => Number(item))
            .filter((n) => !Number.isNaN(n));

        setForm((prev) => ({
            ...prev,
            cabinSeats: seats,
            cabinSeatCount: seats.length,
        }));
    };

    const validateForm = () => {
        const validateRoutePoints = (points = [], label) => {
            for (let index = 0; index < points.length; index += 1) {
                const point = points[index] || {};
                const name = String(point?.name || "").trim();
                const time = String(point?.time || "").trim();

                if (!name && !time) {
                    continue;
                }

                if (!name) {
                    return `${label} point ${index + 1} name is required`;
                }

                if (!time) {
                    return `${label} point ${index + 1} time is required`;
                }
            }

            return null;
        };

        if (!form.busNumber?.trim()) return "Bus number is required";
        if (!form.busName?.trim()) return "Bus name is required";
        if (!form.routeName?.trim()) return "Route name is required";
        if (!form.forwardTrip?.from?.trim()) return "Forward trip from is required";
        if (!form.forwardTrip?.to?.trim()) return "Forward trip to is required";
        if (!form.forwardTrip?.departureTime?.trim()) return "Forward departure time is required";
        if (!form.forwardTrip?.arrivalTime?.trim()) return "Forward arrival time is required";

        if (form.tripType === "RETURN") {
            if (!form.returnTrip?.from?.trim()) return "Return trip from is required";
            if (!form.returnTrip?.to?.trim()) return "Return trip to is required";
            if (!form.returnTrip?.departureTime?.trim()) return "Return departure time is required";
            if (!form.returnTrip?.arrivalTime?.trim()) return "Return arrival time is required";
        }

        if ((form?.forwardTrip?.pickupPoints || []).length > MAX_ROUTE_POINTS) {
            return `Forward trip pickup points cannot exceed ${MAX_ROUTE_POINTS}`;
        }

        const forwardPickupError = validateRoutePoints(
            form?.forwardTrip?.pickupPoints || [],
            "Forward pickup"
        );
        if (forwardPickupError) return forwardPickupError;

        if ((form?.forwardTrip?.dropPoints || []).length > MAX_ROUTE_POINTS) {
            return `Forward trip drop points cannot exceed ${MAX_ROUTE_POINTS}`;
        }

        const forwardDropError = validateRoutePoints(
            form?.forwardTrip?.dropPoints || [],
            "Forward drop"
        );
        if (forwardDropError) return forwardDropError;

        if (form.tripType === "RETURN") {
            if ((form?.returnTrip?.pickupPoints || []).length > MAX_ROUTE_POINTS) {
                return `Return trip pickup points cannot exceed ${MAX_ROUTE_POINTS}`;
            }

            const returnPickupError = validateRoutePoints(
                form?.returnTrip?.pickupPoints || [],
                "Return pickup"
            );
            if (returnPickupError) return returnPickupError;

            if ((form?.returnTrip?.dropPoints || []).length > MAX_ROUTE_POINTS) {
                return `Return trip drop points cannot exceed ${MAX_ROUTE_POINTS}`;
            }

            const returnDropError = validateRoutePoints(
                form?.returnTrip?.dropPoints || [],
                "Return drop"
            );
            if (returnDropError) return returnDropError;
        }

        return null;
    };

    const renderRoutePointsEditor = (tripKey, listKey, title, addLabel) => {
        const points = Array.isArray(form?.[tripKey]?.[listKey])
            ? form[tripKey][listKey]
            : [];

        return (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h5 className="text-sm font-semibold text-slate-800">
                            {title} ({points.length}/{MAX_ROUTE_POINTS})
                        </h5>
                        <p className="text-xs text-slate-500">Add point name and time</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => addRoutePoint(tripKey, listKey)}
                        disabled={points.length >= MAX_ROUTE_POINTS}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {addLabel}
                    </button>
                </div>

                {points.length ? (
                    <div className="space-y-3">
                        {points.map((point, idx) => (
                            <div key={`${tripKey}-${listKey}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-xs font-semibold text-slate-600">Point {idx + 1}</p>
                                    <button
                                        type="button"
                                        onClick={() => removeRoutePoint(tripKey, listKey, idx)}
                                        className="text-xs font-semibold text-red-500"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <Input
                                        value={point?.name || ""}
                                        onChange={(e) =>
                                            handleRoutePointChange(
                                                tripKey,
                                                listKey,
                                                idx,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Point name"
                                    />
                                    <Input
                                        type="time"
                                        value={point?.time || ""}
                                        onChange={(e) =>
                                            handleRoutePointChange(
                                                tripKey,
                                                listKey,
                                                idx,
                                                "time",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500">
                        No points added yet
                    </div>
                )}
            </div>
        );
    };

    const submit = async (e) => {
        e?.preventDefault?.();

        const errorMessage = validateForm();
        if (errorMessage) {
            alert(errorMessage);
            return;
        }

        try {
            setSaving(true);

            const normalizeTripPayload = (trip = {}) => {
                const normalizePoints = (points = []) => {
                    if (!Array.isArray(points)) return [];

                    return points
                        .slice(0, MAX_ROUTE_POINTS)
                        .map((point, index) => ({
                            name: String(point?.name || "").trim(),
                            time: String(point?.time || "").trim(),
                            order: index + 1,
                            isActive: true,
                        }))
                        .filter((point) => point.name && point.time);
                };

                return {
                    ...trip,
                    from: String(trip?.from || "").trim(),
                    to: String(trip?.to || "").trim(),
                    departureTime: String(trip?.departureTime || "").trim(),
                    arrivalTime: String(trip?.arrivalTime || "").trim(),
                    pickupPoints: normalizePoints(trip?.pickupPoints),
                    dropPoints: normalizePoints(trip?.dropPoints),
                };
            };

            const payload = {
                ...form,
                seatLayout: Number(form.seatLayout),
                cabinSeatCount: Number(form.cabinSeatCount || 0),
                cabinSeats: Array.isArray(form.cabinSeats)
                    ? form.cabinSeats.map((n) => Number(n)).filter((n) => !Number.isNaN(n))
                    : [],
                forwardTrip: normalizeTripPayload(form.forwardTrip),
                returnTrip:
                    form.tripType === "RETURN"
                        ? normalizeTripPayload(form.returnTrip)
                        : null,
                fareConfig: {
                    route: form.routeCode,
                    busType: form.busType,
                    defaultAmount: Number(form.fareConfig?.defaultAmount || 0),
                },
            };

            const url =
                mode === "edit" && bus?._id
                    ? `/api/admin/buses/${bus._id}`
                    : "/api/admin/buses";

            const method = mode === "edit" ? "PUT" : "POST";

            const res = await fetchWithAutoRefresh(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data?.message || `Failed to ${mode === "edit" ? "update" : "create"} bus`);
                return;
            }

            onSuccess?.(data?.data);
            onClose?.();
        } catch (error) {
            console.error(error);
            alert(`Failed to ${mode === "edit" ? "update" : "create"} bus`);
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    const modalTitle = mode === "edit" ? "Edit Bus" : "Add Bus";
    const modalDescription =
        mode === "edit"
            ? "Update bus details, route, timings, layout and fare configuration"
            : "Create a new bus with route, timings, seat layout and fare configuration";

    const submitLabel = saving
        ? mode === "edit"
            ? "Updating..."
            : "Saving..."
        : mode === "edit"
            ? "Update Bus"
            : "Create Bus";

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-2 sm:p-4">
            <div className="relative flex h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                                style={{ backgroundColor: "#E8F5F4" }}
                            >
                                {mode === "edit" ? (
                                    <PencilLine className="h-5 w-5" style={{ color: THEME }} />
                                ) : (
                                    <Bus className="h-5 w-5" style={{ color: THEME }} />
                                )}
                            </div>
                            <div>
                                <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                                    {modalTitle}
                                </h2>
                                <p className="text-xs text-slate-500 sm:text-sm">{modalDescription}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="no-scrollbar flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 xl:grid-cols-5">
                        {/* Left Form */}
                        <form onSubmit={submit} className="space-y-6 xl:col-span-3">
                            {/* Basic Details */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <div
                                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                                        style={{ backgroundColor: "#E8F5F4" }}
                                    >
                                        <Bus className="h-5 w-5" style={{ color: THEME }} />
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-900">Basic Details</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="Bus Number" required>
                                        <Input
                                            value={form.busNumber}
                                            onChange={(e) => handleChange("busNumber", e.target.value.toUpperCase())}
                                            placeholder="MH12AB1234"
                                        />
                                    </Field>

                                    <Field label="Bus Name" required>
                                        <Input
                                            value={form.busName}
                                            onChange={(e) => handleChange("busName", e.target.value)}
                                            placeholder="Morya Premium Coach"
                                        />
                                    </Field>

                                    <Field label="Bus Type" required>
                                        <Select
                                            value={form.busType}
                                            onChange={(e) => handleChange("busType", e.target.value)}
                                        >
                                            <option value={BUS_TYPES.NON_AC}>NON_AC</option>
                                            <option value={BUS_TYPES.AC}>AC</option>
                                            <option value={BUS_TYPES.NON_AC_SLEEPER}>NON_AC_SLEEPER</option>
                                            <option value={BUS_TYPES.AC_SLEEPER}>AC_SLEEPER</option>
                                        </Select>
                                    </Field>

                                    <Field label="Seat Layout" required>
                                        <Select
                                            value={form.seatLayout}
                                            onChange={(e) => handleChange("seatLayout", Number(e.target.value))}
                                        >
                                            <option value={21}>21 Seater</option>
                                            <option value={32}>32 Seater</option>
                                            <option value={35}>35 Seater</option>
                                            <option value={39}>39 Seater</option>
                                        </Select>
                                    </Field>

                                    <Field label="Cabin Seats (comma separated)">
                                        <Input
                                            value={(form.cabinSeats || []).join(", ")}
                                            onChange={(e) => handleCabinSeats(e.target.value)}
                                            placeholder="1, 2"
                                        />
                                    </Field>

                                    <Field label="Status">
                                        <Select
                                            value={form.status}
                                            onChange={(e) => handleChange("status", e.target.value)}
                                        >
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                            <option value="MAINTENANCE">MAINTENANCE</option>
                                        </Select>
                                    </Field>
                                </div>
                            </div>

                            {/* Route Details */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <div
                                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                                        style={{ backgroundColor: "#E8F5F4" }}
                                    >
                                        <Route className="h-5 w-5" style={{ color: THEME }} />
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-900">Route Details</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="Route Name" required>
                                        <Input
                                            value={form.routeName}
                                            onChange={(e) => handleChange("routeName", e.target.value)}
                                        />
                                    </Field>

                                    <Field label="Route Code" required>
                                        <Select
                                            value={form.routeCode}
                                            onChange={(e) => handleChange("routeCode", e.target.value)}
                                        >
                                            <option value={ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR}>
                                                SHRIVARDHAN → BORIVALI / VIRAR
                                            </option>
                                            <option value={ROUTES.BORIVALI_VIRAR_TO_BORLI_SHRIVARDHAN}>
                                                BORIVALI / VIRAR → SHRIVARDHAN
                                            </option>
                                        </Select>
                                    </Field>

                                    <Field label="Trip Type">
                                        <Select
                                            value={form.tripType}
                                            onChange={(e) => handleChange("tripType", e.target.value)}
                                        >
                                            <option value="ONE_WAY">ONE_WAY</option>
                                            <option value="RETURN">RETURN</option>
                                        </Select>
                                    </Field>

                                    <Field label="Notes">
                                        <Input
                                            value={form.notes}
                                            onChange={(e) => handleChange("notes", e.target.value)}
                                            placeholder="Daily morning trip"
                                        />
                                    </Field>

                                    <Field label="Default Fare (INR)">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={Number(form?.fareConfig?.defaultAmount || 0)}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    fareConfig: {
                                                        ...prev.fareConfig,
                                                        defaultAmount: Math.max(0, Number(e.target.value || 0)),
                                                    },
                                                }))
                                            }
                                        />
                                    </Field>
                                </div>
                            </div>

                            {/* Forward Trip */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <div
                                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                                        style={{ backgroundColor: "#E8F5F4" }}
                                    >
                                        <Clock3 className="h-5 w-5" style={{ color: THEME }} />
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-900">Forward Trip</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="From" required>
                                        <Input
                                            value={form.forwardTrip.from}
                                            onChange={(e) => handleTripChange("forwardTrip", "from", e.target.value)}
                                        />
                                    </Field>

                                    <Field label="To" required>
                                        <Input
                                            value={form.forwardTrip.to}
                                            onChange={(e) => handleTripChange("forwardTrip", "to", e.target.value)}
                                        />
                                    </Field>

                                    <Field label="Departure Time" required>
                                        <Input
                                            type="time"
                                            value={form.forwardTrip.departureTime}
                                            onChange={(e) =>
                                                handleTripChange("forwardTrip", "departureTime", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Arrival Time" required>
                                        <Input
                                            type="time"
                                            value={form.forwardTrip.arrivalTime}
                                            onChange={(e) =>
                                                handleTripChange("forwardTrip", "arrivalTime", e.target.value)
                                            }
                                        />
                                    </Field>
                                </div>

                                <div className="mt-4 space-y-4">
                                    {renderRoutePointsEditor("forwardTrip", "pickupPoints", "Pickup Points", "Add Pickup Point")}
                                    {renderRoutePointsEditor("forwardTrip", "dropPoints", "Drop Points", "Add Drop Point")}
                                </div>
                            </div>

                            {/* Return Trip */}
                            {form.tripType === "RETURN" && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                    <div className="mb-4 flex items-center gap-2">
                                        <div
                                            className="flex h-9 w-9 items-center justify-center rounded-xl"
                                            style={{ backgroundColor: "#E8F5F4" }}
                                        >
                                            <MapPin className="h-5 w-5" style={{ color: THEME }} />
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-900">Return Trip</h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Field label="From" required>
                                            <Input
                                                value={form.returnTrip.from}
                                                onChange={(e) => handleTripChange("returnTrip", "from", e.target.value)}
                                            />
                                        </Field>

                                        <Field label="To" required>
                                            <Input
                                                value={form.returnTrip.to}
                                                onChange={(e) => handleTripChange("returnTrip", "to", e.target.value)}
                                            />
                                        </Field>

                                        <Field label="Departure Time" required>
                                            <Input
                                                type="time"
                                                value={form.returnTrip.departureTime}
                                                onChange={(e) =>
                                                    handleTripChange("returnTrip", "departureTime", e.target.value)
                                                }
                                            />
                                        </Field>

                                        <Field label="Arrival Time" required>
                                            <Input
                                                type="time"
                                                value={form.returnTrip.arrivalTime}
                                                onChange={(e) =>
                                                    handleTripChange("returnTrip", "arrivalTime", e.target.value)
                                                }
                                            />
                                        </Field>
                                    </div>

                                    <div className="mt-4 space-y-4">
                                        {renderRoutePointsEditor("returnTrip", "pickupPoints", "Return Pickup Points", "Add Return Pickup Point")}
                                        {renderRoutePointsEditor("returnTrip", "dropPoints", "Return Drop Points", "Add Return Drop Point")}
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Right Preview */}
                        <div className="space-y-6 xl:col-span-2">
                            <SeatLayout
                                layout={Number(form.seatLayout)}
                                cabins={(form.cabinSeats || []).map((seatNo) => ({ seatNo }))}
                                compact
                            />

                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded-xl"
                                        style={{ backgroundColor: "#E8F5F4" }}
                                    >
                                        <IndianRupee className="h-4 w-4" style={{ color: THEME }} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                                            Fare Preview
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {mode === "edit"
                                                ? "Existing bus fare config + live fallback preview"
                                                : "Based on route & bus type (with real stop groups)"}
                                        </p>
                                    </div>
                                </div>

                                <div className="no-scrollbar max-h-[420px] space-y-3 overflow-y-auto p-4">
                                    {farePreview.length ? (
                                        farePreview.map((zone, index) => {
                                            const isOpen = expandedZone === index;

                                            return (
                                                <div
                                                    key={zone.zone}
                                                    className="overflow-hidden rounded-2xl border border-slate-200"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedZone(isOpen ? null : index)}
                                                        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">{zone.label}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {zone.stops?.length || 0} stops
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                                                                style={{ backgroundColor: THEME }}
                                                            >
                                                                ₹{zone.amount}
                                                            </span>
                                                            {isOpen ? (
                                                                <ChevronUp className="h-4 w-4 text-slate-500" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4 text-slate-500" />
                                                            )}
                                                        </div>
                                                    </button>

                                                    {isOpen && (
                                                        <div className="border-t border-slate-100 bg-white p-4">
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {(zone.stopsWithMarathi || []).map((stop, idx) => (
                                                                    <div
                                                                        key={`${zone.zone}-${idx}`}
                                                                        className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                                                                    >
                                                                        <p className="text-sm font-medium text-slate-800">
                                                                            {stop.english}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500">{stop.marathi}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                                            No fare preview available for selected route.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <h4 className="text-sm font-semibold text-slate-900">
                                    {mode === "edit" ? "Current Fare Config" : "Default Fare Config"}
                                </h4>

                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <p className="text-[11px] uppercase tracking-wide text-slate-500">Route</p>
                                        <p className="mt-1 break-all text-sm font-medium text-slate-800">
                                            {form.routeCode}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <p className="text-[11px] uppercase tracking-wide text-slate-500">Bus Type</p>
                                        <p className="mt-1 text-sm font-medium text-slate-800">{form.busType}</p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                                            {mode === "edit" ? "Saved / Fallback Default Amount" : "Default Amount"}
                                        </p>
                                        <p className="mt-1 text-base font-semibold text-slate-900">
                                            ₹{Number(form.fareConfig?.defaultAmount || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                    <button
                        type="button"
                        onClick={() => {
                            const busId = mode === "edit" && bus?._id ? String(bus._id) : "";
                            const target = busId ? `/admin/bus/fares?busId=${busId}` : "/admin/bus/fares";
                            router.push(target);
                        }}
                        className="w-full rounded-2xl border border-[#d9e8e6] px-4 py-2.5 text-sm font-semibold text-[#0E6B68] transition hover:bg-[#f1f8f7] sm:w-auto"
                    >
                        Add Fares
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={submit}
                        disabled={saving}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 sm:w-auto"
                        style={{ backgroundColor: THEME }}
                    >
                        <Save className="h-4 w-4" />
                        {submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}