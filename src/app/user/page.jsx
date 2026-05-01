"use client";

import { useEffect, useState } from "react";

function getAuthHeaders() {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("authToken") || "";
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function page() {
    const [bookings, setBookings] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const [bRes, pRes] = await Promise.all([
                    fetch("/api/user/bookings", { headers: getAuthHeaders() }),
                    fetch("/api/user/payments", { headers: getAuthHeaders() }),
                ]);

                const bJson = await bRes.json();
                const pJson = await pRes.json();

                if (mounted) {
                    setBookings(bJson?.data || []);
                    setPayments(pJson?.data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => (mounted = false);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">My Account</h1>

            <section className="mb-6">
                <h2 className="text-xl font-semibold">My Bookings</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : bookings.length === 0 ? (
                    <p>No bookings found.</p>
                ) : (
                    <ul className="mt-3 space-y-2">
                        {bookings.map((b) => (
                            <li key={b._id} className="rounded border p-3">
                                <div className="font-bold">{b.bookingCode || b._id}</div>
                                <div>Route: {b.routeName || b.route || "-"}</div>
                                <div>Travel Date: {b.travelDate || "-"}</div>
                                <div>Seats: {(b.seats || []).join(", ")}</div>
                                <div>Status: {b.bookingStatus}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2 className="text-xl font-semibold">My Payments</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : payments.length === 0 ? (
                    <p>No payments found.</p>
                ) : (
                    <ul className="mt-3 space-y-2">
                        {payments.map((p) => (
                            <li key={p._id} className="rounded border p-3">
                                <div className="font-bold">Amount: ₹{p.amount}</div>
                                <div>Booking: {p.bookingId || "-"}</div>
                                <div>Status: {p.paymentStatus}</div>
                                <div>Paid At: {p.paidAt || p.createdAt || "-"}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
