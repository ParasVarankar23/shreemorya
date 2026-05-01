"use client";

import { showAppToast } from "@/lib/toast";
import { Loader2, Mail, Pencil, Phone, Plus, Search, Trash2, User, X } from "lucide-react";
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.success) {
                showAppToast("error", data?.message || "Error saving staff");
                return;
            }

            showAppToast(
                "success",
                editingId ? "Updated Successfully" : "Created Successfully"
            );

            setOpenModal(false);
            reset();
            fetchStaff();
        } catch {
            showAppToast("error", "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async () => {
        await apiFetch(`/api/admin/staff/${confirmDelete}`, {
            method: "DELETE",
        });

        showAppToast("success", "Deleted successfully");
        setConfirmDelete(null);
        fetchStaff();
    };

    /* ================= AUTH FETCH ================= */
    const getToken = () => localStorage.getItem("accessToken") || "";

    async function apiFetch(url, options = {}) {
        const headers = new Headers(options.headers || {});
        headers.set("Authorization", `Bearer ${getToken()}`);
        return fetch(url, { ...options, headers });
    }

    /* ================= FILTER ================= */
    const filtered = list.filter((i) => {
        const s = `${i.fullName} ${i.email} ${i.phoneNumber}`.toLowerCase();
        return (
            s.includes(search.toLowerCase()) &&
            (filter === "All" || i.position === filter)
        );
    });

    const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "S";

    return (
        <div className="min-h-screen bg-[#F6FBFA] p-6 overflow-y-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black">Staff Management</h1>
                    <p className="text-sm text-gray-500">Manage your team</p>
                </div>

                <button
                    onClick={() => {
                        reset();
                        setOpenModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#0B5D5A] text-white px-5 py-3 rounded-xl"
                >
                    <Plus size={16} /> Add Staff
                </button>
            </div>

            {/* SEARCH */}
            <div className="bg-white p-4 rounded-2xl shadow mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3 text-gray-400" />
                    <input
                        placeholder="Search..."
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-11 pl-10 rounded-xl border"
                    />
                </div>

                <select
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-11 px-4 rounded-xl border"
                >
                    <option>All</option>
                    <option>Driver</option>
                    <option>Cleaner</option>
                    <option>Office Staff</option>
                </select>
            </div>

            <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">

                <table className="w-full text-sm">

                    {/* HEADER */}
                    <thead className="bg-gray-50/70 text-gray-500 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4 text-left">Name</th>
                            <th className="px-6 py-4 text-left">Email</th>
                            <th className="px-6 py-4 text-left">Phone</th>
                            <th className="px-6 py-4 text-left">Role</th>
                            <th className="px-6 py-4 text-left">Position</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody className="divide-y divide-gray-100">

                        {filtered.map((i) => (
                            <tr
                                key={i._id}
                                className="group hover:bg-[#F9FBFB] transition duration-200"
                            >

                                {/* NAME */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0B5D5A]/20 to-[#0B5D5A]/10 flex items-center justify-center text-[#0B5D5A] font-semibold shadow-sm">
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
                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        {i.position}
                                    </span>
                                </td>

                                {/* ACTIONS */}
                                <td className="px-6 py-5">
                                    <div className="flex justify-center gap-2 opacity-70 group-hover:opacity-100 transition">

                                        {/* EDIT */}
                                        <button
                                            onClick={() => {
                                                setEditingId(i._id);
                                                setForm(i);
                                                setOpenModal(true);
                                            }}
                                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-[#0B5D5A]/10 hover:text-[#0B5D5A] transition shadow-sm"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        {/* DELETE */}
                                        <button
                                            onClick={() => setConfirmDelete(i._id)}
                                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-red-200 text-red-500 bg-white hover:bg-red-50 hover:text-red-600 transition shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                    </div>
                                </td>

                            </tr>
                        ))}

                    </tbody>
                </table>

                {/* EMPTY */}
                {filtered.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        No staff found
                    </div>
                )}
            </div>

            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

                    {/* Modal */}
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 animate-fadeIn">

                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingId ? "Edit Staff" : "Add Staff"}
                            </h2>

                            <button
                                onClick={() => setOpenModal(false)}
                                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* FORM */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* NAME */}
                            <div>
                                <label className="text-sm font-semibold text-gray-600">
                                    Full Name
                                </label>

                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        placeholder="Enter full name"
                                        value={form.fullName}
                                        onChange={(e) =>
                                            setForm({ ...form, fullName: e.target.value })
                                        }
                                        className="w-full h-12 pl-10 pr-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-[#0B5D5A]"
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="text-sm font-semibold text-gray-600">
                                    Email Address
                                </label>

                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        placeholder="Enter email"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({ ...form, email: e.target.value })
                                        }
                                        className="w-full h-12 pl-10 pr-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-[#0B5D5A]"
                                    />
                                </div>
                            </div>

                            {/* PHONE */}
                            <div>
                                <label className="text-sm font-semibold text-gray-600">
                                    Phone Number
                                </label>

                                <div className="relative mt-1">
                                    <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        placeholder="Enter phone number"
                                        value={form.phoneNumber}
                                        onChange={(e) =>
                                            setForm({ ...form, phoneNumber: e.target.value })
                                        }
                                        className="w-full h-12 pl-10 pr-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-[#0B5D5A]"
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
                                        setForm({ ...form, position: e.target.value })
                                    }
                                    className="w-full h-12 mt-1 px-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-[#0B5D5A]"
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
                                {loading && <Loader2 className="animate-spin" size={18} />}

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

            {/* DELETE */}
            {confirmDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                    <div className="bg-white p-6 rounded">
                        <p>Delete this staff?</p>
                        <div className="flex gap-3 mt-3">
                            <button onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button onClick={handleDelete} className="text-red-500">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}