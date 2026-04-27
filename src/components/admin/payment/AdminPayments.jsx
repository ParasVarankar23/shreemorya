"use client";

import { useEffect, useState } from "react";

function getAccessToken() {
    if (typeof window === "undefined") return "";
    return (
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        ""
    );
}

function getAuthHeaders() {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [total, setTotal] = useState(0);

    const [filterMethod, setFilterMethod] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [preset, setPreset] = useState("today");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        applyPreset(preset);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preset]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, filterMethod, filterStatus, dateFrom, dateTo]);

    function startOfDay(d) {
        const dt = new Date(d);
        dt.setHours(0, 0, 0, 0);
        return dt.toISOString();
    }

    function endOfDay(d) {
        const dt = new Date(d);
        dt.setHours(23, 59, 59, 999);
        return dt.toISOString();
    }

    function applyPreset(p) {
        const now = new Date();
        let from = "";
        let to = "";

        if (p === "today") {
            from = startOfDay(now);
            to = endOfDay(now);
        } else if (p === "week") {
            const first = new Date(now);
            first.setDate(now.getDate() - now.getDay());
            from = startOfDay(first);
            to = endOfDay(now);
        } else if (p === "month") {
            const first = new Date(now.getFullYear(), now.getMonth(), 1);
            from = startOfDay(first);
            to = endOfDay(now);
        } else if (p === "year") {
            const first = new Date(now.getFullYear(), 0, 1);
            from = startOfDay(first);
            to = endOfDay(now);
        } else if (p === "custom") {
            from = dateFrom || "";
            to = dateTo || "";
        }

        setDateFrom(from);
        setDateTo(to);
    }

    const loadData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", String(limit));
            if (filterMethod) params.set("paymentMethod", filterMethod);
            if (filterStatus) params.set("paymentStatus", filterStatus);
            if (search) params.set("search", search);
            if (dateFrom) params.set("from", dateFrom);
            if (dateTo) params.set("to", dateTo);

            const res = await fetch(`/api/admin/payments?${params.toString()}`, { headers: getAuthHeaders() });
            const json = await res.json();

            if (!res.ok || !json?.success) {
                throw new Error(json?.message || "Failed to load payments");
            }

            setPayments(Array.isArray(json.data) ? json.data : []);
            setTotal(json.pagination?.total || 0);
        } catch (err) {
            console.error("Failed to load payments:", err);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = payments.reduce((s, p) => s + Number(p.amount || p.totalAmount || 0), 0);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold mb-4">Payments</h2>
                <div className="text-sm text-slate-600">Count: <strong>{total}</strong> • Total: <strong>₹{totalAmount.toFixed(2)}</strong></div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transaction, order or booking" className="rounded-md border px-3 py-2 text-sm" />
                <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
                    <option value="">All Methods</option>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE_CASH">Cash</option>
                    <option value="OFFLINE_UPI">UPI</option>
                    <option value="OFFLINE_UNPAID">Unpaid</option>
                </select>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
                    <option value="">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="PENDING">Pending</option>
                </select>

                <div className="flex items-center gap-2">
                    <button onClick={() => setPreset("today")} className="rounded-md border px-3 py-2 text-sm">Today</button>
                    <button onClick={() => setPreset("week")} className="rounded-md border px-3 py-2 text-sm">This Week</button>
                    <button onClick={() => setPreset("month")} className="rounded-md border px-3 py-2 text-sm">This Month</button>
                    <button onClick={() => setPreset("year")} className="rounded-md border px-3 py-2 text-sm">This Year</button>
                    <button onClick={() => setPreset("custom")} className="rounded-md border px-3 py-2 text-sm">Custom</button>
                </div>

                {preset === "custom" && (
                    <div className="flex items-center gap-2">
                        <input type="date" value={dateFrom ? new Date(dateFrom).toISOString().slice(0, 10) : ""} onChange={(e) => setDateFrom(startOfDay(e.target.value))} className="rounded-md border px-3 py-2 text-sm" />
                        <input type="date" value={dateTo ? new Date(dateTo).toISOString().slice(0, 10) : ""} onChange={(e) => setDateTo(endOfDay(e.target.value))} className="rounded-md border px-3 py-2 text-sm" />
                    </div>
                )}

                <button onClick={() => { setPage(1); loadData(); }} className="ml-auto rounded-md bg-[#0B5D5A] px-3 py-2 text-sm font-bold text-white">Apply</button>
            </div>

            <div className="overflow-auto rounded-lg border">
                <table className="min-w-full divide-y">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Date</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Booking / Ref</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Amount</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Status</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Method</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Txn</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">Loading...</td>
                            </tr>
                        ) : payments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">No payments found</td>
                            </tr>
                        ) : (
                            payments.map((p) => (
                                <tr key={p._id} className="border-t">
                                    <td className="px-4 py-3 text-sm text-slate-700">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{p.bookingId || p.paymentId || p.gatewayOrderId || "-"}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700">₹{Number(p.amount || p.totalAmount || 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{p.paymentStatus || p.status || "-"}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{p.paymentMethod || p.transactionType || "-"}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{p.gatewayPaymentId || p.gatewayOrderId || "-"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">Showing {payments.length} of {total} payments</div>
                <div className="flex items-center gap-2">
                    <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-md border px-3 py-2 text-sm">Prev</button>
                    <div className="px-2">Page {page}</div>
                    <button disabled={payments.length < limit} onClick={() => setPage((p) => p + 1)} className="rounded-md border px-3 py-2 text-sm">Next</button>
                </div>
            </div>
        </div>
    );
}
