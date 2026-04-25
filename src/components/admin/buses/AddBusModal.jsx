"use client";

import SeatLayout from "@/components/SeatLayout";
import { getStopNameMarathi, normalizeStopName } from "@/lib/fare";
import { showAppToast } from "@/lib/toast";
import clsx from "clsx";
import {
    Armchair,
    ArrowRightLeft,
    Bus,
    CalendarDays,
    CheckCircle2,
    IndianRupee,
    MapPin,
    Plus,
    RefreshCw,
    Route,
    Save,
    Table2,
    Trash2,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const MAX_POINTS = 150;
const MAX_CABINS = 10;
const MAX_TABLES = 10;

const BUS_TYPES = {
    NON_AC: "NON_AC",
    AC: "AC",
    SEMI_SLEEPER: "SEMI_SLEEPER",
    SLEEPER: "SLEEPER",
    SEATER: "SEATER",
};

const TRIP_TYPES = {
    ONE_WAY: "ONE_WAY",
    RETURN: "RETURN",
};

const STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
};

function uid(prefix = "") {
    return `${prefix}${Date.now().toString(36)}${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}

/* -------------------- Helpers -------------------- */

function emptyPoint(order = 1) {
    return {
        id: uid("pt_"),
        name: "",
        nameNormalized: "",
        marathi: "",
        time: "",
        order: Number(order) || 1,
        isActive: true,
    };
}

function emptyFareRule() {
    return {
        id: uid("fr_"),
        tripDirection: "FORWARD",
        pickupId: null,
        dropId: null,
        fare: 0,
        startDate: "",
        endDate: "",
        applyToNextPickups: false,
        applyToPreviousDrops: false,
        isActive: true,
    };
}

function getNextCabinLabel(cabins = []) {
    const used = new Set((cabins || []).map((c) => String(c.label || "").toUpperCase()));
    let i = 1;
    while (used.has(`C${i}`)) i++;
    return `C${i}`;
}

function getNextTableLabel(tables = []) {
    const used = new Set((tables || []).map((t) => String(t.label || "").toUpperCase()));
    let i = 1;
    while (used.has(`T${i}`)) i++;
    return `T${i}`;
}

function normalizeCabins(items = []) {
    return (Array.isArray(items) ? items : [])
        .slice(0, MAX_CABINS)
        .map((item, index) => ({
            id: item?.id || item?._id || uid("cb_"),
            label: String(item?.label || `C${index + 1}`).trim(),
            seatIds: Array.isArray(item?.seatIds) ? item.seatIds : [],
        }));
}

function normalizeTables(items = []) {
    return (Array.isArray(items) ? items : [])
        .slice(0, MAX_TABLES)
        .map((item, index) => ({
            id: item?.id || item?._id || uid("tb_"),
            label: String(item?.label || `T${index + 1}`).trim(),
        }));
}

function reversePointsForReturn(forwardList = []) {
    const reversed = [...forwardList].slice().reverse();
    return reversed.map((p, idx) => ({
        id: uid("pt_"),
        name: p.name,
        nameNormalized: p.nameNormalized || normalizeStopName(p.name),
        marathi: p.marathi || getStopNameMarathi(p.name),
        time: p.time,
        order: idx + 1,
        isActive: p.isActive ?? true,
    }));
}

function getInitialState(initial = null) {
    const base = {
        busNumber: "",
        busName: "",
        busType: BUS_TYPES.NON_AC,
        seatLayout: 32,
        tripType: TRIP_TYPES.ONE_WAY,
        status: STATUS.ACTIVE,
        routeName: "",
        forwardTrip: {
            from: "",
            to: "",
            departureTime: "",
            arrivalTime: "",
            pickupPoints: [emptyPoint(1)],
            dropPoints: [emptyPoint(1)],
        },
        returnTrip: {
            from: "",
            to: "",
            departureTime: "",
            arrivalTime: "",
            pickupPoints: [],
            dropPoints: [],
        },
        autoGenerateReturn: false,
        cabins: [],
        tables: [],
        fareRules: [],
    };

    if (!initial) return base;

    const normalizePoints = (arr = []) =>
        (Array.isArray(arr) ? arr : [])
            .slice(0, MAX_POINTS)
            .map((p, idx) => ({
                id: p?.id || uid("pt_"),
                name: String(p?.name || "").trim(),
                nameNormalized: normalizeStopName(String(p?.name || "")),
                marathi: p?.marathi || getStopNameMarathi(String(p?.name || "")),
                time: String(p?.time || ""),
                order: Number(p?.order) || idx + 1,
                isActive: p?.isActive ?? true,
            }));

    return {
        ...base,
        ...initial,
        forwardTrip: {
            ...base.forwardTrip,
            ...(initial.forwardTrip || {}),
            pickupPoints: normalizePoints(
                initial.forwardTrip?.pickupPoints || base.forwardTrip.pickupPoints
            ),
            dropPoints: normalizePoints(
                initial.forwardTrip?.dropPoints || base.forwardTrip.dropPoints
            ),
        },
        returnTrip: {
            ...base.returnTrip,
            ...(initial.returnTrip || {}),
            pickupPoints: normalizePoints(initial.returnTrip?.pickupPoints || []),
            dropPoints: normalizePoints(initial.returnTrip?.dropPoints || []),
        },
        cabins: normalizeCabins(initial.cabins),
        tables: normalizeTables(initial.tables),
        fareRules: Array.isArray(initial.fareRules)
            ? initial.fareRules.map((fr) => ({
                ...emptyFareRule(),
                ...fr,
                id: fr?.id || fr?._id || uid("fr_"),
            }))
            : [],
    };
}

/* -------------------- UI Helpers -------------------- */

function SectionCard({ icon: Icon, title, subtitle, right, children }) {
    return (
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B5D5A]/10 text-[#0B5D5A]">
                        {Icon ? <Icon className="h-5 w-5" /> : null}
                    </div>
                    <div>
                        <h4 className="text-base font-semibold text-slate-900">{title}</h4>
                        {subtitle ? (
                            <p className="text-xs text-slate-500 sm:text-sm">{subtitle}</p>
                        ) : null}
                    </div>
                </div>
                {right ? <div>{right}</div> : null}
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

function Input({ className = "", ...props }) {
    return (
        <input
            {...props}
            className={clsx(
                "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10",
                className
            )}
        />
    );
}

function Select({ className = "", children, ...props }) {
    return (
        <select
            {...props}
            className={clsx(
                "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10",
                className
            )}
        >
            {children}
        </select>
    );
}

function Label({ children, required = false }) {
    return (
        <label className="mb-2 block text-sm font-medium text-slate-700">
            <span>{children}</span>
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>
    );
}

function Chip({ children, className = "" }) {
    return (
        <span
            className={clsx(
                "inline-flex items-center rounded-full border border-[#0B5D5A]/10 bg-[#0B5D5A]/5 px-3 py-1 text-xs font-semibold text-[#0B5D5A]",
                className
            )}
        >
            {children}
        </span>
    );
}

function Toggle({ checked, onChange, label }) {
    return (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 rounded border-slate-300 accent-[#0B5D5A]"
            />
            {label}
        </label>
    );
}

function EmptyState({ text }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="font-semibold text-slate-700">{text}</p>
        </div>
    );
}

/* -------------------- Main Component -------------------- */

export default function BusModalForm({
    open,
    onClose,
    onSaved,
    initialData = null,
}) {
    const router = useRouter();
    const [form, setForm] = useState(() => getInitialState(initialData));
    const [saving, setSaving] = useState(false);
    const [previewFareRule, setPreviewFareRule] = useState(null);

    const editMode = Boolean(initialData && initialData._id);

    useEffect(() => {
        if (!open) return;
        setForm(getInitialState(initialData));
    }, [open, initialData]);

    const updateField = useCallback((key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const updateTripField = useCallback((tripKey, key, value) => {
        setForm((prev) => ({
            ...prev,
            [tripKey]: { ...prev[tripKey], [key]: value },
        }));
    }, []);

    function addPointToList(tripKey, listKey) {
        setForm((prev) => {
            const list = Array.isArray(prev[tripKey][listKey]) ? [...prev[tripKey][listKey]] : [];
            if (list.length >= MAX_POINTS) return prev;
            list.push(emptyPoint(list.length + 1));
            return {
                ...prev,
                [tripKey]: { ...prev[tripKey], [listKey]: list },
            };
        });
    }

    function updatePoint(tripKey, listKey, pointId, patch) {
        setForm((prev) => {
            const list = Array.isArray(prev[tripKey][listKey])
                ? prev[tripKey][listKey].map((p) => (p.id === pointId ? { ...p, ...patch } : p))
                : [];
            const withOrder = list.map((p, idx) => ({ ...p, order: idx + 1 }));
            return {
                ...prev,
                [tripKey]: { ...prev[tripKey], [listKey]: withOrder },
            };
        });
    }

    function removePoint(tripKey, listKey, pointId) {
        setForm((prev) => {
            const list = Array.isArray(prev[tripKey][listKey])
                ? prev[tripKey][listKey].filter((p) => p.id !== pointId)
                : [];
            const withOrder = list.map((p, idx) => ({ ...p, order: idx + 1 }));
            return {
                ...prev,
                [tripKey]: { ...prev[tripKey], [listKey]: withOrder },
            };
        });
    }

    function handlePointNameChange(tripKey, listKey, pointId, rawValue) {
        const normalized = normalizeStopName(String(rawValue || ""));
        const marathi = getStopNameMarathi(String(rawValue || ""));
        updatePoint(tripKey, listKey, pointId, {
            name: rawValue,
            nameNormalized: normalized,
            marathi,
        });
    }

    function addCabin() {
        setForm((prev) => {
            const cabins = normalizeCabins(prev.cabins);
            if (cabins.length >= MAX_CABINS) return prev;
            return {
                ...prev,
                cabins: [...cabins, { id: uid("cb_"), label: getNextCabinLabel(cabins) }],
            };
        });
    }

    function updateCabin(cabinId, label) {
        setForm((prev) => ({
            ...prev,
            cabins: (prev.cabins || []).map((c) =>
                c.id === cabinId ? { ...c, label } : c
            ),
        }));
    }

    function removeCabin(cabinId) {
        setForm((prev) => ({
            ...prev,
            cabins: (prev.cabins || []).filter((c) => c.id !== cabinId),
        }));
    }

    function resetCabins() {
        setForm((prev) => ({ ...prev, cabins: [] }));
    }

    function addTable() {
        setForm((prev) => {
            const tables = normalizeTables(prev.tables);
            if (tables.length >= MAX_TABLES) return prev;
            return {
                ...prev,
                tables: [...tables, { id: uid("tb_"), label: getNextTableLabel(tables) }],
            };
        });
    }

    function updateTable(tableId, label) {
        setForm((prev) => ({
            ...prev,
            tables: (prev.tables || []).map((t) =>
                t.id === tableId ? { ...t, label } : t
            ),
        }));
    }

    function removeTable(tableId) {
        setForm((prev) => ({
            ...prev,
            tables: (prev.tables || []).filter((t) => t.id !== tableId),
        }));
    }

    function addFareRule() {
        setForm((prev) => ({
            ...prev,
            fareRules: [...(prev.fareRules || []), emptyFareRule()],
        }));
    }

    function updateFareRule(ruleId, patch) {
        setForm((prev) => ({
            ...prev,
            fareRules: (prev.fareRules || []).map((r) =>
                r.id === ruleId ? { ...r, ...patch } : r
            ),
        }));
    }

    function removeFareRule(ruleId) {
        setForm((prev) => ({
            ...prev,
            fareRules: (prev.fareRules || []).filter((r) => r.id !== ruleId),
        }));
    }

    useEffect(() => {
        if (!form.autoGenerateReturn) return;

        setForm((prev) => {
            const retFrom = prev.forwardTrip.to || prev.returnTrip.from || "";
            const retTo = prev.forwardTrip.from || prev.returnTrip.to || "";

            const newReturnPickup = reversePointsForReturn(prev.forwardTrip.dropPoints || []);
            const newReturnDrop = reversePointsForReturn(prev.forwardTrip.pickupPoints || []);

            return {
                ...prev,
                returnTrip: {
                    ...prev.returnTrip,
                    from: retFrom,
                    to: retTo,
                    pickupPoints: newReturnPickup,
                    dropPoints: newReturnDrop,
                    departureTime: prev.returnTrip.departureTime,
                    arrivalTime: prev.returnTrip.arrivalTime,
                },
            };
        });
    }, [
        form.autoGenerateReturn,
        form.forwardTrip.pickupPoints,
        form.forwardTrip.dropPoints,
        form.forwardTrip.from,
        form.forwardTrip.to,
    ]);

    useEffect(() => {
        if (form.tripType === TRIP_TYPES.ONE_WAY) {
            setForm((prev) => ({
                ...prev,
                returnTrip: { ...getInitialState().returnTrip },
                autoGenerateReturn: false,
            }));
        }
    }, [form.tripType]);

    const pickupOptions = useMemo(() => {
        const forward = (form.forwardTrip?.pickupPoints || []).map((p) => ({
            id: p.id,
            label: p.name || p.nameNormalized || "(unnamed)",
            marathi: p.marathi || getStopNameMarathi(p.name),
        }));
        const forwardDrops = (form.forwardTrip?.dropPoints || []).map((p) => ({
            id: p.id,
            label: p.name || p.nameNormalized || "(unnamed)",
            marathi: p.marathi || getStopNameMarathi(p.name),
        }));
        const retP = (form.returnTrip?.pickupPoints || []).map((p) => ({
            id: p.id,
            label: p.name || p.nameNormalized || "(unnamed)",
            marathi: p.marathi || getStopNameMarathi(p.name),
        }));
        const retD = (form.returnTrip?.dropPoints || []).map((p) => ({
            id: p.id,
            label: p.name || p.nameNormalized || "(unnamed)",
            marathi: p.marathi || getStopNameMarathi(p.name),
        }));

        return {
            FORWARD: { pickups: forward, drops: forwardDrops },
            RETURN: { pickups: retP, drops: retD },
        };
    }, [form.forwardTrip, form.returnTrip]);

    function validate() {
        if (!form.busNumber?.trim()) return "Bus number is required";
        if (!form.busName?.trim()) return "Bus name is required";
        if (!form.routeName?.trim()) return "Route name is required";
        if (!form.forwardTrip.from?.trim()) return "Forward trip start is required";
        if (!form.forwardTrip.to?.trim()) return "Forward trip end is required";
        if (!form.forwardTrip.departureTime?.trim()) return "Forward departure time is required";
        if (!form.forwardTrip.arrivalTime?.trim()) return "Forward arrival time is required";

        if (form.tripType === TRIP_TYPES.RETURN) {
            if (!form.returnTrip.from?.trim()) return "Return trip start is required";
            if (!form.returnTrip.to?.trim()) return "Return trip end is required";
            if (!form.returnTrip.departureTime?.trim()) return "Return departure time is required";
            if (!form.returnTrip.arrivalTime?.trim()) return "Return arrival time is required";
        }

        return null;
    }

    async function handleSubmit(e) {
        e?.preventDefault?.();
        const err = validate();
        if (err) {
            showAppToast("error", err);
            return;
        }

        try {
            setSaving(true);

            const normalizePointsForSend = (arr = []) =>
                (Array.isArray(arr) ? arr : [])
                    .slice(0, MAX_POINTS)
                    .map((p, idx) => ({
                        id: p.id,
                        name: String(p.name || "").trim(),
                        marathi: p.marathi || getStopNameMarathi(p.name || ""),
                        time: String(p.time || ""),
                        order: Number(p.order) || idx + 1,
                        isActive: p.isActive ?? true,
                    }));

            const payload = {
                busNumber: form.busNumber,
                busName: form.busName,
                busType: form.busType,
                seatLayout: Number(form.seatLayout || 32),
                tripType: form.tripType,
                status: form.status,
                routeName: form.routeName,
                forwardTrip: {
                    from: form.forwardTrip.from,
                    to: form.forwardTrip.to,
                    departureTime: form.forwardTrip.departureTime,
                    arrivalTime: form.forwardTrip.arrivalTime,
                    pickupPoints: normalizePointsForSend(form.forwardTrip.pickupPoints),
                    dropPoints: normalizePointsForSend(form.forwardTrip.dropPoints),
                },
                returnTrip:
                    form.tripType === TRIP_TYPES.RETURN
                        ? {
                            from: form.returnTrip.from,
                            to: form.returnTrip.to,
                            departureTime: form.returnTrip.departureTime,
                            arrivalTime: form.returnTrip.arrivalTime,
                            pickupPoints: normalizePointsForSend(form.returnTrip.pickupPoints),
                            dropPoints: normalizePointsForSend(form.returnTrip.dropPoints),
                        }
                        : null,
                autoGenerateReturn: !!form.autoGenerateReturn,
                cabins: (form.cabins || [])
                    .map((c) => ({ id: c.id, label: String(c.label || "").trim() }))
                    .slice(0, MAX_CABINS),
                tables: (form.tables || [])
                    .map((t) => ({ id: t.id, label: String(t.label || "").trim() }))
                    .slice(0, MAX_TABLES),
                fareRules: (form.fareRules || []).map((r) => ({
                    ...r,
                    pickupId: r.pickupId,
                    dropId: r.dropId,
                })),
            };

            const endpoint = editMode ? `/api/admin/buses/${initialData._id}` : `/api/admin/buses`;
            const method = editMode ? "PUT" : "POST";

            const token = (() => {
                try {
                    return localStorage.getItem("accessToken") || "";
                } catch {
                    return "";
                }
            })();

            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                showAppToast("error", data?.message || "Failed to save bus");
                return;
            }

            onSaved?.(data?.item || data?.data || payload);
            showAppToast("success", editMode ? "Bus updated successfully" : "Bus created successfully");
            onClose?.();
        } catch (err) {
            console.error(err);
            showAppToast("error", "Failed to save bus");
        } finally {
            setSaving(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]">
            <div className="flex h-full w-full items-center justify-center p-2 sm:p-4">
                <div className="relative flex h-[96vh] w-full max-w-[1700px] flex-col overflow-hidden rounded-[32px] bg-[#F8FAFC] shadow-[0_30px_100px_rgba(2,8,23,0.25)]">
                    {/* Header */}
                    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#0B5D5A]/10 text-[#0B5D5A]">
                                    <Bus className="h-7 w-7" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                        {editMode ? "Edit Premium Bus" : "Create Premium Bus"}
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Morya Travels premium bus setup • route • cabins • tables • fare rules
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                                    {form.seatLayout} Seats
                                </span>
                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                                    {form.tripType}
                                </span>
                                <button
                                    onClick={onClose}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    <X className="h-4 w-4" />
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 overflow-hidden">
                        <form
                            onSubmit={handleSubmit}
                            className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 lg:px-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
                        >
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
                                {/* Left Content */}
                                <div className="space-y-6">
                                    {/* 1. Bus Details */}
                                    <SectionCard
                                        icon={Bus}
                                        title="Bus Details"
                                        subtitle="Basic premium bus information"
                                    >
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                            <div>
                                                <Label required>Bus Number</Label>
                                                <Input
                                                    value={form.busNumber}
                                                    onChange={(e) =>
                                                        updateField("busNumber", e.target.value.toUpperCase())
                                                    }
                                                    placeholder="MH12AB1234"
                                                />
                                            </div>

                                            <div>
                                                <Label required>Bus Name</Label>
                                                <Input
                                                    value={form.busName}
                                                    onChange={(e) => updateField("busName", e.target.value)}
                                                    placeholder="Morya Premium Coach"
                                                />
                                            </div>

                                            <div>
                                                <Label>Bus Type</Label>
                                                <Select
                                                    value={form.busType}
                                                    onChange={(e) => updateField("busType", e.target.value)}
                                                >
                                                    <option value={BUS_TYPES.NON_AC}>NON_AC</option>
                                                    <option value={BUS_TYPES.AC}>AC</option>
                                                    <option value={BUS_TYPES.SEMI_SLEEPER}>SEMI_SLEEPER</option>
                                                    <option value={BUS_TYPES.SLEEPER}>SLEEPER</option>
                                                    <option value={BUS_TYPES.SEATER}>SEATER</option>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label>Seat Layout</Label>
                                                <Select
                                                    value={form.seatLayout}
                                                    onChange={(e) => updateField("seatLayout", Number(e.target.value))}
                                                >
                                                    <option value={21}>21 Seater</option>
                                                    <option value={32}>32 Seater</option>
                                                    <option value={35}>35 Seater</option>
                                                    <option value={39}>39 Seater</option>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label>Trip Type</Label>
                                                <Select
                                                    value={form.tripType}
                                                    onChange={(e) => updateField("tripType", e.target.value)}
                                                >
                                                    <option value={TRIP_TYPES.ONE_WAY}>ONE_WAY</option>
                                                    <option value={TRIP_TYPES.RETURN}>RETURN</option>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label>Status</Label>
                                                <Select
                                                    value={form.status}
                                                    onChange={(e) => updateField("status", e.target.value)}
                                                >
                                                    <option value={STATUS.ACTIVE}>ACTIVE</option>
                                                    <option value={STATUS.INACTIVE}>INACTIVE</option>
                                                </Select>
                                            </div>
                                        </div>
                                    </SectionCard>

                                    {/* 2. Route Forward */}
                                    <SectionCard
                                        icon={Route}
                                        title="Route Forward"
                                        subtitle="Main route and forward trip schedule"
                                    >
                                        <div className="space-y-5">
                                            {/* Row 1 - Route Name */}
                                            <div className="grid grid-cols-1">
                                                <div>
                                                    <Label required>Route Name</Label>
                                                    <Input
                                                        value={form.routeName}
                                                        onChange={(e) => updateField("routeName", e.target.value)}
                                                        placeholder="Shrivardhan - Borli - Borivali - Virar"
                                                    />
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        Full route display name shown in listings and fare setup
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Row 2 - Start Point + Departure */}
                                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                <div>
                                                    <Label required>Start Point</Label>
                                                    <Input
                                                        value={form.forwardTrip.from}
                                                        onChange={(e) =>
                                                            setForm((p) => ({
                                                                ...p,
                                                                forwardTrip: { ...p.forwardTrip, from: e.target.value },
                                                            }))
                                                        }
                                                        placeholder="Shrivardhan Bus Depot"
                                                    />
                                                    <p className="mt-2 text-xs font-medium text-[#0B5D5A]">
                                                        {getStopNameMarathi(form.forwardTrip.from || "") || "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <Label required>Departure Time</Label>
                                                    <Input
                                                        type="time"
                                                        value={form.forwardTrip.departureTime}
                                                        onChange={(e) =>
                                                            setForm((p) => ({
                                                                ...p,
                                                                forwardTrip: {
                                                                    ...p.forwardTrip,
                                                                    departureTime: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        Bus departure from the start point
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Row 3 - End Point + Arrival */}
                                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                <div>
                                                    <Label required>End Point</Label>
                                                    <Input
                                                        value={form.forwardTrip.to}
                                                        onChange={(e) =>
                                                            setForm((p) => ({
                                                                ...p,
                                                                forwardTrip: { ...p.forwardTrip, to: e.target.value },
                                                            }))
                                                        }
                                                        placeholder="Borivali Depot"
                                                    />
                                                    <p className="mt-2 text-xs font-medium text-[#0B5D5A]">
                                                        {getStopNameMarathi(form.forwardTrip.to || "") || "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <Label required>Arrival Time</Label>
                                                    <Input
                                                        type="time"
                                                        value={form.forwardTrip.arrivalTime}
                                                        onChange={(e) =>
                                                            setForm((p) => ({
                                                                ...p,
                                                                forwardTrip: {
                                                                    ...p.forwardTrip,
                                                                    arrivalTime: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        Expected arrival at the end point
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </SectionCard>

                                    {/* 3. Pickup Points */}
                                    <SectionCard
                                        icon={MapPin}
                                        title={`Pickup Points (${(form.forwardTrip?.pickupPoints || []).length}/${MAX_POINTS})`}
                                        subtitle="Add all forward pickup stops"
                                        right={
                                            <button
                                                type="button"
                                                onClick={() => addPointToList("forwardTrip", "pickupPoints")}
                                                className="inline-flex items-center gap-2 rounded-full border border-[#0B5D5A]/10 bg-[#0B5D5A]/5 px-4 py-2 text-xs font-bold text-[#0B5D5A] hover:bg-[#0B5D5A]/10"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Pickup
                                            </button>
                                        }
                                    >
                                        {(form.forwardTrip?.pickupPoints || []).length === 0 ? (
                                            <EmptyState text="No pickup points added" />
                                        ) : (
                                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                                {(form.forwardTrip.pickupPoints || []).map((pt, index) => (
                                                    <div
                                                        key={pt.id}
                                                        className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm"
                                                    >
                                                        <div className="mb-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Chip>Pickup #{index + 1}</Chip>
                                                                <Chip className="border-slate-200 bg-slate-50 text-slate-700">
                                                                    Order {pt.order}
                                                                </Chip>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removePoint("forwardTrip", "pickupPoints", pt.id)
                                                                }
                                                                className="rounded-2xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3">
                                                            <div>
                                                                <Label required>Pickup Stop Name</Label>
                                                                <Input
                                                                    value={pt.name}
                                                                    onChange={(e) =>
                                                                        handlePointNameChange(
                                                                            "forwardTrip",
                                                                            "pickupPoints",
                                                                            pt.id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="English Stop Name"
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label>Marathi Name</Label>
                                                                <Input
                                                                    value={pt.marathi}
                                                                    readOnly
                                                                    placeholder="Marathi (auto)"
                                                                    className="border-[#0B5D5A]/10 bg-[#0B5D5A]/5 text-[#0B5D5A]"
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label required>Pickup Time</Label>
                                                                <Input
                                                                    type="time"
                                                                    value={pt.time}
                                                                    onChange={(e) =>
                                                                        updatePoint("forwardTrip", "pickupPoints", pt.id, {
                                                                            time: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </SectionCard>

                                    {/* 4. Drop Points */}
                                    <SectionCard
                                        icon={ArrowRightLeft}
                                        title={`Drop Points (${(form.forwardTrip?.dropPoints || []).length}/${MAX_POINTS})`}
                                        subtitle="Add all forward drop stops"
                                        right={
                                            <button
                                                type="button"
                                                onClick={() => addPointToList("forwardTrip", "dropPoints")}
                                                className="inline-flex items-center gap-2 rounded-full border border-[#0B5D5A]/10 bg-[#0B5D5A]/5 px-4 py-2 text-xs font-bold text-[#0B5D5A] hover:bg-[#0B5D5A]/10"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Drop
                                            </button>
                                        }
                                    >
                                        {(form.forwardTrip?.dropPoints || []).length === 0 ? (
                                            <EmptyState text="No drop points added" />
                                        ) : (
                                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                                {(form.forwardTrip.dropPoints || []).map((pt, index) => (
                                                    <div
                                                        key={pt.id}
                                                        className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm"
                                                    >
                                                        <div className="mb-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Chip>Drop #{index + 1}</Chip>
                                                                <Chip className="border-slate-200 bg-slate-50 text-slate-700">
                                                                    Order {pt.order}
                                                                </Chip>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removePoint("forwardTrip", "dropPoints", pt.id)
                                                                }
                                                                className="rounded-2xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3">
                                                            <div>
                                                                <Label required>Drop Stop Name</Label>
                                                                <Input
                                                                    value={pt.name}
                                                                    onChange={(e) =>
                                                                        handlePointNameChange(
                                                                            "forwardTrip",
                                                                            "dropPoints",
                                                                            pt.id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="English Stop Name"
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label>Marathi Name</Label>
                                                                <Input
                                                                    value={pt.marathi}
                                                                    readOnly
                                                                    placeholder="Marathi (auto)"
                                                                    className="border-[#0B5D5A]/10 bg-[#0B5D5A]/5 text-[#0B5D5A]"
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label required>Drop Time</Label>
                                                                <Input
                                                                    type="time"
                                                                    value={pt.time}
                                                                    onChange={(e) =>
                                                                        updatePoint("forwardTrip", "dropPoints", pt.id, {
                                                                            time: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </SectionCard>

                                    {/* Return Trip */}
                                    {form.tripType === TRIP_TYPES.RETURN && (
                                        <SectionCard
                                            icon={RefreshCw}
                                            title="Return Trip"
                                            subtitle="Return route schedule and reverse stop details"
                                            right={
                                                <Toggle
                                                    checked={!!form.autoGenerateReturn}
                                                    onChange={(e) => updateField("autoGenerateReturn", e.target.checked)}
                                                    label="Auto-generate Return"
                                                />
                                            }
                                        >
                                            <div className="space-y-5">
                                                {/* Row 1 */}
                                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                    <div>
                                                        <Label required>Return Start Point</Label>
                                                        <Input
                                                            value={form.returnTrip.from}
                                                            onChange={(e) =>
                                                                updateTripField("returnTrip", "from", e.target.value)
                                                            }
                                                            disabled={form.autoGenerateReturn}
                                                            className={clsx(
                                                                form.autoGenerateReturn && "bg-slate-100 text-slate-500"
                                                            )}
                                                            placeholder="Borivali Depot"
                                                        />
                                                        <p className="mt-2 text-xs font-medium text-[#0B5D5A]">
                                                            {getStopNameMarathi(form.returnTrip.from || "") || "-"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Label required>Departure Time</Label>
                                                        <Input
                                                            type="time"
                                                            value={form.returnTrip.departureTime}
                                                            onChange={(e) =>
                                                                updateTripField("returnTrip", "departureTime", e.target.value)
                                                            }
                                                        />
                                                        <p className="mt-2 text-xs text-slate-500">
                                                            Bus departure from the return start point
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Row 2 */}
                                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                    <div>
                                                        <Label required>Return End Point</Label>
                                                        <Input
                                                            value={form.returnTrip.to}
                                                            onChange={(e) =>
                                                                updateTripField("returnTrip", "to", e.target.value)
                                                            }
                                                            disabled={form.autoGenerateReturn}
                                                            className={clsx(
                                                                form.autoGenerateReturn && "bg-slate-100 text-slate-500"
                                                            )}
                                                            placeholder="Shrivardhan Bus Depot"
                                                        />
                                                        <p className="mt-2 text-xs font-medium text-[#0B5D5A]">
                                                            {getStopNameMarathi(form.returnTrip.to || "") || "-"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Label required>Arrival Time</Label>
                                                        <Input
                                                            type="time"
                                                            value={form.returnTrip.arrivalTime}
                                                            onChange={(e) =>
                                                                updateTripField("returnTrip", "arrivalTime", e.target.value)
                                                            }
                                                        />
                                                        <p className="mt-2 text-xs text-slate-500">
                                                            Expected arrival at the return end point
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </SectionCard>
                                    )}

                                    {/* 5. Cabins */}
                                    <SectionCard
                                        icon={Armchair}
                                        title={`Cabins (${(form.cabins || []).length}/${MAX_CABINS})`}
                                        subtitle="Auto labels C1, C2, C3..."
                                        right={
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={resetCabins}
                                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                    Reset
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={addCabin}
                                                    disabled={(form.cabins || []).length >= MAX_CABINS}
                                                    className="inline-flex items-center gap-2 rounded-full bg-[#0B5D5A] px-4 py-2 text-xs font-bold text-white hover:bg-[#094B49] disabled:opacity-50"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Add Cabin
                                                </button>
                                            </div>
                                        }
                                    >
                                        {(form.cabins || []).length === 0 ? (
                                            <EmptyState text="No cabins added" />
                                        ) : (
                                            <>
                                                <div className="mb-4 flex flex-wrap gap-2">
                                                    {(form.cabins || []).map((c) => (
                                                        <Chip key={c.id}>{c.label}</Chip>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                    {(form.cabins || []).map((c, index) => (
                                                        <div
                                                            key={c.id}
                                                            className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"
                                                        >
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B5D5A]/10 text-sm font-bold text-[#0B5D5A]">
                                                                {index + 1}
                                                            </div>
                                                            <Input
                                                                value={c.label}
                                                                onChange={(e) => updateCabin(c.id, e.target.value)}
                                                                placeholder={`C${index + 1}`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCabin(c.id)}
                                                                className="rounded-2xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </SectionCard>

                                    {/* 6. Tables */}
                                    <SectionCard
                                        icon={Table2}
                                        title={`Tables (${(form.tables || []).length}/${MAX_TABLES})`}
                                        subtitle="Auto labels T1, T2, T3..."
                                        right={
                                            <button
                                                type="button"
                                                onClick={addTable}
                                                disabled={(form.tables || []).length >= MAX_TABLES}
                                                className="inline-flex items-center gap-2 rounded-full bg-[#0B5D5A] px-4 py-2 text-xs font-bold text-white hover:bg-[#094B49] disabled:opacity-50"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Table
                                            </button>
                                        }
                                    >
                                        {(form.tables || []).length === 0 ? (
                                            <EmptyState text="No tables added" />
                                        ) : (
                                            <>
                                                <div className="mb-4 flex flex-wrap gap-2">
                                                    {(form.tables || []).map((t) => (
                                                        <Chip key={t.id}>{t.label}</Chip>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                    {(form.tables || []).map((t, index) => (
                                                        <div
                                                            key={t.id}
                                                            className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"
                                                        >
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B5D5A]/10 text-sm font-bold text-[#0B5D5A]">
                                                                {index + 1}
                                                            </div>
                                                            <Input
                                                                value={t.label}
                                                                onChange={(e) => updateTable(t.id, e.target.value)}
                                                                placeholder={`T${index + 1}`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTable(t.id)}
                                                                className="rounded-2xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </SectionCard>

                                    {/* 7. Fare Rules */}
                                    <SectionCard
                                        icon={IndianRupee}
                                        title={`Pickup → Drop Fare Rules (${(form.fareRules || []).length})`}
                                        subtitle="Premium fare rule configuration with better visualization"
                                        right={
                                            <button
                                                type="button"
                                                onClick={addFareRule}
                                                className="inline-flex items-center gap-2 rounded-full border border-[#0B5D5A]/10 bg-[#0B5D5A]/5 px-4 py-2 text-xs font-bold text-[#0B5D5A] hover:bg-[#0B5D5A]/10"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Fare Rule
                                            </button>
                                        }
                                    >
                                        {(form.fareRules || []).length === 0 ? (
                                            <EmptyState text="No fare rules configured" />
                                        ) : (
                                            <div className="space-y-5">
                                                {(form.fareRules || []).map((fr, index) => {
                                                    const dir = fr.tripDirection || "FORWARD";
                                                    const pickups = pickupOptions[dir]?.pickups || [];
                                                    const drops = pickupOptions[dir]?.drops || [];

                                                    const selectedPickup = pickups.find((p) => p.id === fr.pickupId);
                                                    const selectedDrop = drops.find((p) => p.id === fr.dropId);

                                                    return (
                                                        <div
                                                            key={fr.id}
                                                            className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                                                        >
                                                            <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="inline-flex items-center rounded-full bg-[#0B5D5A] px-3 py-1 text-xs font-bold text-white">
                                                                        {fr.tripDirection}
                                                                    </span>
                                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                                                        Rule #{index + 1}
                                                                    </span>
                                                                    <span className="inline-flex items-center rounded-full border border-[#0B5D5A]/10 bg-[#0B5D5A]/5 px-3 py-1 text-xs font-bold text-[#0B5D5A]">
                                                                        ₹ {Number(fr.fare || 0)}
                                                                    </span>
                                                                    {fr.isActive ? (
                                                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                                            Active
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                                                                            Inactive
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFareRule(fr.id)}
                                                                    className="inline-flex items-center justify-center rounded-2xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-5 p-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                                                                {/* Left */}
                                                                <div className="space-y-4">
                                                                    {/* Row 1 */}
                                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                        <div>
                                                                            <Label>Trip Direction</Label>
                                                                            <Select
                                                                                value={fr.tripDirection}
                                                                                onChange={(e) =>
                                                                                    updateFareRule(fr.id, {
                                                                                        tripDirection: e.target.value,
                                                                                        pickupId: null,
                                                                                        dropId: null,
                                                                                    })
                                                                                }
                                                                            >
                                                                                <option value="FORWARD">FORWARD</option>
                                                                                {form.tripType === TRIP_TYPES.RETURN && (
                                                                                    <option value="RETURN">RETURN</option>
                                                                                )}
                                                                            </Select>
                                                                        </div>

                                                                        <div>
                                                                            <Label>Select Pickup</Label>
                                                                            <Select
                                                                                value={fr.pickupId || ""}
                                                                                onChange={(e) =>
                                                                                    updateFareRule(fr.id, {
                                                                                        pickupId: e.target.value || null,
                                                                                    })
                                                                                }
                                                                            >
                                                                                <option value="">Select Pickup</option>
                                                                                {pickups.map((p) => (
                                                                                    <option key={p.id} value={p.id}>
                                                                                        {p.label || "(unnamed)"}
                                                                                    </option>
                                                                                ))}
                                                                            </Select>
                                                                        </div>
                                                                    </div>

                                                                    {/* Row 2 */}
                                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                        <div>
                                                                            <Label>Select Drop</Label>
                                                                            <Select
                                                                                value={fr.dropId || ""}
                                                                                onChange={(e) =>
                                                                                    updateFareRule(fr.id, {
                                                                                        dropId: e.target.value || null,
                                                                                    })
                                                                                }
                                                                            >
                                                                                <option value="">Select Drop</option>
                                                                                {drops.map((p) => (
                                                                                    <option key={p.id} value={p.id}>
                                                                                        {p.label || "(unnamed)"}
                                                                                    </option>
                                                                                ))}
                                                                            </Select>
                                                                        </div>

                                                                        <div>
                                                                            <Label>Fare (₹)</Label>
                                                                            <Input
                                                                                type="number"
                                                                                value={Number(fr.fare || 0)}
                                                                                onChange={(e) =>
                                                                                    updateFareRule(fr.id, {
                                                                                        fare: Number(e.target.value || 0),
                                                                                    })
                                                                                }
                                                                                placeholder="0"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Row 3 */}
                                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                        <div>
                                                                            <Label>Start Date</Label>
                                                                            <Input
                                                                                type="date"
                                                                                value={fr.startDate || ""}
                                                                                onChange={(e) =>
                                                                                    updateFareRule(fr.id, {
                                                                                        startDate: e.target.value,
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <Label>End Date</Label>
                                                                            <Input
                                                                                type="date"
                                                                                value={fr.endDate || ""}
                                                                                onChange={(e) =>
                                                                                    updateFareRule(fr.id, {
                                                                                        endDate: e.target.value,
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Toggles */}
                                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                                        <Toggle
                                                                            checked={fr.applyToNextPickups || false}
                                                                            onChange={(e) =>
                                                                                updateFareRule(fr.id, {
                                                                                    applyToNextPickups: e.target.checked,
                                                                                })
                                                                            }
                                                                            label="Apply to next pickups"
                                                                        />

                                                                        <Toggle
                                                                            checked={fr.applyToPreviousDrops || false}
                                                                            onChange={(e) =>
                                                                                updateFareRule(fr.id, {
                                                                                    applyToPreviousDrops: e.target.checked,
                                                                                })
                                                                            }
                                                                            label="Apply to previous drops"
                                                                        />

                                                                        <Toggle
                                                                            checked={fr.isActive || false}
                                                                            onChange={(e) =>
                                                                                updateFareRule(fr.id, {
                                                                                    isActive: e.target.checked,
                                                                                })
                                                                            }
                                                                            label="Active"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Right Visual */}
                                                                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                                                                    <div className="mb-4 flex items-center justify-between gap-3">
                                                                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0B5D5A]">
                                                                            <CalendarDays className="h-4 w-4" />
                                                                            Fare Visualization
                                                                        </div>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setPreviewFareRule({
                                                                                    rule: fr,
                                                                                    selectedPickup,
                                                                                    selectedDrop,
                                                                                    index,
                                                                                })
                                                                            }
                                                                            className="inline-flex items-center gap-2 rounded-full border border-[#0B5D5A]/10 bg-white px-3 py-2 text-xs font-bold text-[#0B5D5A] hover:bg-[#0B5D5A]/5"
                                                                        >
                                                                            Open Preview
                                                                        </button>
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        <div className="rounded-2xl border border-white bg-white p-3">
                                                                            <p className="text-xs font-medium text-slate-500">English Route</p>
                                                                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                                                                {selectedPickup?.label || "Select Pickup"} →{" "}
                                                                                {selectedDrop?.label || "Select Drop"}
                                                                            </p>
                                                                        </div>

                                                                        <div className="rounded-2xl border border-white bg-white p-3">
                                                                            <p className="text-xs font-medium text-slate-500">Fare Amount</p>
                                                                            <p className="mt-1 text-lg font-bold text-[#0B5D5A]">
                                                                                ₹ {Number(fr.fare || 0)}
                                                                            </p>
                                                                        </div>

                                                                        <div className="rounded-2xl bg-[#0B5D5A] p-4 text-white">
                                                                            <p className="text-xs text-white/80">Quick Summary</p>
                                                                            <p className="mt-1 text-sm font-semibold">
                                                                                {fr.tripDirection} • {selectedPickup?.label || "Pickup"} →{" "}
                                                                                {selectedDrop?.label || "Drop"}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </SectionCard>
                                </div>

                                {/* Right Sidebar */}
                                <aside className="hidden xl:block">
                                    <div className="sticky top-4 space-y-5">
                                        {/* Seat Preview */}
                                        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                                            <div className="border-b border-slate-100 px-5 py-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h5 className="text-base font-semibold text-slate-900">
                                                            Seat Preview
                                                        </h5>
                                                        <p className="text-xs text-slate-500">
                                                            Live layout visualization
                                                        </p>
                                                    </div>
                                                    <Chip>{form.seatLayout} Seats</Chip>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-600">Cabins</span>
                                                    <span className="text-sm font-bold text-[#0B5D5A]">
                                                        {(form.cabins || []).length}/{MAX_CABINS}
                                                    </span>
                                                </div>

                                                <div className="mb-4 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={resetCabins}
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                        Reset
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={addCabin}
                                                        disabled={(form.cabins || []).length >= MAX_CABINS}
                                                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0B5D5A] px-3 py-2 text-xs font-bold text-white hover:bg-[#094B49] disabled:opacity-50"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Cabin
                                                    </button>
                                                </div>

                                                <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-3">
                                                    <SeatLayout
                                                        layout={Number(form.seatLayout)}
                                                        cabins={(form.cabins || []).map((c) => ({ label: c.label }))}
                                                        tables={(form.tables || []).map((t) => ({ label: t.label }))}
                                                        compact
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Summary */}
                                        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                                            <div className="border-b border-slate-100 px-5 py-4">
                                                <h5 className="text-base font-semibold text-slate-900">Quick Summary</h5>
                                                <p className="text-xs text-slate-500">Live premium overview</p>
                                            </div>

                                            <div className="space-y-3 p-4 text-sm">
                                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                                                    <span className="text-slate-500">Bus Number</span>
                                                    <span className="font-semibold text-slate-800">
                                                        {form.busNumber || "-"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                                                    <span className="text-slate-500">Bus Name</span>
                                                    <span className="font-semibold text-slate-800">
                                                        {form.busName || "-"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                                                    <span className="text-slate-500">Route</span>
                                                    <span className="max-w-[180px] truncate font-semibold text-slate-800">
                                                        {form.routeName ||
                                                            `${form.forwardTrip.from} → ${form.forwardTrip.to}` ||
                                                            "-"}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="rounded-3xl bg-slate-50 p-3 text-center">
                                                        <p className="text-xs text-slate-500">Pickups</p>
                                                        <p className="mt-1 text-xl font-bold text-[#0B5D5A]">
                                                            {(form.forwardTrip?.pickupPoints || []).length}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-3xl bg-slate-50 p-3 text-center">
                                                        <p className="text-xs text-slate-500">Drops</p>
                                                        <p className="mt-1 text-xl font-bold text-[#0B5D5A]">
                                                            {(form.forwardTrip?.dropPoints || []).length}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="rounded-3xl bg-slate-50 p-3 text-center">
                                                        <p className="text-xs text-slate-500">Cabins</p>
                                                        <p className="mt-1 text-xl font-bold text-[#0B5D5A]">
                                                            {(form.cabins || []).length}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-3xl bg-slate-50 p-3 text-center">
                                                        <p className="text-xs text-slate-500">Tables</p>
                                                        <p className="mt-1 text-xl font-bold text-[#0B5D5A]">
                                                            {(form.tables || []).length}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="rounded-3xl bg-[#0B5D5A] p-4 text-white">
                                                    <p className="text-xs text-white/80">Fare Rules</p>
                                                    <p className="mt-1 text-2xl font-bold">
                                                        {(form.fareRules || []).length}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cabins & Tables */}
                                        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                                            <div className="border-b border-slate-100 px-5 py-4">
                                                <h5 className="text-base font-semibold text-slate-900">
                                                    Cabins & Tables
                                                </h5>
                                                <p className="text-xs text-slate-500">Visual labels preview</p>
                                            </div>

                                            <div className="space-y-4 p-4">
                                                <div>
                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Cabins
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(form.cabins || []).length ? (
                                                            (form.cabins || []).map((c) => <Chip key={c.id}>{c.label}</Chip>)
                                                        ) : (
                                                            <p className="text-sm text-slate-400">No cabins</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Tables
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(form.tables || []).length ? (
                                                            (form.tables || []).map((t) => <Chip key={t.id}>{t.label}</Chip>)
                                                        ) : (
                                                            <p className="text-sm text-slate-400">No tables</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const busId = editMode ? initialData._id : "";
                                    const target = busId
                                        ? `/admin/bus/fares?busId=${busId}`
                                        : "/admin/bus/fares";
                                    router.push(target);
                                }}
                                className="rounded-2xl border border-[#0B5D5A]/10 bg-[#0B5D5A]/5 px-5 py-3 text-sm font-semibold text-[#0B5D5A] hover:bg-[#0B5D5A]/10"
                            >
                                View Fares
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving}
                                className={clsx(
                                    "inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B5D5A] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#0B5D5A]/15 transition hover:bg-[#094B49]",
                                    saving && "opacity-60"
                                )}
                            >
                                <Save className="h-4 w-4" />
                                {saving
                                    ? editMode
                                        ? "Updating..."
                                        : "Saving..."
                                    : editMode
                                        ? "Update Bus"
                                        : "Create Bus"}
                            </button>
                        </div>
                    </div>

                    {/* Fare Preview Modal */}
                    {previewFareRule && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
                            <div className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(2,8,23,0.25)]">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B5D5A]/10 text-[#0B5D5A]">
                                            <IndianRupee className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                                                Fare Rule Preview
                                            </h3>
                                            <p className="text-xs text-slate-500 sm:text-sm">
                                                Rule #{previewFareRule.index + 1} • {previewFareRule.rule.tripDirection}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setPreviewFareRule(null)}
                                        className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="max-h-[75vh] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                                    <div className="space-y-4">
                                        {/* Route Visualization */}
                                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0B5D5A]">
                                                <CalendarDays className="h-4 w-4" />
                                                Route Visualization
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                <div className="rounded-2xl bg-white p-4">
                                                    <p className="text-xs font-medium text-slate-500">English Route</p>
                                                    <p className="mt-2 text-base font-bold text-slate-900 leading-snug break-words">
                                                        {previewFareRule.selectedPickup?.label || "Select Pickup"} →{" "}
                                                        {previewFareRule.selectedDrop?.label || "Select Drop"}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl bg-white p-4">
                                                    <p className="text-xs font-medium text-slate-500">Trip Direction</p>
                                                    <div className="mt-2">
                                                        <span className="inline-flex items-center rounded-full bg-[#0B5D5A] px-3 py-1 text-xs font-bold text-white">
                                                            {previewFareRule.rule.tripDirection}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl bg-white p-4">
                                                    <p className="text-xs font-medium text-slate-500">Pickup Marathi</p>
                                                    <p className="mt-2 text-sm font-semibold text-[#0B5D5A] break-words">
                                                        {previewFareRule.selectedPickup?.marathi || "-"}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl bg-white p-4">
                                                    <p className="text-xs font-medium text-slate-500">Drop Marathi</p>
                                                    <p className="mt-2 text-sm font-semibold text-[#0B5D5A] break-words">
                                                        {previewFareRule.selectedDrop?.marathi || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fare + Rule Details */}
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                                            {/* Fare Amount */}
                                            <div className="rounded-[24px] bg-[#0B5D5A] p-5 text-white sm:p-6">
                                                <p className="text-sm text-white/80">Fare Amount</p>
                                                <p className="mt-2 text-4xl font-bold leading-none">
                                                    ₹ {Number(previewFareRule.rule.fare || 0)}
                                                </p>
                                                <p className="mt-3 text-sm text-white/90 break-words">
                                                    {previewFareRule.selectedPickup?.label || "Pickup"} →{" "}
                                                    {previewFareRule.selectedDrop?.label || "Drop"}
                                                </p>
                                            </div>

                                            {/* Rule Details */}
                                            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                                <p className="mb-3 text-base font-bold text-slate-800">Rule Details</p>

                                                <div className="space-y-3 text-sm">
                                                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                                                        <span className="text-slate-500">Status</span>
                                                        <span
                                                            className={clsx(
                                                                "font-semibold",
                                                                previewFareRule.rule.isActive ? "text-emerald-600" : "text-slate-500"
                                                            )}
                                                        >
                                                            {previewFareRule.rule.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                                                        <span className="text-slate-500">Start Date</span>
                                                        <span className="font-semibold text-slate-800">
                                                            {previewFareRule.rule.startDate || "-"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                                                        <span className="text-slate-500">End Date</span>
                                                        <span className="font-semibold text-slate-800">
                                                            {previewFareRule.rule.endDate || "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rule Application */}
                                        <div className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5">
                                            <p className="mb-3 text-base font-bold text-slate-800">Rule Application</p>

                                            <div className="flex flex-wrap gap-2">
                                                <span
                                                    className={clsx(
                                                        "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold",
                                                        previewFareRule.rule.applyToNextPickups
                                                            ? "bg-[#0B5D5A]/10 text-[#0B5D5A]"
                                                            : "bg-slate-100 text-slate-500"
                                                    )}
                                                >
                                                    Apply to next pickups:{" "}
                                                    {previewFareRule.rule.applyToNextPickups ? "Yes" : "No"}
                                                </span>

                                                <span
                                                    className={clsx(
                                                        "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold",
                                                        previewFareRule.rule.applyToPreviousDrops
                                                            ? "bg-[#0B5D5A]/10 text-[#0B5D5A]"
                                                            : "bg-slate-100 text-slate-500"
                                                    )}
                                                >
                                                    Apply to previous drops:{" "}
                                                    {previewFareRule.rule.applyToPreviousDrops ? "Yes" : "No"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewFareRule(null)}
                                        className="rounded-2xl bg-[#0B5D5A] px-5 py-3 text-sm font-bold text-white hover:bg-[#094B49]"
                                    >
                                        Close Preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}