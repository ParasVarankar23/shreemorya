"use client";

/* eslint-disable jsx-a11y/label-has-associated-control, no-nested-ternary */

import EditScheduleModal from "@/components/admin/schedule/EditScheduleModal";
import { showAppToast } from "@/lib/toast";
import { CalendarDays, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

/* =========================
   TOKEN HELPERS
========================= */
const getStoredToken = (key) => {
    try {
        return localStorage.getItem(key) || "";
    } catch {
        return "";
    }
};

const setStoredToken = (key, value) => {
    try {
        if (value) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
    } catch { }
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
        if (!res.ok) return null;

        const newAccessToken =
            data?.accessToken ||
            data?.data?.accessToken ||
            data?.token ||
            data?.data?.token ||
            null;

        const newRefreshToken =
            data?.refreshToken ||
            data?.data?.refreshToken ||
            null;

        if (!newAccessToken) return null;

        setStoredToken("accessToken", newAccessToken);
        if (newRefreshToken) setStoredToken("refreshToken", newRefreshToken);

        return newAccessToken;
    } catch (error) {
        console.error("Refresh token failed:", error);
        return null;
    }
}

async function apiFetch(url, options = {}) {
    const doFetch = async (token) => {
        const headers = new Headers(options.headers || {});
        if (token) headers.set("Authorization", `Bearer ${token}`);

        return fetch(url, {
            ...options,
            headers,
        });
    };

    let accessToken = getStoredToken("accessToken");

    if (!accessToken) {
        accessToken = await refreshAccessToken();
    }

    let res = await doFetch(accessToken);

    if (res.status === 401) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
            res = await doFetch(newAccessToken);
        }
    }

    if (res.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        showAppToast("error", "Session expired. Please login again.");
    }

    return res;
}

/* =========================
   UI
========================= */
function Input({ className = "", ...props }) {
    return (
        <input
            {...props}
            className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0B5D5A]/40 focus:ring-2 focus:ring-[#0B5D5A]/10 ${className}`}
        />
    );
}

Input.propTypes = {
    className: PropTypes.string,
};

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

Select.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

function StatusBadge({ status }) {
    const styles = {
        SCHEDULED: "bg-[#0B5D5A]/10 text-[#0B5D5A] border-[#0B5D5A]/20",
        DEPARTED: "bg-blue-50 text-blue-700 border-blue-200",
        COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
        CANCELLED: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-700 border-slate-200"
                }`}
        >
            {status || "SCHEDULED"}
        </span>
    );
}

StatusBadge.propTypes = {
    status: PropTypes.string,
};

/* =========================
   PAGE
========================= */
export default function SchedulePage() {
    const [buses, setBuses] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    // Create form
    const [busId, setBusId] = useState("");
    const [dateMode, setDateMode] = useState("single");
    const [travelDate, setTravelDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Edit modal
    const [editOpen, setEditOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [editForm, setEditForm] = useState({
        travelDate: "",
        startTime: "",
        endTime: "",
        baseFare: "",
        effectiveFare: "",
        status: "SCHEDULED",
    });

    const fetchBuses = async () => {
        try {
            const res = await apiFetch("/api/admin/buses");
            const data = await res.json();

            if (res.ok && data.success) {
                const allBuses = data.items || data.data || [];
                const activeBuses = allBuses.filter(
                    (bus) => String(bus?.status || "ACTIVE").toUpperCase() === "ACTIVE"
                );

                setBuses(activeBuses);
            } else {
                showAppToast("error", data.message || "Failed to fetch buses");
            }
        } catch (error) {
            console.error(error);
            showAppToast("error", "Failed to fetch buses");
        }
    };

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/api/admin/schedules?page=1&limit=100");
            const data = await res.json();

            if (res.ok && data.success) {
                setSchedules(data.data || []);
            } else {
                showAppToast("error", data.message || "Failed to fetch schedules");
            }
        } catch (error) {
            console.error(error);
            showAppToast("error", "Failed to fetch schedules");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuses();
        fetchSchedules();
    }, []);

    const handleCreate = async () => {
        if (!busId) {
            showAppToast("error", "Please select bus");
            return;
        }

        if (dateMode === "single" && !travelDate) {
            showAppToast("error", "Please select date");
            return;
        }

        if (dateMode === "range" && (!startDate || !endDate)) {
            showAppToast("error", "Please select start date and end date");
            return;
        }

        setCreating(true);

        try {
            const payload = { busId };

            if (dateMode === "single") {
                payload.travelDate = travelDate;
            } else {
                payload.startDate = startDate;
                payload.endDate = endDate;
            }

            const res = await apiFetch("/api/admin/schedules", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                showAppToast("error", data.message || "Failed to create schedule");
                return;
            }

            showAppToast("success", data.message || "Schedule created successfully");

            setBusId("");
            setDateMode("single");
            setTravelDate("");
            setStartDate("");
            setEndDate("");

            fetchSchedules();
        } catch (error) {
            console.error(error);
            showAppToast("error", "Failed to create schedule");
        } finally {
            setCreating(false);
        }
    };

    const openEditModal = (item) => {
        setSelectedSchedule(item);
        setEditForm({
            travelDate: item.travelDate
                ? new Date(item.travelDate).toISOString().split("T")[0]
                : "",
            startTime: item.startTime || "",
            endTime: item.endTime || "",
            baseFare: item.baseFare || "",
            effectiveFare: item.effectiveFare || "",
            status: item.status || "SCHEDULED",
        });
        setEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedSchedule?._id) return;

        setSaving(true);

        try {
            const payload = {
                travelDate: editForm.travelDate,
                startTime: editForm.startTime,
                endTime: editForm.endTime,
                baseFare: Number(editForm.baseFare),
                effectiveFare: Number(editForm.effectiveFare),
                status: editForm.status,
            };

            const res = await apiFetch(`/api/admin/schedules/${selectedSchedule._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                showAppToast("error", data.message || "Failed to update schedule");
                return;
            }

            showAppToast("success", "Schedule updated successfully");
            setEditOpen(false);
            setSelectedSchedule(null);
            fetchSchedules();
        } catch (error) {
            console.error(error);
            showAppToast("error", "Failed to update schedule");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (scheduleId) => {
        const ok = globalThis.confirm("Are you sure you want to delete this schedule?");
        if (!ok) return;

        try {
            const res = await apiFetch(`/api/admin/schedules/${scheduleId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                showAppToast("error", data.message || "Failed to delete schedule");
                return;
            }

            showAppToast("success", "Schedule deleted successfully");
            fetchSchedules();
        } catch (error) {
            console.error(error);
            showAppToast("error", "Failed to delete schedule");
        }
    };

    let scheduleTableContent;

    if (loading) {
        scheduleTableContent = (
            <div className="p-8 text-center text-sm text-slate-500">Loading schedules...</div>
        );
    } else if (schedules.length === 0) {
        scheduleTableContent = (
            <div className="p-8 text-center text-sm text-slate-500">No schedules found</div>
        );
    } else {
        scheduleTableContent = (
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Bus</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Route</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Start</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">End</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Fare</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {schedules.map((item) => (
                            <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                                    {item.busNumber}
                                    <div className="text-xs font-normal text-slate-500">{item.busName}</div>
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-700">
                                    {item.routeName || `${item.startPoint} → ${item.endPoint}`}
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-700">
                                    {item.travelDate
                                        ? new Date(item.travelDate).toLocaleDateString("en-GB")
                                        : "-"}
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-700">{item.startTime || "--:--"}</td>
                                <td className="px-4 py-4 text-sm text-slate-700">{item.endTime || "--:--"}</td>

                                <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                                    ₹ {Number(item.effectiveFare || item.baseFare || 0)}
                                </td>

                                <td className="px-4 py-4">
                                    <StatusBadge status={item.status} />
                                </td>

                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
                        <CalendarDays className="h-6 w-6 text-[#0B5D5A]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Schedule Management</h1>
                        <p className="text-sm text-slate-500">Simple schedule create and manage</p>
                    </div>
                </div>
            </div>

            {/* Create */}
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Create Schedule</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Select Bus</label>
                        <Select value={busId} onChange={(e) => setBusId(e.target.value)}>
                            <option value="">Select Bus</option>
                            {buses.map((bus) => (
                                <option key={bus._id} value={bus._id}>
                                    {bus.busNumber} - {bus.busName}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Date Type</label>
                        <Select value={dateMode} onChange={(e) => setDateMode(e.target.value)}>
                            <option value="single">Single Date</option>
                            <option value="range">Start Date - End Date</option>
                        </Select>
                    </div>

                    {dateMode === "single" ? (
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Select Date</label>
                            <Input
                                type="date"
                                value={travelDate}
                                onChange={(e) => setTravelDate(e.target.value)}
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Start Date</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">End Date</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-5">
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={creating}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0B5D5A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#094B49] disabled:opacity-60"
                    >
                        {creating ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Create Schedule
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                    <h2 className="text-lg font-bold text-slate-900">Schedule Table</h2>
                </div>

                {scheduleTableContent}
            </div>

            <EditScheduleModal
                open={editOpen}
                onClose={() => {
                    setEditOpen(false);
                    setSelectedSchedule(null);
                }}
                form={editForm}
                setForm={setEditForm}
                onSave={handleSaveEdit}
                saving={saving}
                toast={showAppToast}
            />
        </div>
    );
}