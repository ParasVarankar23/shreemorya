"use client";

import { showAppToast } from "@/lib/toast";
import {
    Loader2,
    Mail,
    Pencil,
    Phone,
    Plus,
    Search,
    Trash2,
    User,
    X,
} from "lucide-react";

import { useAutoRefresh } from "@/context/AutoRefreshContext";
import { useEffect, useState } from "react";

export default function StaffPage() {
    const [list, setList] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        position: "Office Staff",
    });

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    /* ================= FETCH ================= */

    const fetchStaff = async () => {
        try {
            const res = await apiFetch("/api/admin/staff");
            const data = await res.json().catch(() => ({}));

            let items = [];

            if (Array.isArray(data)) items = data;
            else if (Array.isArray(data.data)) items = data.data;
            else if (Array.isArray(data.data?.data)) items = data.data.data;

            setList(items);
        } catch (err) {
            showAppToast("error", "Failed to load staff");
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const { subscribeRefresh, triggerRefresh } = useAutoRefresh();

    useEffect(() => {
        const unsub = subscribeRefresh(() => {
            fetchStaff();
        });

        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subscribeRefresh]);

    /* ================= RESET ================= */

    const reset = () => {
        setForm({
            fullName: "",
            email: "",
            phoneNumber: "",
            position: "Office Staff",
        });

        setEditingId(null);
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setLoading(true);

        const method = editingId ? "PUT" : "POST";

        const url = editingId
            ? `/api/admin/staff/${editingId}`
            : "/api/admin/staff";

        try {
            const res = await apiFetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.success) {
                showAppToast(
                    "error",
                    data?.message || "Error saving staff"
                );
                return;
            }

            showAppToast(
                "success",
                editingId
                    ? "Updated Successfully"
                    : "Created Successfully"
            );

            setOpenModal(false);

            reset();

            await fetchStaff();

            try {
                triggerRefresh();
            } catch (e) {
                // ignore if context not available
            }
        } catch {
            showAppToast("error", "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    /* ================= DELETE ================= */

    const handleDelete = async () => {
        try {
            await apiFetch(`/api/admin/staff/${confirmDelete}`, {
                method: "DELETE",
            });

            showAppToast("success", "Deleted successfully");

            setConfirmDelete(null);

            await fetchStaff();

            try {
                triggerRefresh();
            } catch (e) {
                // ignore
            }
        } catch {
            showAppToast("error", "Delete failed");
        }
    };

    /* ================= AUTH FETCH ================= */

    const getToken = () =>
        localStorage.getItem("accessToken") || "";

    async function apiFetch(url, options = {}) {
        const headers = new Headers(options.headers || {});

        headers.set(
            "Authorization",
            `Bearer ${getToken()}`
        );

        return fetch(url, {
            ...options,
            headers,
        });
    }

    /* ================= FILTER ================= */

    const filtered = list.filter((i) => {
        const s =
            `${i.fullName} ${i.email} ${i.phoneNumber}`.toLowerCase();

        return (
            s.includes(search.toLowerCase()) &&
            (filter === "All" || i.position === filter)
        );
    });

    const getInitial = (name) =>
        name?.charAt(0)?.toUpperCase() || "S";

    return (
        <div className="min-h-screen bg-[#F6FBFA] p-3 sm:p-5 lg:p-6 overflow-x-hidden">

            {/* ================= HEADER ================= */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Staff Management
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage your team
                    </p>
                </div>

                <button
                    onClick={() => {
                        reset();
                        setOpenModal(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#0B5D5A] text-white px-5 py-3 rounded-2xl w-full sm:w-auto shadow-md hover:bg-[#094B49] transition"
                >
                    <Plus size={18} />
                    Add Staff
                </button>
            </div>

            {/* ================= SEARCH ================= */}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">

                {/* SEARCH INPUT */}

                <div className="relative flex-1">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />

                    <input
                        placeholder="Search staff..."
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-[#0B5D5A]"
                    />
                </div>

                {/* FILTER */}

                <select
                    onChange={(e) =>
                        setFilter(e.target.value)
                    }
                    className="h-12 px-4 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-[#0B5D5A] w-full sm:w-[220px]"
                >
                    <option>All</option>
                    <option>Driver</option>
                    <option>Cleaner</option>
                    <option>Office Staff</option>
                </select>
            </div>

            {/* ================= TABLE ================= */}

            {/* ================= DESKTOP TABLE ================= */}

            <div className="hidden lg:block bg-white/90 backdrop-blur border border-gray-200 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                        {/* HEADER */}

                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">

                            <tr>

                                <th className="px-6 py-4 text-left font-semibold">
                                    Name
                                </th>

                                <th className="px-6 py-4 text-left font-semibold">
                                    Email
                                </th>

                                <th className="px-6 py-4 text-left font-semibold">
                                    Phone
                                </th>

                                <th className="px-6 py-4 text-left font-semibold">
                                    Role
                                </th>

                                <th className="px-6 py-4 text-left font-semibold">
                                    Position
                                </th>

                                <th className="px-6 py-4 text-center font-semibold">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        {/* BODY */}

                        <tbody className="divide-y divide-gray-100">

                            {filtered.map((i) => (

                                <tr
                                    key={i._id}
                                    className="hover:bg-[#F9FBFB] transition"
                                >

                                    {/* NAME */}

                                    <td className="px-6 py-5">

                                        <div className="flex items-center gap-3">

                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0B5D5A]/20 to-[#0B5D5A]/10 flex items-center justify-center text-[#0B5D5A] font-bold">
                                                {getInitial(i.fullName)}
                                            </div>

                                            <div>

                                                <p className="font-semibold text-gray-900">
                                                    {i.fullName}
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    Staff Member
                                                </p>

                                            </div>

                                        </div>

                                    </td>

                                    {/* EMAIL */}

                                    <td className="px-6 py-5 text-gray-600">
                                        {i.email || "-"}
                                    </td>

                                    {/* PHONE */}

                                    <td className="px-6 py-5 text-gray-600">
                                        {i.phoneNumber}
                                    </td>

                                    {/* ROLE */}

                                    <td className="px-6 py-5">

                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                            Staff
                                        </span>

                                    </td>

                                    {/* POSITION */}

                                    <td className="px-6 py-5">

                                        <span className="inline-flex items-center whitespace-nowrap min-w-fit px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            {i.position}
                                        </span>

                                    </td>

                                    {/* ACTIONS */}

                                    <td className="px-6 py-5">

                                        <div className="flex justify-center gap-2">

                                            <button
                                                onClick={() => {
                                                    setEditingId(i._id);
                                                    setForm(i);
                                                    setOpenModal(true);
                                                }}
                                                className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-[#0B5D5A]/10 hover:text-[#0B5D5A] transition"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setConfirmDelete(i._id)
                                                }
                                                className="h-10 w-10 flex items-center justify-center rounded-xl border border-red-200 text-red-500 bg-white hover:bg-red-50 hover:text-red-600 transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ================= MOBILE CARDS ================= */}

            <div className="grid gap-4 lg:hidden">

                {filtered.map((i) => (

                    <div
                        key={i._id}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4"
                    >

                        {/* TOP */}

                        <div className="flex items-start justify-between">

                            <div className="flex items-center gap-3">

                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0B5D5A]/20 to-[#0B5D5A]/10 flex items-center justify-center text-[#0B5D5A] font-bold">
                                    {getInitial(i.fullName)}
                                </div>

                                <div>

                                    <h3 className="font-bold text-slate-900">
                                        {i.fullName}
                                    </h3>

                                    <p className="text-xs text-gray-400">
                                        Staff Member
                                    </p>

                                </div>

                            </div>

                            <span className="inline-flex items-center whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {i.position}
                            </span>

                        </div>

                        {/* DETAILS */}

                        <div className="mt-4 space-y-3">

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail size={15} />
                                {i.email || "-"}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone size={15} />
                                {i.phoneNumber}
                            </div>

                        </div>

                        {/* ACTIONS */}

                        <div className="flex gap-3 mt-5">

                            <button
                                onClick={() => {
                                    setEditingId(i._id);
                                    setForm(i);
                                    setOpenModal(true);
                                }}
                                className="flex-1 h-11 rounded-xl border border-gray-200 flex items-center justify-center gap-2 hover:bg-[#0B5D5A]/10 hover:text-[#0B5D5A] transition"
                            >
                                <Pencil size={16} />
                                Edit
                            </button>

                            <button
                                onClick={() =>
                                    setConfirmDelete(i._id)
                                }
                                className="flex-1 h-11 rounded-xl border border-red-200 text-red-500 flex items-center justify-center gap-2 hover:bg-red-50 transition"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>

                        </div>

                    </div>

                ))}

            </div>

            {/* ================= MODAL ================= */}

            {openModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">

                        {/* HEADER */}

                        <div className="flex items-center justify-between mb-6">

                            <h2 className="text-xl font-bold text-slate-900">

                                {editingId
                                    ? "Edit Staff"
                                    : "Add Staff"}

                            </h2>

                            <button
                                onClick={() =>
                                    setOpenModal(false)
                                }
                                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                            >
                                <X size={18} />
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >

                            {/* NAME */}

                            <div>

                                <label className="text-sm font-semibold text-gray-600">
                                    Full Name
                                </label>

                                <div className="relative mt-1">

                                    <User
                                        className="absolute left-3 top-3 text-gray-400"
                                        size={18}
                                    />

                                    <input
                                        placeholder="Enter full name"
                                        value={form.fullName}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                fullName:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full h-12 pl-10 pr-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-[#0B5D5A] outline-none"
                                    />

                                </div>

                            </div>

                            {/* EMAIL */}

                            <div>

                                <label className="text-sm font-semibold text-gray-600">
                                    Email Address
                                </label>

                                <div className="relative mt-1">

                                    <Mail
                                        className="absolute left-3 top-3 text-gray-400"
                                        size={18}
                                    />

                                    <input
                                        placeholder="Enter email"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                email:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full h-12 pl-10 pr-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-[#0B5D5A] outline-none"
                                    />

                                </div>

                            </div>

                            {/* PHONE */}

                            <div>

                                <label className="text-sm font-semibold text-gray-600">
                                    Phone Number
                                </label>

                                <div className="relative mt-1">

                                    <Phone
                                        className="absolute left-3 top-3 text-gray-400"
                                        size={18}
                                    />

                                    <input
                                        placeholder="Enter phone number"
                                        value={form.phoneNumber}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                phoneNumber:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full h-12 pl-10 pr-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-[#0B5D5A] outline-none"
                                    />

                                </div>

                            </div>

                            {/* POSITION */}

                            <div>

                                <label className="text-sm font-semibold text-gray-600">
                                    Position
                                </label>

                                <select
                                    value={form.position}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            position:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full h-12 mt-1 px-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-[#0B5D5A] outline-none"
                                >
                                    <option>Office Staff</option>
                                    <option>Driver</option>
                                    <option>Cleaner</option>
                                </select>

                            </div>

                            {/* BUTTON */}

                            <button
                                disabled={loading}
                                className={`w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#0B5D5A] hover:bg-[#094B49] text-white"
                                    }`}
                            >

                                {loading && (
                                    <Loader2
                                        className="animate-spin"
                                        size={18}
                                    />
                                )}

                                {loading
                                    ? editingId
                                        ? "Updating..."
                                        : "Creating..."
                                    : editingId
                                        ? "Update Staff"
                                        : "Create Staff"}

                            </button>

                        </form>

                    </div>

                </div>

            )}

            {/* ================= DELETE MODAL ================= */}

            {confirmDelete && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">

                        <h3 className="text-lg font-bold text-gray-900">
                            Delete Staff
                        </h3>

                        <p className="text-sm text-gray-500 mt-2">
                            Are you sure you want to delete this
                            staff member?
                        </p>

                        <div className="flex gap-3 mt-6">

                            <button
                                onClick={() =>
                                    setConfirmDelete(null)
                                }
                                className="flex-1 h-11 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                className="flex-1 h-11 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
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