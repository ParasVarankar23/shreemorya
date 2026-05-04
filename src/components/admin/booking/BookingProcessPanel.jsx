"use client";

import {
    Ban,
    BusFront,
    CalendarDays,
    Download,
    Mail,
    Phone,
    Printer,
    User,
    Users,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import SeatLayout from "../../SeatLayout";
import CancelBookingModal from "./CancelBookingModal";
import ExistingBookingsPanel from "./ExistingBookingsPanel";
import PrintSeatTemplateModal from "./PrintSeatTemplateModal";
import SeatBookingDetailsModal from "./SeatBookingDetailsModal";
import {
    formatCurrency,
    getAuthHeaders,
    showAppToast,
} from "./bookingHelpers";

let razorpayLoadPromise = null;

function getSeatItemsFromBooking(booking = {}) {
    if (Array.isArray(booking?.seatItems) && booking.seatItems.length > 0) {
        return booking.seatItems;
    }

    const seats = Array.isArray(booking?.seats) ? booking.seats : [];
    const topSeatStatus = String(booking?.seatStatus || "").toLowerCase();
    const fallbackStatus =
        topSeatStatus === "blocked"
            ? "blocked"
            : topSeatStatus === "cancelled"
                ? "cancelled"
                : "booked";

    return seats.map((seatNo) => ({
        seatNo: String(seatNo),
        ticketNo: `${booking?.bookingCode || "BOOK"}-${String(seatNo)}`,
        passengerName: booking?.customerName || "",
        passengerGender: String(booking?.customerGender || "").toLowerCase(),
        fare: booking?.fare || 0,
        seatStatus: fallbackStatus,
        refund: booking?.refund || null,
        cancelActionType: booking?.cancelActionType || "",
        cancelledAt: booking?.cancelledAt || null,
    }));
}

export default function BookingProcessPanel({
    selectedBus,
    travelDate,
    pickupStop,
    dropStop,
    onCloseBus,
    // When rendered for normal users, set isAdmin to false to hide admin-only controls
    isAdmin = true,
}) {
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [existingBookings, setExistingBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [onlinePaymentProcessing, setOnlinePaymentProcessing] = useState(false);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerGender, setCustomerGender] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [overrideTotalFare, setOverrideTotalFare] = useState("");
    const [voucherCodeInput, setVoucherCodeInput] = useState("");
    const [voucherData, setVoucherData] = useState(null);
    const sanitizeVoucher = (v) => {
        if (!v) return null;
        return {
            _id: v._id || v.id || "",
            voucherCode: v.voucherCode || "",
            originalAmount: Number(v.originalAmount || 0),
            remainingAmount: Number(v.remainingAmount || 0),
            expiresAt: v.expiresAt || null,
            status: v.status || "",
            guestName: v.guestName || v.guestFullName || "",
            guestPhoneNumber: v.guestPhoneNumber || v.guestPhone || "",
            guestEmail: v.guestEmail || "",
        };
    };
    const [voucherModalOpen, setVoucherModalOpen] = useState(false);

    const [holdData, setHoldData] = useState(null);
    const [holdCountdown, setHoldCountdown] = useState(0);

    // NEW: seat-wise passenger details
    const [passengerDetails, setPassengerDetails] = useState({});

    const [seatDetailModalOpen, setSeatDetailModalOpen] = useState(false);
    const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [printModalOpen, setPrintModalOpen] = useState(false);

    const [cancelLoading, setCancelLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [blockingSeats, setBlockingSeats] = useState(false);
    const [unblockingSeats, setUnblockingSeats] = useState(false);

    useEffect(() => {
        if (selectedBus?._id && travelDate) {
            loadExistingBookings();
        } else {
            setExistingBookings([]);
            setSelectedSeats([]);
            setOverrideTotalFare("");
            setPassengerDetails({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBus?._id, travelDate]);

    // Auto-fill booking contact fields from server-side profile (do not use localStorage user)
    useEffect(() => {
        let mounted = true;

        async function fetchProfile() {
            try {
                const refreshToken = localStorage.getItem("refreshToken") || "";

                const doFetch = async (accessToken) => {
                    const headers = new Headers();
                    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
                    return fetch("/api/auth/me", {
                        method: "GET",
                        headers,
                    });
                };

                // Try with existing access token
                let accessToken = localStorage.getItem("accessToken") || "";
                let res = null;

                if (accessToken) {
                    res = await doFetch(accessToken);
                }

                // If we don't have an access token but have refresh token, try refresh
                if (!res && refreshToken) {
                    const r = await fetch("/api/auth/refresh", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refreshToken }),
                    });
                    const d = await r.json().catch(() => ({}));
                    if (r.ok && d?.accessToken) {
                        accessToken = d.accessToken;
                        localStorage.setItem("accessToken", accessToken);
                        res = await doFetch(accessToken);
                    }
                }

                // If token expired, try refresh flow and fetch again
                if (res && res.status === 401 && refreshToken) {
                    const r2 = await fetch("/api/auth/refresh", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refreshToken }),
                    });
                    const d2 = await r2.json().catch(() => ({}));
                    if (r2.ok && d2?.accessToken) {
                        accessToken = d2.accessToken;
                        localStorage.setItem("accessToken", accessToken);
                        res = await doFetch(accessToken);
                    }
                }

                if (!res) return;

                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data?.success) return;

                if (!mounted) return;

                const u = data?.data?.user || data?.data || null;
                if (!u) return;

                if (!customerName && (u.fullName || u.fullname)) {
                    setCustomerName(u.fullName || u.fullname || "");
                }

                if (!customerPhone && (u.phoneNumber || u.phone)) {
                    setCustomerPhone(u.phoneNumber || u.phone || "");
                }

                if (!customerEmail && (u.email || u.emailAddress)) {
                    setCustomerEmail((u.email || u.emailAddress || "").toString().trim());
                }

                // Prefill gender if available and valid
                try {
                    const g = String(u.gender || "").trim().toLowerCase();
                    if (g && ["male", "female", "other"].includes(g)) {
                        setCustomerGender(g);
                    }
                } catch (e) {
                    // ignore
                }
            } catch (e) {
                // ignore
            }
        }

        fetchProfile();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When admin views an existing booking, auto-fill contact & passenger fields
    useEffect(() => {
        const detail = selectedBookingDetail;
        if (!detail || !detail.booking) return;

        const booking = detail.booking;

        // Fill top-level contact fields so admin can use them for edits or rebooking
        if (booking.customerName) setCustomerName(booking.customerName);
        if (booking.customerPhone) setCustomerPhone(booking.customerPhone);
        if (booking.customerEmail) setCustomerEmail(booking.customerEmail || "");

        // Fill the per-seat passenger details for the focused seat
        const seatKey = String(detail.seatNo || "");
        if (seatKey) {
            setPassengerDetails((prev) => ({
                ...prev,
                [seatKey]: {
                    seatNo: seatKey,
                    passengerName: detail.passengerName || booking.customerName || "",
                    passengerGender: detail.passengerGender || booking.customerGender || "",
                },
            }));
        }
    }, [selectedBookingDetail]);

    useEffect(() => {
        loadRazorpayScript().catch((error) => {
            console.warn("Razorpay preload failed:", error);
        });
    }, []);

    const prevCustomerNameRef = useRef("");

    // Keep passengerDetails synced with selectedSeats
    // Also populate missing seat passenger names from the booking customer name
    // so the user doesn't need to type the same name twice if they enter
    // the booking customer name after selecting seats. While typing the
    // booking customer name, update per-seat names only if they were empty
    // or previously matched the previous customer name (so custom edits
    // are not overwritten).
    useEffect(() => {
        setPassengerDetails((prev) => {
            const next = { ...prev };
            const selectedSet = new Set(selectedSeats.map(String));

            // remove unselected
            Object.keys(next).forEach((seatNo) => {
                if (!selectedSet.has(String(seatNo))) {
                    delete next[seatNo];
                }
            });

            // add selected or fill/refresh passengerName from customerName
            selectedSeats.forEach((seatNo) => {
                const key = String(seatNo);
                const prevCustomer = prevCustomerNameRef.current || "";

                if (!next[key]) {
                    next[key] = {
                        seatNo: key,
                        passengerName: customerName.trim() || "",
                        passengerGender: customerGender || "",
                    };
                } else {
                    const currentName = String(next[key].passengerName || "").trim();

                    // If empty or previously set from the earlier customerName,
                    // overwrite with the new customerName value. This lets typing
                    // in the top field propagate live to per-seat inputs, but
                    // preserves manual per-seat edits.
                    if (
                        (!currentName || currentName === prevCustomer) &&
                        customerName.trim()
                    ) {
                        next[key].passengerName = customerName.trim();
                    }
                }
            });

            // update prevCustomerNameRef
            prevCustomerNameRef.current = customerName.trim();

            return next;
        });
    }, [selectedSeats, customerName]);

    const bookedMap = useMemo(() => {
        const map = {};

        existingBookings.forEach((booking) => {
            const seatItems = getSeatItemsFromBooking(booking);

            seatItems.forEach((seatItem) => {
                const seatNo = String(seatItem?.seatNo || "");
                if (!seatNo) return;

                const normalizedSeatStatus = String(seatItem?.seatStatus || "").toLowerCase();
                const normalizedBookingStatus = String(booking?.bookingStatus || "").toUpperCase();

                // cancelled real booking => available again
                // blocked => still blocked
                if (
                    normalizedSeatStatus === "cancelled" ||
                    (normalizedBookingStatus === "CANCELLED" && normalizedSeatStatus !== "blocked")
                ) {
                    return;
                }

                const resolvedStatus =
                    normalizedSeatStatus === "blocked" ? "blocked" : "booked";

                map[seatNo] = {
                    bookingId: booking?._id,
                    status: resolvedStatus,
                    seatNo,
                    ticketNo: seatItem?.ticketNo || "",
                    passengerName: seatItem?.passengerName || booking?.customerName || "",
                    passengerGender:
                        seatItem?.passengerGender || booking?.customerGender || "",
                    customerName: booking?.customerName || "",
                    customerPhone: booking?.customerPhone || "",
                    customerEmail: booking?.customerEmail || "",
                    pickupName: booking?.pickupName || pickupStop?.name || "",
                    dropName: booking?.dropName || dropStop?.name || "",
                    pickupMarathi:
                        booking?.pickupMarathi || pickupStop?.marathiName || "",
                    dropMarathi:
                        booking?.dropMarathi || dropStop?.marathiName || "",
                    pickupTime: booking?.pickupTime || pickupStop?.time || "",
                    dropTime: booking?.dropTime || dropStop?.time || "",
                    fare: seatItem?.fare || booking?.fare || 0,
                    bookingCode: booking?.bookingCode || "",
                    paymentStatus: booking?.paymentStatus || "UNPAID",
                    paymentMethod: booking?.paymentMethod || "UNPAID",
                    bookingStatus: booking?.bookingStatus || "",
                    seatStatus: seatItem?.seatStatus || booking?.seatStatus || "",
                    booking,
                };
            });
        });

        return map;
    }, [existingBookings, pickupStop, dropStop]);

    const bookedSeats = useMemo(() => {
        return Object.entries(bookedMap)
            .filter(([, value]) => value.status !== "blocked")
            .map(([seat]) => String(seat));
    }, [bookedMap]);

    const blockedSeats = useMemo(() => {
        return Object.entries(bookedMap)
            .filter(([, value]) => value.status === "blocked")
            .map(([seat]) => String(seat));
    }, [bookedMap]);

    const defaultPerSeatFare = useMemo(() => {
        return Number(selectedBus?.fare || selectedBus?.amount || 0);
    }, [selectedBus]);

    const defaultTotalFare = useMemo(() => {
        return defaultPerSeatFare * selectedSeats.length;
    }, [defaultPerSeatFare, selectedSeats]);

    const effectiveTotalFare = useMemo(() => {
        const parsed = Number(overrideTotalFare);
        if (overrideTotalFare !== "" && !Number.isNaN(parsed) && parsed >= 0) {
            return parsed;
        }
        return defaultTotalFare;
    }, [overrideTotalFare, defaultTotalFare]);

    const fetchVoucherByCode = async (code) => {
        if (!code || !code.trim()) return null;
        try {
            const params = new URLSearchParams({ search: code.trim(), limit: 1 });
            const res = await fetch(`/api/vouchers?${params.toString()}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to fetch voucher");
            }

            const list = Array.isArray(data?.data) ? data.data : [];
            return list[0] || null;
        } catch (err) {
            console.error("fetchVoucherByCode error:", err);
            return null;
        }
    };

    const applyVoucher = async () => {
        const code = String(voucherCodeInput || "").trim();
        if (!code) return showAppToast("error", "Enter voucher code");

        const v = await fetchVoucherByCode(code);
        if (!v) return showAppToast("error", "Voucher not found or expired");

        // Reject fully used vouchers
        const remaining = Number(v.remainingAmount || 0);
        const status = String(v.status || "").toUpperCase();
        if (remaining <= 0 || status === "USED") {
            return showAppToast("error", "This voucher has no remaining balance or is already used");
        }

        setVoucherData(sanitizeVoucher(v));

        // Apply voucher to override total fare (deduct remainingAmount)
        const total = defaultTotalFare;
        const newTotal = Math.max(0, Number((total - remaining).toFixed(2)));
        setOverrideTotalFare(String(newTotal));

        showAppToast("success", `Voucher applied: ${v.voucherCode} (₹${remaining})`);
    };

    const holdSeats = async () => {
        if (!selectedBus?._id) return showAppToast("error", "Select a bus first");
        if (!travelDate) return showAppToast("error", "Select travel date");
        if (selectedFreshSeats.length === 0) return showAppToast("error", "Select at least one available seat to hold");

        try {
            setBlockingSeats(true);
            const res = await fetch("/api/public/seat-hold", {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ scheduleId: selectedBus._id, seatNumbers: selectedFreshSeats, guestPhoneNumber: customerPhone || null, guestEmail: customerEmail || null }),
            });

            const data = await res.json();
            if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to hold seats");

            setHoldData(data.data);
            const expires = new Date(data.data.expiresAt).getTime();

            const tick = () => {
                const sec = Math.max(0, Math.floor((expires - Date.now()) / 1000));
                setHoldCountdown(sec);
                if (sec <= 0) setHoldData(null);
            };

            tick();
            const timer = setInterval(tick, 1000);
            // cleanup when hold expires
            setTimeout(() => clearInterval(timer), (data.data.holdDurationMinutes || 5) * 60 * 1000 + 2000);

            // Populate passengerDetails for held seats from current customerName
            setPassengerDetails((prev) => {
                const next = { ...prev };
                const selectedSet = new Set(selectedSeats.map(String));
                selectedSeats.forEach((seatNo) => {
                    const key = String(seatNo);
                    next[key] = {
                        seatNo: key,
                        passengerName: customerName.trim() || "",
                        passengerGender: next[key]?.passengerGender || customerGender || "",
                    };
                });
                return next;
            });

            showAppToast("success", data.message || "Seats held");
        } catch (err) {
            console.error("holdSeats error:", err);
            showAppToast("error", err.message || "Failed to hold seats");
        } finally {
            setBlockingSeats(false);
        }
    };

    const effectivePerSeatFare = useMemo(() => {
        if (selectedSeats.length === 0) return defaultPerSeatFare;
        return Number((effectiveTotalFare / selectedSeats.length).toFixed(2));
    }, [effectiveTotalFare, selectedSeats.length, defaultPerSeatFare]);

    const selectedBlockedSeats = useMemo(() => {
        return selectedSeats.filter((seat) => blockedSeats.includes(String(seat)));
    }, [selectedSeats, blockedSeats]);

    const selectedFreshSeats = useMemo(() => {
        return selectedSeats.filter(
            (seat) =>
                !blockedSeats.includes(String(seat)) &&
                !bookedSeats.includes(String(seat))
        );
    }, [selectedSeats, blockedSeats, bookedSeats]);

    const passengerDetailsArray = useMemo(() => {
        return selectedFreshSeats.map((seatNo) => ({
            seatNo: String(seatNo),
            passengerName:
                passengerDetails[String(seatNo)]?.passengerName?.trim() ||
                customerName.trim(),
            passengerGender:
                passengerDetails[String(seatNo)]?.passengerGender || customerGender || "",
        }));
    }, [selectedFreshSeats, passengerDetails, customerName]);

    const loadExistingBookings = async () => {
        // If not admin and no auth tokens are available, skip protected fetch.
        try {
            const hasAccessToken = !!(localStorage.getItem("accessToken") || "");
            const hasRefreshToken = !!(localStorage.getItem("refreshToken") || "");
            if (!isAdmin && !hasAccessToken && !hasRefreshToken) {
                setExistingBookings([]);
                return;
            }
        } catch (e) {
            // localStorage may be unavailable in some environments; if so, proceed with fetch and let it fail gracefully
        }
        async function refreshAccessToken() {
            try {
                const refreshToken = localStorage.getItem("refreshToken") || "";
                if (!refreshToken) return null;

                const r = await fetch("/api/auth/refresh", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                });

                const d = await r.json().catch(() => ({}));
                if (!r.ok || !d?.accessToken) return null;

                localStorage.setItem("accessToken", d.accessToken);
                return d.accessToken;
            } catch (e) {
                return null;
            }
        }

        try {
            setLoadingBookings(true);

            const params = new URLSearchParams({
                scheduleId: selectedBus?._id || "",
                date: travelDate || "",
            });

            if (isAdmin) {
                const doFetch = async (accessToken) => {
                    const headers = new Headers(getAuthHeaders());
                    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

                    return fetch(`/api/bookings?${params.toString()}`, {
                        method: "GET",
                        headers,
                    });
                };

                // If no access token present but refresh token exists, try refresh first
                let initialToken = localStorage.getItem("accessToken") || "";
                if (!initialToken) {
                    const hasRefresh = !!(localStorage.getItem("refreshToken") || "");
                    if (hasRefresh) {
                        const refreshed = await refreshAccessToken();
                        if (refreshed) initialToken = refreshed;
                    }
                }

                let res = await doFetch(initialToken || "");

                if (res.status === 401) {
                    const newToken = await refreshAccessToken();
                    if (newToken) {
                        res = await doFetch(newToken);
                    }
                }

                const data = await res.json().catch(() => ({}));

                if (!res.ok || !data?.success) {
                    throw new Error(data?.message || "Failed to load existing bookings");
                }

                setExistingBookings(Array.isArray(data?.data) ? data.data : []);
            } else {
                // Non-admin users: fetch only their bookings (protected endpoint)
                const doFetch = async (accessToken) => {
                    const headers = new Headers(getAuthHeaders());
                    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

                    return fetch(`/api/bookings?${params.toString()}`, {
                        method: "GET",
                        headers,
                    });
                };

                let initialToken = localStorage.getItem("accessToken") || "";
                if (!initialToken) {
                    const hasRefresh = !!(localStorage.getItem("refreshToken") || "");
                    if (hasRefresh) {
                        const refreshed = await refreshAccessToken();
                        if (refreshed) initialToken = refreshed;
                    }
                }

                let res = await doFetch(initialToken || "");
                if (res.status === 401) {
                    const newToken = await refreshAccessToken();
                    if (newToken) res = await doFetch(newToken);
                }

                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data?.success) {
                    throw new Error(data?.message || "Failed to load bookings");
                }

                setExistingBookings(Array.isArray(data?.data) ? data.data : []);
            }
        } catch (error) {
            console.error("loadExistingBookings error:", error);
            setExistingBookings([]);
            // If unauthorized, clear stored tokens so app can prompt re-login
            try {
                const msg = String(error?.message || "").toLowerCase();
                if (msg.includes("unauthorized") || msg.includes("401")) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("user");
                    showAppToast("error", "Session expired. Please login again.");
                    return;
                }
            } catch (e) {
                // ignore
            }

            showAppToast("error", error.message || "Failed to load existing bookings");
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleSeatSelect = (seatNo) => {
        const key = String(seatNo);
        const isSelected = selectedSeats.includes(key);
        const next = isSelected ? selectedSeats.filter((item) => item !== key) : [...selectedSeats, key];

        setSelectedSeats(next);

        // Auto-hold / release logic for non-admin users
        if (!isAdmin) {
            const nextFresh = next.filter(
                (s) => !blockedSeats.includes(String(s)) && !bookedSeats.includes(String(s))
            );

            (async () => {
                try {
                    // If selecting a seat (was not selected), create/update hold for new selection
                    if (!isSelected) {
                        if (nextFresh.length > 0) {
                            await holdSeatsFor(nextFresh);
                        }
                        return;
                    }

                    // If deselecting a seat and we have an active hold, release old hold then re-hold remaining
                    if (holdData && holdData.holdId) {
                        // release existing hold
                        try {
                            await fetch("/api/public/seat-hold", {
                                method: "DELETE",
                                headers: {
                                    ...getAuthHeaders(),
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ holdId: holdData.holdId }),
                            });
                        } catch (e) {
                            console.warn("failed to release previous hold", e);
                        }

                        // clear holdData locally
                        setHoldData(null);
                        setHoldCountdown(0);
                    }

                    // If there are remaining seats, create a new hold for them
                    if (nextFresh.length > 0) {
                        await holdSeatsFor(nextFresh);
                    }
                } catch (err) {
                    console.warn("auto hold/release error:", err);
                }
            })();
        }
    };

    // Helper: hold provided seat numbers (used for auto-hold on click)
    const holdSeatsFor = async (seatNumbers = []) => {
        if (!selectedBus?._id) return showAppToast("error", "Select a bus first");
        if (!travelDate) return showAppToast("error", "Select travel date");
        if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) return;

        // Guests must provide a phone number so holds are associated with them
        if (!isAdmin) {
            try {
                if (!customerPhone || !String(customerPhone).trim()) {
                    showAppToast("error", "Please enter your phone number before holding seats");
                    return null;
                }
            } catch (e) {
                // ignore
            }
        }

        try {
            setBlockingSeats(true);

            const res = await fetch("/api/public/seat-hold", {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ scheduleId: selectedBus._id, seatNumbers, guestPhoneNumber: customerPhone || null, guestEmail: customerEmail || null }),
            });

            const data = await res.json();
            if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to hold seats");

            setHoldData(data.data);
            // If server returned guestPhoneNumber and customerPhone is empty, auto-fill it
            try {
                if ((!customerPhone || !String(customerPhone).trim()) && data?.data?.guestPhoneNumber) {
                    setCustomerPhone(String(data.data.guestPhoneNumber || ""));
                }
            } catch (e) {
                // ignore
            }
            const expires = new Date(data.data.expiresAt).getTime();

            const tick = () => {
                const sec = Math.max(0, Math.floor((expires - Date.now()) / 1000));
                setHoldCountdown(sec);
                if (sec <= 0) setHoldData(null);
            };

            tick();
            const timer = setInterval(tick, 1000);
            setTimeout(() => clearInterval(timer), (data.data.holdDurationMinutes || 5) * 60 * 1000 + 2000);

            // Populate passengerDetails for held seats from current customerName
            setPassengerDetails((prev) => {
                const next = { ...prev };
                seatNumbers.forEach((seatNo) => {
                    const key = String(seatNo);
                    next[key] = {
                        seatNo: key,
                        passengerName: customerName.trim() || "",
                        passengerGender: next[key]?.passengerGender || customerGender || "",
                    };
                });
                return next;
            });

            showAppToast("success", data.message || "Seats held");
            return data.data;
        } catch (err) {
            console.error("holdSeatsFor error:", err);
            showAppToast("error", err.message || "Failed to hold seats");
            return null;
        } finally {
            setBlockingSeats(false);
        }
    };

    const handlePassengerNameChange = (seatNo, value) => {
        const key = String(seatNo);
        setPassengerDetails((prev) => ({
            ...prev,
            [key]: {
                seatNo: key,
                passengerName: value,
                passengerGender: prev[key]?.passengerGender || "",
            },
        }));
    };

    const handlePassengerGenderChange = (seatNo, gender) => {
        const key = String(seatNo);
        setPassengerDetails((prev) => ({
            ...prev,
            [key]: {
                seatNo: key,
                passengerName: prev[key]?.passengerName || customerName.trim() || "",
                passengerGender: gender,
            },
        }));
    };

    const handleViewBooking = (seatNoOrBooking, bookingData) => {
        if (!isAdmin) {
            showAppToast("info", "Seat is already booked");
            return;
        }

        // From seat click
        if (bookingData) {
            const seatNo = String(seatNoOrBooking || "");
            const booking = bookingData;

            const seatItems = getSeatItemsFromBooking(booking);
            const seatItem = seatItems.find((item) => String(item?.seatNo) === seatNo);

            setSelectedBookingDetail({
                seatNo,
                ticketNo: seatItem?.ticketNo || "",
                passengerName: seatItem?.passengerName || booking?.customerName || "",
                passengerGender:
                    seatItem?.passengerGender || booking?.customerGender || "",
                booking,
                bookingId: booking?._id || null,
                status:
                    String(seatItem?.seatStatus || booking?.seatStatus || "").toLowerCase() ===
                        "blocked"
                        ? "blocked"
                        : "booked",
                customerName: booking?.customerName || "",
                customerPhone: booking?.customerPhone || "",
                customerEmail: booking?.customerEmail || "",
                pickupName: booking?.pickupName || pickupStop?.name || "",
                dropName: booking?.dropName || dropStop?.name || "",
                pickupMarathi:
                    booking?.pickupMarathi || pickupStop?.marathiName || "",
                dropMarathi:
                    booking?.dropMarathi || dropStop?.marathiName || "",
                pickupTime: booking?.pickupTime || pickupStop?.time || "",
                dropTime: booking?.dropTime || dropStop?.time || "",
                fare: seatItem?.fare || booking?.fare || 0,
                bookingCode: booking?.bookingCode || "",
                paymentStatus: booking?.paymentStatus || "UNPAID",
                paymentMethod: booking?.paymentMethod || "UNPAID",
                seatItems,
            });

            setSeatDetailModalOpen(true);
            return;
        }

        // From booking list
        const booking = typeof seatNoOrBooking === "object" ? seatNoOrBooking : null;
        if (!booking) return;

        const seatItems = getSeatItemsFromBooking(booking);
        const firstSeatItem = seatItems[0] || null;
        const firstSeat = String(firstSeatItem?.seatNo || "");

        setSelectedBookingDetail({
            seatNo: firstSeat,
            ticketNo: firstSeatItem?.ticketNo || "",
            passengerName: firstSeatItem?.passengerName || booking?.customerName || "",
            passengerGender:
                firstSeatItem?.passengerGender || booking?.customerGender || "",
            booking,
            bookingId: booking?._id || null,
            status:
                String(firstSeatItem?.seatStatus || booking?.seatStatus || "").toLowerCase() ===
                    "blocked"
                    ? "blocked"
                    : "booked",
            customerName: booking?.customerName || "",
            customerPhone: booking?.customerPhone || "",
            customerEmail: booking?.customerEmail || "",
            pickupName: booking?.pickupName || pickupStop?.name || "",
            dropName: booking?.dropName || dropStop?.name || "",
            pickupMarathi:
                booking?.pickupMarathi || pickupStop?.marathiName || "",
            dropMarathi:
                booking?.dropMarathi || dropStop?.marathiName || "",
            pickupTime: booking?.pickupTime || pickupStop?.time || "",
            dropTime: booking?.dropTime || dropStop?.time || "",
            fare: firstSeatItem?.fare || booking?.fare || 0,
            bookingCode: booking?.bookingCode || "",
            paymentStatus: booking?.paymentStatus || "UNPAID",
            paymentMethod: booking?.paymentMethod || "UNPAID",
            seatItems,
        });

        setSeatDetailModalOpen(true);
    };

    const handleViewBlockedSeat = (seatNo) => {
        if (!isAdmin) {
            showAppToast("info", "Seat is blocked");
            return;
        }
        const seatKey = String(seatNo);

        const matchedBooking = existingBookings.find((booking) => {
            const seatItems = getSeatItemsFromBooking(booking);
            return seatItems.some((item) => String(item?.seatNo) === seatKey);
        });

        if (!matchedBooking) return;

        const seatItems = getSeatItemsFromBooking(matchedBooking);
        const seatItem = seatItems.find((item) => String(item?.seatNo) === seatKey);

        setSelectedBookingDetail({
            seatNo: seatKey,
            ticketNo: seatItem?.ticketNo || "",
            passengerName: seatItem?.passengerName || "Blocked Seat",
            passengerGender: seatItem?.passengerGender || "",
            booking: matchedBooking,
            bookingId: matchedBooking?._id,
            status: "blocked",
            customerName: matchedBooking?.customerName || "Blocked Seat",
            customerPhone: matchedBooking?.customerPhone || "BLOCKED",
            customerEmail: matchedBooking?.customerEmail || "",
            pickupName: matchedBooking?.pickupName || pickupStop?.name || "",
            dropName: matchedBooking?.dropName || dropStop?.name || "",
            pickupMarathi:
                matchedBooking?.pickupMarathi || pickupStop?.marathiName || "",
            dropMarathi:
                matchedBooking?.dropMarathi || dropStop?.marathiName || "",
            pickupTime: matchedBooking?.pickupTime || pickupStop?.time || "",
            dropTime: matchedBooking?.dropTime || dropStop?.time || "",
            fare: seatItem?.fare || matchedBooking?.fare || 0,
            bookingCode: matchedBooking?.bookingCode || "",
            paymentStatus: matchedBooking?.paymentStatus || "UNPAID",
            paymentMethod: matchedBooking?.paymentMethod || "OFFLINE_UNPAID",
            seatItems,
        });

        setSeatDetailModalOpen(true);
    };

    const resetForm = () => {
        setSelectedSeats([]);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setOverrideTotalFare("");
        setPassengerDetails({});
        setVoucherCodeInput("");
        setVoucherData(null);
        // release hold if present
        if (holdData?.holdId) {
            fetch("/api/public/seat-hold", {
                method: "DELETE",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ holdId: holdData.holdId }),
            }).catch(() => { });
        }
        setHoldData(null);
        setHoldCountdown(0);
    };

    const closeVoucherModal = () => {
        setVoucherModalOpen(false);
        // keep voucherData so admin can still see applied code in panel
    };

    const loadRazorpayScript = () => {
        if (typeof globalThis === "undefined") {
            return Promise.reject(
                new Error("Razorpay is not available in this environment")
            );
        }

        if (globalThis.Razorpay) {
            return Promise.resolve(globalThis.Razorpay);
        }

        if (razorpayLoadPromise) {
            return razorpayLoadPromise;
        }

        razorpayLoadPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector(
                'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
            );

            const resolveRazorpay = () => {
                if (globalThis.Razorpay) {
                    resolve(globalThis.Razorpay);
                } else {
                    reject(
                        new Error(
                            "Razorpay checkout script loaded but Razorpay object is missing"
                        )
                    );
                }
            };

            if (existingScript) {
                if (globalThis.Razorpay) {
                    return resolveRazorpay();
                }

                existingScript.addEventListener("load", resolveRazorpay, { once: true });
                existingScript.addEventListener(
                    "error",
                    () => reject(new Error("Failed to load Razorpay checkout")),
                    { once: true }
                );
                return;
            }

            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = resolveRazorpay;
            script.onerror = () =>
                reject(new Error("Failed to load Razorpay checkout"));
            document.body.appendChild(script);
        });

        return razorpayLoadPromise;
    };

    const verifyRazorpayPayment = async (payload) => {
        const res = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        return data;
    };

    const validatePassengerDetails = () => {
        if (selectedFreshSeats.length === 0) {
            showAppToast("error", "Please select at least one available seat");
            return false;
        }

        if (!customerName.trim()) {
            showAppToast("error", "Passenger name is required");
            return false;
        }

        if (!customerPhone.trim()) {
            showAppToast("error", "Phone number is required");
            return false;
        }

        // Phone number: accept inputs with country code or extra chars by
        // normalizing to the last 10 digits (local mobile number).
        const phoneDigits = String(customerPhone || "").replace(/\D/g, "");
        if (phoneDigits.length < 10) {
            showAppToast("error", "Phone number must contain at least 10 digits");
            return false;
        }

        // If user entered more than 10 digits (e.g., country code), normalize
        // to last 10 digits for validation and submission.
        if (phoneDigits.length > 10) {
            const last10 = phoneDigits.slice(-10);
            // update the visible field so user sees normalized value
            try {
                setCustomerPhone(last10);
            } catch (e) {
                // ignore
            }
        }

        // If email provided, perform basic validation (must contain @ and domain)
        if (customerEmail && String(customerEmail).trim()) {
            const email = String(customerEmail).trim();
            const simpleEmail = /\S+@\S+\.\S+/;
            if (!simpleEmail.test(email)) {
                showAppToast("error", "Please enter a valid email address (e.g. name@gmail.com)");
                return false;
            }

            const domain = (email.split("@")[1] || "").toLowerCase();
            const commonDomains = [
                "gmail.com",
                "yahoo.com",
                "outlook.com",
                "icloud.com",
                "apple.com",
                "hotmail.com",
                "aol.com",
            ];

            if (!commonDomains.includes(domain) && !domain.includes(".")) {
                showAppToast("error", "Please use a valid email domain (e.g. gmail.com, outlook.com, yahoo.com)");
                return false;
            }
        }

        for (const seatNo of selectedFreshSeats) {
            const item = passengerDetails[String(seatNo)] || {};
            const passengerName = String(item?.passengerName || customerName || "").trim();
            const passengerGender = String(item?.passengerGender || "").trim().toLowerCase();

            if (!passengerName) {
                showAppToast("error", `Passenger name is required for seat ${seatNo}`);
                return false;
            }

            if (!["male", "female", "other"].includes(passengerGender)) {
                showAppToast("error", `Please select gender for seat ${seatNo}`);
                return false;
            }
        }

        return true;
    };

    const handleCreateBooking = async (paymentMode) => {
        // allow anonymous guest bookings (no early redirect)
        if (paymentMode === "ONLINE") {
            return handleCreateOnlineBooking();
        }

        try {
            if (!selectedBus?._id) {
                return showAppToast("error", "Please select a bus first");
            }

            if (!travelDate) {
                return showAppToast("error", "Please select travel date");
            }

            if (!pickupStop || !dropStop) {
                return showAppToast("error", "Pickup and drop are required");
            }

            if (!validatePassengerDetails()) return;

            setSubmitting(true);

            const payload = {
                scheduleId: selectedBus._id,
                travelDate,
                seats: selectedFreshSeats,
                passengerDetails: passengerDetailsArray, // NEW
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                customerGender: customerGender.trim(),
                customerEmail: customerEmail.trim(),
                pickupName: pickupStop?.name || "",
                pickupMarathi: pickupStop?.marathiName || "",
                pickupTime: pickupStop?.time || "",
                dropName: dropStop?.name || "",
                dropMarathi: dropStop?.marathiName || "",
                dropTime: dropStop?.time || "",
                fare: defaultPerSeatFare,
                overrideTotalFare:
                    overrideTotalFare !== "" ? Number(overrideTotalFare) : null,
                voucherCode: voucherData?.voucherCode || String(voucherCodeInput || "").trim(),
                holdId: holdData?.holdId || null,
                paymentMode,
            };

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to create booking");
            }

            showAppToast("success", data?.message || "Booking created successfully");

            // Handle voucher consumption: if fully consumed remove from client state
            if (data?.voucherApplied) {
                const used = Number(data.voucherApplied.amountUsed || 0);
                const removed = Boolean(data.voucherApplied.voucherRemoved);
                const prevRemaining = Number(voucherData?.remainingAmount || voucherData?.originalAmount || 0);

                if (removed || used >= prevRemaining) {
                    setVoucherData(null);
                    setVoucherCodeInput("");
                } else {
                    // refresh voucher info from server
                    try {
                        const updated = await fetchVoucherByCode(data.voucherApplied.voucherCode);
                        setVoucherData(sanitizeVoucher(updated));
                    } catch (e) {
                        console.warn("Failed to refresh voucher after apply:", e);
                    }
                }

                showAppToast("success", `Voucher used: ${formatCurrency(used)}${removed ? " (consumed)" : ""}`);
            }

            resetForm();
            await loadExistingBookings();
        } catch (error) {
            console.error("handleCreateBooking error:", error);
            showAppToast("error", error.message || "Failed to create booking");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateOnlineBooking = async () => {
        // allow anonymous guest online booking (server will accept guest data when hold and guestPhone are provided)
        try {
            if (!selectedBus?._id) {
                return showAppToast("error", "Please select a bus first");
            }

            if (!travelDate) {
                return showAppToast("error", "Please select travel date");
            }

            if (!pickupStop || !dropStop) {
                return showAppToast("error", "Pickup and drop are required");
            }

            // Ensure seats selected and passenger details valid (phone/email)
            if (!validatePassengerDetails()) return;

            // For normal users ensure there's an active seat hold covering selected seats.
            let ensuredHold = null;
            if (!isAdmin) {
                const needed = selectedFreshSeats.map((s) => String(s));
                const holdCovers =
                    holdData &&
                    Array.isArray(holdData.seatNumbers) &&
                    needed.every((s) => (holdData.seatNumbers || []).map(String).includes(String(s)));

                if (!holdCovers) {
                    showAppToast("info", "Holding selected seats before booking...");
                    const newHold = await holdSeatsFor(needed);
                    ensuredHold = newHold;
                    if (!newHold || !Array.isArray(newHold.seatNumbers) || !needed.every((s) => newHold.seatNumbers.map(String).includes(String(s)))) {
                        showAppToast("error", "Failed to hold selected seats. Please try holding seats again.");
                        return;
                    }
                }
            }

            setSubmitting(true);
            setOnlinePaymentProcessing(true);

            const bookingPayload = {
                scheduleId: selectedBus._id,
                travelDate,
                seats: selectedFreshSeats,
                passengerDetails: passengerDetailsArray, // NEW
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                customerGender: customerGender.trim(),
                customerEmail: customerEmail.trim(),
                pickupName: pickupStop?.name || "",
                pickupMarathi: pickupStop?.marathiName || "",
                pickupTime: pickupStop?.time || "",
                dropName: dropStop?.name || "",
                dropMarathi: dropStop?.marathiName || "",
                dropTime: dropStop?.time || "",
                fare: defaultPerSeatFare,
                overrideTotalFare:
                    overrideTotalFare !== "" ? Number(overrideTotalFare) : null,
                voucherCode: voucherData?.voucherCode || String(voucherCodeInput || "").trim(),
                holdId: holdData?.holdId || (ensuredHold?.holdId || null),
                paymentMode: "ONLINE",
            };

            // Debug info: log which holdId and seatNumbers we're sending
            try {
                console.debug("Creating booking with holdId:", holdData?.holdId || (ensuredHold?.holdId || null));
                console.debug("Client hold seatNumbers:", (holdData?.seatNumbers || ensuredHold?.seatNumbers || selectedFreshSeats));
                console.debug("Requested seats:", selectedFreshSeats);
            } catch (e) {
                // ignore
            }

            const bookingRes = await fetch("/api/bookings", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(bookingPayload),
            });

            const bookingData = await bookingRes.json();

            if (!bookingRes.ok || !bookingData?.success) {
                throw new Error(
                    bookingData?.message || "Failed to create online booking"
                );
            }

            const booking = bookingData?.data;

            if (!booking?._id) {
                throw new Error("Booking created but booking ID missing");
            }

            if (Number(booking.finalPayableAmount || 0) <= 0) {
                showAppToast("success", "Booking created successfully. No payment required.");

                // Voucher handling for zero-pay bookings
                if (bookingData?.voucherApplied) {
                    const used = Number(bookingData.voucherApplied.amountUsed || 0);
                    const removed = Boolean(bookingData.voucherApplied.voucherRemoved);
                    const prevRemaining = Number(voucherData?.remainingAmount || voucherData?.originalAmount || 0);

                    if (removed || used >= prevRemaining) {
                        setVoucherData(null);
                        setVoucherCodeInput("");
                    } else {
                        try {
                            const updated = await fetchVoucherByCode(bookingData.voucherApplied.voucherCode);
                            setVoucherData(sanitizeVoucher(updated));
                        } catch (e) {
                            console.warn("Failed to refresh voucher after apply:", e);
                        }
                    }

                    showAppToast("success", `Voucher used: ${formatCurrency(used)}${removed ? " (consumed)" : ""}`);
                }

                resetForm();
                await loadExistingBookings();
                return;
            }

            const orderRes = await fetch("/api/payments/create-order", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ bookingId: booking._id }),
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok || !orderData?.success) {
                throw new Error(
                    orderData?.message || "Failed to create Razorpay order"
                );
            }

            if (!orderData?.data?.key || !orderData?.data?.razorpayOrderId) {
                throw new Error(
                    "Invalid Razorpay order response. Please check server configuration."
                );
            }

            const RazorpayConstructor = await loadRazorpayScript();

            if (!RazorpayConstructor) {
                throw new Error("Razorpay checkout constructor is not available");
            }

            const passengerName = customerName.trim();
            const passengerPhone = customerPhone.trim();
            const passengerEmail = customerEmail.trim();

            const options = {
                key: orderData.data.key,
                amount: orderData.data.razorpayAmount,
                currency:
                    orderData.data.razorpayCurrency ||
                    orderData.data.currency ||
                    "INR",
                name: selectedBus?.operatorName || "SA Tours & Travels",
                description: `Booking ${booking.bookingCode || booking._id}`,
                order_id: orderData.data.razorpayOrderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await verifyRazorpayPayment({
                            bookingId: booking._id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (!verifyRes?.success) {
                            throw new Error(
                                verifyRes?.message || "Payment verification failed"
                            );
                        }

                        showAppToast(
                            "success",
                            "Payment successful and booking confirmed"
                        );
                        resetForm();
                        await loadExistingBookings();
                    } catch (err) {
                        console.error("Razorpay verification error:", err);
                        showAppToast(
                            "error",
                            err.message || "Payment verification failed"
                        );
                        await loadExistingBookings();
                    } finally {
                        setSubmitting(false);
                        setOnlinePaymentProcessing(false);
                    }
                },
                modal: {
                    ondismiss: async function () {
                        console.warn("Razorpay popup closed by user");
                        showAppToast("error", "Payment cancelled / popup closed");
                        await loadExistingBookings();
                        setSubmitting(false);
                        setOnlinePaymentProcessing(false);
                    },
                },
                prefill: {
                    name: passengerName,
                    email: passengerEmail,
                    contact: passengerPhone,
                },
                theme: {
                    color: "#0B5D5A",
                },
            };

            const rzp = new RazorpayConstructor(options);

            if (typeof rzp.open !== "function") {
                throw new TypeError(
                    "Razorpay instance is invalid or checkout script failed to initialize"
                );
            }

            rzp.on("payment.failed", async function (response) {
                console.error("Razorpay payment failed:", response);
                showAppToast("error", "Razorpay payment failed. Please try again.");
                await loadExistingBookings();
                setSubmitting(false);
                setOnlinePaymentProcessing(false);
            });

            setTimeout(() => {
                rzp.open();
            }, 150);
        } catch (error) {
            console.error("handleCreateOnlineBooking error:", error);
            showAppToast("error", error.message || "Failed to process online booking");
            await loadExistingBookings();
            setSubmitting(false);
            setOnlinePaymentProcessing(false);
        }
    };

    const handleBlockSelectedSeats = async () => {
        try {
            if (!selectedBus?._id) {
                return showAppToast("error", "Please select a bus first");
            }

            if (!travelDate) {
                return showAppToast("error", "Please select travel date");
            }

            if (selectedFreshSeats.length === 0) {
                return showAppToast("error", "Select available seat(s) to block");
            }

            setBlockingSeats(true);

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    scheduleId: selectedBus._id,
                    travelDate,
                    seats: selectedFreshSeats,
                    customerName: "Blocked Seat",
                    customerPhone: "BLOCKED",
                    customerEmail: "",
                    pickupName: pickupStop?.name || "",
                    pickupMarathi: pickupStop?.marathiName || "",
                    pickupTime: pickupStop?.time || "",
                    dropName: dropStop?.name || "",
                    dropMarathi: dropStop?.marathiName || "",
                    dropTime: dropStop?.time || "",
                    fare: 0,
                    overrideTotalFare: 0,
                    paymentMode: "OFFLINE_UNPAID",
                    seatStatus: "blocked",
                    bookingStatus: "CANCELLED",
                    cancelActionType: "NO_REFUND",
                    isBlockSeat: true,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to block selected seats");
            }

            showAppToast("success", `Blocked seat(s): ${selectedFreshSeats.join(", ")}`);

            setSelectedSeats([]);
            setOverrideTotalFare("");
            setPassengerDetails({});
            await loadExistingBookings();
        } catch (error) {
            console.error("handleBlockSelectedSeats error:", error);
            showAppToast("error", error.message || "Failed to block selected seats");
        } finally {
            setBlockingSeats(false);
        }
    };

    const handleUnblockSelectedSeats = async () => {
        try {
            if (selectedBlockedSeats.length === 0) {
                return showAppToast("error", "Select blocked seat(s) to unblock");
            }

            setUnblockingSeats(true);

            const blockedBookings = existingBookings.filter((booking) => {
                const seatItems = getSeatItemsFromBooking(booking);
                const hasSelectedBlockedSeat = seatItems.some(
                    (item) =>
                        selectedBlockedSeats.includes(String(item?.seatNo)) &&
                        String(item?.seatStatus || "").toLowerCase() === "blocked"
                );

                return hasSelectedBlockedSeat;
            });

            for (const booking of blockedBookings) {
                const res = await fetch(`/api/bookings/${booking._id}`, {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                });

                const data = await res.json();

                if (!res.ok || !data?.success) {
                    throw new Error(data?.message || "Failed to unblock selected seats");
                }
            }

            showAppToast(
                "success",
                `Unblocked seat(s): ${selectedBlockedSeats.join(", ")}`
            );

            setSelectedSeats([]);
            setOverrideTotalFare("");
            setPassengerDetails({});
            await loadExistingBookings();
        } catch (error) {
            console.error("handleUnblockSelectedSeats error:", error);
            showAppToast("error", error.message || "Failed to unblock selected seats");
        } finally {
            setUnblockingSeats(false);
        }
    };

    const handleUpdateBooking = async (updatedValues) => {
        try {
            if (!selectedBookingDetail?.booking?._id) return;

            setEditLoading(true);

            const res = await fetch(
                `/api/bookings/${selectedBookingDetail.booking._id}`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify(updatedValues),
                }
            );

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to update booking");
            }

            showAppToast("success", data?.message || "Booking updated successfully");
            setSeatDetailModalOpen(false);
            setSelectedBookingDetail(null);
            await loadExistingBookings();
        } catch (error) {
            console.error("handleUpdateBooking error:", error);
            showAppToast("error", error.message || "Failed to update booking");
        } finally {
            setEditLoading(false);
        }
    };

    const handleCancelBooking = async (actionType) => {
        try {
            // Prefer explicit booking id from selectedBookingDetail, but
            // fall back to searching existingBookings by seat number.
            let bookingId =
                selectedBookingDetail?.booking?._id || selectedBookingDetail?.bookingId;

            // fallback: try to locate booking by seatNo in existingBookings
            if (!bookingId && selectedBookingDetail?.seatNo) {
                const seatKey = String(selectedBookingDetail.seatNo);
                const matched = existingBookings.find((booking) => {
                    const seatItems = getSeatItemsFromBooking(booking);
                    return seatItems.some((item) => String(item?.seatNo) === seatKey);
                });
                bookingId = matched?._id || bookingId;
                if (bookingId) {
                    console.warn("handleCancelBooking: resolved bookingId from existingBookings", bookingId);
                }
            }

            if (!bookingId) {
                console.warn("handleCancelBooking: bookingId not found on selectedBookingDetail", selectedBookingDetail);
                showAppToast("error", "Booking ID not found");
                return;
            }

            if (!selectedBookingDetail?.seatNo) {
                showAppToast("error", "Seat number not found");
                return;
            }

            // Pre-check latest seat status to avoid cancelling an already-cancelled seat
            const seatKey = String(selectedBookingDetail.seatNo || "");
            let currentSeatStatus = null;

            // Check in selectedBookingDetail.booking if available
            if (selectedBookingDetail?.booking?.seatItems) {
                const si = (selectedBookingDetail.booking.seatItems || []).find(
                    (it) => String(it?.seatNo) === seatKey
                );
                currentSeatStatus = si?.seatStatus || selectedBookingDetail?.status || null;
            }

            // Fallback: lookup in existingBookings
            if (!currentSeatStatus) {
                const matched = existingBookings.find((booking) => {
                    const items = getSeatItemsFromBooking(booking);
                    return items.some((item) => String(item?.seatNo) === seatKey);
                });

                if (matched) {
                    const items = getSeatItemsFromBooking(matched);
                    const si = items.find((it) => String(it?.seatNo) === seatKey);
                    currentSeatStatus = si?.seatStatus || null;
                }
            }

            if (String(currentSeatStatus || "").toLowerCase() === "cancelled") {
                showAppToast("error", `Seat ${seatKey} is already cancelled`);
                return;
            }

            setCancelLoading(true);

            const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    seatNo: selectedBookingDetail?.seatNo, // IMPORTANT
                    actionType,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                showAppToast("error", data?.message || "Failed to cancel booking");
                setCancelLoading(false);
                return;
            }

            showAppToast("success", data?.message || "Seat cancelled successfully");

            // If server created a voucher, surface it and prefill voucher input
            if (data?.voucher) {
                const v = data.voucher;
                setVoucherData(sanitizeVoucher(v));
                setVoucherCodeInput(v.voucherCode || "");

                // If server returned the updated booking object, copy contact info
                const returnedBooking = data?.data || selectedBookingDetail?.booking;
                if (returnedBooking) {
                    if (returnedBooking.customerName) setCustomerName(returnedBooking.customerName);
                    if (returnedBooking.customerPhone) setCustomerPhone(returnedBooking.customerPhone);
                    if (returnedBooking.customerEmail) setCustomerEmail(returnedBooking.customerEmail || "");
                }

                setVoucherModalOpen(true);
                showAppToast("success", `Voucher created: ${v.voucherCode} (₹${v.remainingAmount || 0})`);
            }

            setCancelModalOpen(false);
            setSeatDetailModalOpen(false);
            setSelectedBookingDetail(null);
            setSelectedSeats((prev) =>
                prev.filter((seat) => seat !== selectedBookingDetail?.seatNo)
            );

            await loadExistingBookings();
        } catch (error) {
            console.error("handleCancelBooking error:", error);
            showAppToast("error", error.message || "Failed to cancel booking");
        } finally {
            setCancelLoading(false);
        }
    };

    // Direct cancel helper for row-level actions (doesn't rely on selectedBookingDetail)
    const cancelBookingDirect = async (booking, seatNo, actionType = "NO_REFUND") => {
        try {
            if (!booking || !booking?._id) {
                showAppToast("error", "Booking id not found");
                return;
            }

            if (!seatNo) {
                showAppToast("error", "Seat number not provided");
                return;
            }

            const seatItems = getSeatItemsFromBooking(booking);
            const seatItem = (seatItems || []).find((it) => String(it?.seatNo) === String(seatNo));
            const currentSeatStatus = seatItem?.seatStatus || null;

            if (String(currentSeatStatus || "").toLowerCase() === "cancelled") {
                showAppToast("error", `Seat ${seatNo} is already cancelled`);
                return;
            }

            setCancelLoading(true);

            const res = await fetch(`/api/bookings/${booking._id}/cancel`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ seatNo, actionType }),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                showAppToast("error", data?.message || "Failed to cancel booking");
                setCancelLoading(false);
                return;
            }

            showAppToast("success", data?.message || "Seat cancelled successfully");

            if (data?.voucher) {
                const v = data.voucher;
                setVoucherData(sanitizeVoucher(v));
                setVoucherCodeInput(v.voucherCode || "");

                const returnedBooking = data?.data || booking;
                if (returnedBooking) {
                    if (returnedBooking.customerName) setCustomerName(returnedBooking.customerName);
                    if (returnedBooking.customerPhone) setCustomerPhone(returnedBooking.customerPhone);
                    if (returnedBooking.customerEmail) setCustomerEmail(returnedBooking.customerEmail || "");
                }

                setVoucherModalOpen(true);
                showAppToast("success", `Voucher created: ${v.voucherCode} (₹${v.remainingAmount || 0})`);
            }

            // If we were tracking selected seats, remove cancelled seat
            setSelectedSeats((prev) => prev.filter((seat) => String(seat) !== String(seatNo)));

            await loadExistingBookings();
        } catch (error) {
            console.error("cancelBookingDirect error:", error);
            showAppToast("error", error.message || "Failed to cancel booking");
        } finally {
            setCancelLoading(false);
        }
    };

    const handleUnblockBooking = async () => {
        try {
            if (!selectedBookingDetail?.bookingId) return;

            setCancelLoading(true);

            const res = await fetch(`/api/bookings/${selectedBookingDetail.bookingId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to unblock seat");
            }

            showAppToast("success", data?.message || "Seat unblocked successfully");

            setSeatDetailModalOpen(false);
            setSelectedBookingDetail(null);
            setSelectedSeats((prev) =>
                prev.filter((seat) => seat !== selectedBookingDetail?.seatNo)
            );

            await loadExistingBookings();
        } catch (error) {
            console.error("handleUnblockBooking error:", error);
            showAppToast("error", error.message || "Failed to unblock seat");
        } finally {
            setCancelLoading(false);
        }
    };

    if (!selectedBus) return null;

    const totalSeats = Number(selectedBus?.seatLayout || 39);

    /* =========================================================
       Voucher Created Modal (renders inside the same file)
    ========================================================= */
    function VoucherCreatedModal({ open, voucher, onClose }) {
        if (!open || !voucher) return null;

        const copyToClipboard = async (text) => {
            try {
                await navigator.clipboard.writeText(text);
                // Lightweight feedback - site uses toasts, but keep this function minimal
                // window.alert could be used but prefers toast from parent
            } catch (e) {
                console.warn("copy failed", e);
            }
        };

        return (
            <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-900/55 p-4" onClick={onClose}>
                <div className="w-full max-w-md rounded-lg bg-white p-6" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-bold">Voucher Issued</h3>
                    {/* <div className="mt-3 text-sm text-slate-700">
                        <div><strong>Code:</strong> {voucher.voucherCode}</div>
                        <div className="mt-1"><strong>ID:</strong> {voucher._id || voucher.id}</div>
                        <div className="mt-1"><strong>Remaining:</strong> {formatCurrency(voucher.remainingAmount || 0)}</div>
                        <div className="mt-1 text-xs text-slate-500"><strong>Expires:</strong> {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleString() : "-"}</div>
                        <div className="mt-1 text-xs text-slate-500"><strong>Guest:</strong> {voucher.guestName || ""} {voucher.guestPhoneNumber ? `• ${voucher.guestPhoneNumber}` : ""} {voucher.guestEmail ? `• ${voucher.guestEmail}` : ""}</div>
                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!voucher) return;
                                    if (voucher.guestName) setCustomerName(voucher.guestName);
                                    if (voucher.guestPhoneNumber) setCustomerPhone(voucher.guestPhoneNumber);
                                    if (voucher.guestEmail) setCustomerEmail(voucher.guestEmail);
                                }}
                                className="rounded-md bg-[#0B5D5A] px-3 py-1 text-xs font-semibold text-white"
                            >
                                Use guest
                            </button>
                        </div>
                    </div> */}

                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            onClick={() => copyToClipboard(voucher.voucherCode)}
                            className="rounded-md border px-3 py-2 text-sm bg-slate-50"
                        >
                            Copy Code
                        </button>

                        <button
                            type="button"
                            onClick={() => copyToClipboard(voucher._id || voucher.id || "")}
                            className="rounded-md border px-3 py-2 text-sm bg-slate-50"
                        >
                            Copy ID
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="ml-auto rounded-md bg-[#0B5D5A] px-4 py-2 text-sm font-bold text-white"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    const availableCount = Math.max(
        totalSeats - bookedSeats.length - blockedSeats.length,
        0
    );

    return (
        <>
            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                {/* Header */}
                <div className="border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0B5D5A]">
                                Seat Layout View
                            </div>

                            <div className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
                                {selectedBus?.busNumber} — {selectedBus?.routeName}
                            </div>

                            <div className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
                                {pickupStop?.name || "-"} → {dropStop?.name || "-"} •{" "}
                                {pickupStop?.time || "--:--"} → {dropStop?.time || "--:--"}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                            {isAdmin && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setPrintModalOpen(true)}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50"
                                    >
                                        <Printer className="h-4.5 w-4.5" />
                                        Print
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPrintModalOpen(true)}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#0B5D5A] to-[#0A524F] px-4 text-sm font-bold text-white shadow-[0_8px_18px_rgba(11,93,90,0.18)] transition-all duration-200 hover:from-[#094B49] hover:to-[#083F3E]"
                                    >
                                        <Download className="h-4.5 w-4.5" />
                                        PDF
                                    </button>
                                </>
                            )}

                            <button
                                type="button"
                                onClick={onCloseBus}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-slate-300 bg-white text-slate-600 transition-all duration-200 hover:bg-slate-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 gap-3 border-b border-slate-200 px-4 py-4 sm:grid-cols-2 sm:px-5 xl:grid-cols-4">
                    <TopInfoCard
                        icon={<BusFront className="h-5 w-5" />}
                        label="Bus Number"
                        value={selectedBus?.busNumber}
                    />
                    <TopInfoCard
                        icon={<BusFront className="h-5 w-5" />}
                        label="Seat Layout"
                        value={`${totalSeats} Seats`}
                    />
                    <TopInfoCard
                        icon={<CalendarDays className="h-5 w-5" />}
                        label="Date"
                        value={travelDate}
                    />
                    <TopInfoCard
                        icon={<Printer className="h-5 w-5" />}
                        label="Time"
                        value={`${pickupStop?.time || "--:--"} → ${dropStop?.time || "--:--"}`}
                    />
                </div>

                {/* Main Layout */}
                <div className={isAdmin ? "grid grid-cols-1 gap-5 p-4 sm:p-5 xl:grid-cols-[1.5fr_0.9fr]" : "grid grid-cols-1 gap-5 p-4 sm:p-5"}>
                    {/* LEFT */}
                    <div className="space-y-5">
                        {/* Seat Layout */}
                        <div className="rounded-[22px] border border-[#D7ECEA] bg-[#F8FCFC] p-4 sm:p-5">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                        Bus Seat Layout
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500 sm:text-base">
                                        View the selected bus seat structure.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full border border-[#CFE5E3] bg-white px-4 py-1.5 text-sm font-bold text-[#0B5D5A]">
                                        Available: {availableCount}
                                    </span>
                                    <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-bold text-orange-700">
                                        Blocked: {blockedSeats.length}
                                    </span>
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="mb-4 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={handleBlockSelectedSeats}
                                        disabled={blockingSeats || selectedFreshSeats.length === 0}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[#EAB308] px-4 text-sm font-bold text-white transition hover:bg-[#CA8A04] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Ban className="h-4 w-4" />
                                        {blockingSeats ? "Blocking..." : "Block Selected Seats"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleUnblockSelectedSeats}
                                        disabled={unblockingSeats || selectedBlockedSeats.length === 0}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Ban className="h-4 w-4" />
                                        {unblockingSeats ? "Unblocking..." : "Unblock Selected Seats"}
                                    </button>
                                </div>
                            )}

                            <div className="rounded-[20px] border border-slate-200 bg-white p-3 sm:p-4">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-lg font-bold text-slate-900">
                                        Seat Layout ({totalSeats})
                                    </div>

                                    <div className="rounded-full bg-slate-50 px-3 py-1.5 text-sm font-bold text-[#0B5D5A]">
                                        Selected: {selectedSeats.length}
                                    </div>
                                </div>

                                <SeatLayout
                                    layout={String(selectedBus?.seatLayout || 39)}
                                    bookedSeats={bookedSeats}
                                    blockedSeats={blockedSeats}
                                    bookedMap={bookedMap}
                                    selectedSeats={selectedSeats}
                                    onSelect={handleSeatSelect}
                                    onViewBooking={handleViewBooking}
                                    onBlockedSeat={handleViewBlockedSeat}
                                />
                            </div>
                        </div>

                        {/* Passenger Details */}
                        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                            <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                        Passenger Details
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500 sm:text-base">
                                        Fill passenger details and confirm booking
                                    </p>
                                </div>

                                <div className="rounded-full border border-[#CFE5E3] bg-white px-4 py-1.5 text-sm font-bold text-[#0B5D5A]">
                                    {selectedSeats.length === 0
                                        ? "No Seat Selected"
                                        : `${selectedSeats.length} Seat(s) Selected`}
                                </div>
                            </div>

                            <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                                {/* Booking Owner Name */}
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                                        Booking Customer Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Enter booking customer name"
                                            className="h-12 w-full rounded-[16px] border border-slate-300 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                        />

                                        {selectedBookingDetail?.booking ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const b = selectedBookingDetail.booking;
                                                    if (!b) return;
                                                    if (b.customerName) setCustomerName(b.customerName);
                                                    if (b.customerPhone) setCustomerPhone(b.customerPhone);
                                                    if (b.customerEmail) setCustomerEmail(b.customerEmail || "");

                                                    // also fill seat passenger for the focused seat
                                                    const seatKey = String(selectedBookingDetail.seatNo || "");
                                                    if (seatKey) {
                                                        setPassengerDetails((prev) => ({
                                                            ...prev,
                                                            [seatKey]: {
                                                                seatNo: seatKey,
                                                                passengerName: selectedBookingDetail.passengerName || b.customerName || "",
                                                                passengerGender: selectedBookingDetail.passengerGender || b.customerGender || "",
                                                            },
                                                        }));
                                                    }
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-[#0B5D5A] px-3 py-1 text-xs font-semibold text-white"
                                            >
                                                Use booking
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Phone + Email */}
                                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                placeholder="Enter phone number"
                                                className="h-12 w-full rounded-[16px] border border-slate-300 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="email"
                                                value={customerEmail}
                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                                placeholder="Enter email"
                                                className="h-12 w-full rounded-[16px] border border-slate-300 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Selected seats */}
                                <div className="mt-4 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3">
                                    <div className="text-sm font-semibold text-slate-500">
                                        Selected Seat(s):{" "}
                                        <span className="font-bold text-slate-900">
                                            {selectedSeats.length > 0 ? selectedSeats.join(", ") : "—"}
                                        </span>
                                    </div>
                                </div>

                                {/* NEW: Seat-wise Passenger Details with Radio Buttons */}
                                {selectedFreshSeats.length > 0 && (
                                    <div className="mt-4 rounded-[18px] border border-[#D7ECEA] bg-[#F8FCFC] p-4">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Users className="h-5 w-5 text-[#0B5D5A]" />
                                            <div className="text-base font-bold text-slate-900">
                                                Seat-wise Passenger Details
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {selectedFreshSeats.map((seatNo) => {
                                                const item = passengerDetails[String(seatNo)] || {
                                                    seatNo: String(seatNo),
                                                    passengerName: customerName.trim() || "",
                                                    passengerGender: "",
                                                };

                                                return (
                                                    <div
                                                        key={seatNo}
                                                        className="rounded-[16px] border border-[#CFE5E3] bg-white p-4"
                                                    >
                                                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                            <div className="text-sm font-bold text-[#0B5D5A]">
                                                                Seat {seatNo}
                                                            </div>

                                                            <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                                                                {formatCurrency(effectivePerSeatFare)}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                            {/* Passenger Name */}
                                                            <div>
                                                                <label className="mb-2 block text-sm font-semibold text-slate-800">
                                                                    Passenger Name <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={item?.passengerName || ""}
                                                                    onChange={(e) =>
                                                                        handlePassengerNameChange(
                                                                            seatNo,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder={`Enter name for seat ${seatNo}`}
                                                                    className="h-11 w-full rounded-[14px] border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                                                />
                                                            </div>

                                                            {/* Gender Radio Buttons */}
                                                            <div>
                                                                <label className="mb-2 block text-sm font-semibold text-slate-800">
                                                                    Gender <span className="text-red-500">*</span>
                                                                </label>

                                                                <div className="flex flex-wrap gap-3">
                                                                    {["male", "female", "other"].map((gender) => {
                                                                        const active =
                                                                            item?.passengerGender === gender;

                                                                        return (
                                                                            <label
                                                                                key={gender}
                                                                                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${active
                                                                                    ? "border-[#0B5D5A] bg-[#0B5D5A] text-white"
                                                                                    : "border-slate-300 bg-white text-slate-700 hover:border-[#0B5D5A]"
                                                                                    }`}
                                                                            >
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`gender-${seatNo}`}
                                                                                    value={gender}
                                                                                    checked={item?.passengerGender === gender}
                                                                                    onChange={() =>
                                                                                        handlePassengerGenderChange(
                                                                                            seatNo,
                                                                                            gender
                                                                                        )
                                                                                    }
                                                                                    className="hidden"
                                                                                />
                                                                                {gender.charAt(0).toUpperCase() + gender.slice(1)}
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Mini cards */}
                                <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                                    <MiniInfoCard
                                        title="PICKUP"
                                        value={`${pickupStop?.name || "-"} (${pickupStop?.time || "--:--"})`}
                                    />
                                    <MiniInfoCard
                                        title="DROP"
                                        value={`${dropStop?.name || "-"} (${dropStop?.time || "--:--"})`}
                                    />
                                    <MiniInfoCard
                                        title="TOTAL FARE"
                                        value={formatCurrency(effectiveTotalFare)}
                                        highlight
                                    />
                                </div>

                                {/* Voucher Apply */}
                                <div className="mt-3 rounded-[12px] border border-slate-200 bg-white p-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={voucherCodeInput}
                                            onChange={(e) => setVoucherCodeInput(e.target.value)}
                                            placeholder="Enter voucher code to apply"
                                            className="h-10 w-full rounded-[10px] border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-[#0B5D5A]"
                                        />
                                        <button
                                            type="button"
                                            onClick={applyVoucher}
                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#0B5D5A] px-4 text-sm font-bold text-white"
                                        >
                                            Apply
                                        </button>
                                        <button
                                            type="button"
                                            onClick={holdSeats}
                                            disabled={blockingSeats || selectedFreshSeats.length === 0}
                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 ml-2"
                                        >
                                            {blockingSeats ? "Holding..." : "Hold seats"}
                                        </button>
                                    </div>

                                    {voucherData && (
                                        <div className="mt-3 text-sm text-slate-700">
                                            <div>
                                                <strong>Voucher:</strong> {voucherData.voucherCode} • Remaining: {formatCurrency(voucherData.remainingAmount || 0)}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">Fare: {formatCurrency(defaultTotalFare)} • After voucher: {formatCurrency(effectiveTotalFare)}</div>
                                            <div className="mt-1 text-xs text-slate-500">Expires: {voucherData.expiresAt ? new Date(voucherData.expiresAt).toLocaleString() : "-"}</div>
                                            <div className="mt-1 text-xs text-slate-500">Voucher ID: {voucherData._id || voucherData.id || "-"} • Status: {voucherData.status || "-"}</div>
                                            <div className="mt-1 text-xs text-slate-500">Guest: {voucherData.guestName || ""} {voucherData.guestPhoneNumber ? `• ${voucherData.guestPhoneNumber}` : ""} {voucherData.guestEmail ? `• ${voucherData.guestEmail}` : ""}</div>
                                            <div className="mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // autofill form from voucher guest
                                                        if (!voucherData) return;
                                                        if (voucherData.guestName) setCustomerName(voucherData.guestName);
                                                        if (voucherData.guestPhoneNumber) setCustomerPhone(voucherData.guestPhoneNumber);
                                                        if (voucherData.guestEmail) setCustomerEmail(voucherData.guestEmail);
                                                    }}
                                                    className="rounded-md bg-[#0B5D5A] px-3 py-1 text-xs font-semibold text-white"
                                                >
                                                    Use guest
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {holdData && (
                                        <div className="mt-3 text-sm text-slate-700">
                                            <div>
                                                <strong>Hold:</strong> Seats held: {holdData.seatNumbers.join(", ")}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">Expires in: {Math.floor(holdCountdown / 60)}:{String(holdCountdown % 60).padStart(2, "0")}</div>
                                            <div className="mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // release hold
                                                        if (!holdData?.holdId) return;
                                                        fetch("/api/public/seat-hold", {
                                                            method: "DELETE",
                                                            headers: {
                                                                ...getAuthHeaders(),
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({ holdId: holdData.holdId }),
                                                        })
                                                            .then(() => {
                                                                setHoldData(null);
                                                                setHoldCountdown(0);
                                                                showAppToast("success", "Hold released");
                                                            })
                                                            .catch(() => showAppToast("error", "Failed to release hold"));
                                                    }}
                                                    className="rounded-md bg-white border px-3 py-1 text-xs font-semibold text-slate-700"
                                                >
                                                    Release hold
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Admin Fare Control */}
                                {isAdmin && (
                                    <div className="mt-4 rounded-[18px] border border-orange-200 bg-orange-50/40 p-4">
                                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <div className="text-sm font-bold uppercase tracking-[0.14em] text-orange-700">
                                                    Admin Fare Control
                                                </div>
                                                <div className="mt-1 text-sm text-slate-600">
                                                    Override total fare manually for this booking.
                                                </div>
                                            </div>

                                            <div className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold text-orange-700">
                                                Admin / Staff Access
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                                            <MiniInfoCard
                                                title="FARE PER SEAT"
                                                value={formatCurrency(defaultPerSeatFare)}
                                            />

                                            <MiniInfoCard
                                                title="EFFECTIVE PER SEAT"
                                                value={formatCurrency(effectivePerSeatFare)}
                                                highlight
                                            />

                                            <div className="rounded-[16px] border border-orange-200 bg-white p-4">
                                                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                                    OVERRIDE TOTAL FARE
                                                </div>

                                                <div className="mt-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={overrideTotalFare}
                                                        onChange={(e) => setOverrideTotalFare(e.target.value)}
                                                        placeholder="Enter total fare"
                                                        className="h-12 w-full rounded-[14px] border border-slate-300 bg-white px-4 text-base font-semibold text-slate-900 outline-none transition-all duration-200 focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setOverrideTotalFare("")}
                                                    className="mt-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                                                >
                                                    Reset to Auto Fare
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Buttons */}
                                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <PaymentButton
                                        label="Online"
                                        color="teal"
                                        disabled={
                                            submitting ||
                                            onlinePaymentProcessing ||
                                            selectedFreshSeats.length === 0 ||
                                            !customerName.trim() ||
                                            !customerPhone.trim()
                                        }
                                        loading={onlinePaymentProcessing}
                                        onClick={() => handleCreateBooking("ONLINE")}
                                    />
                                    {isAdmin ? (
                                        <>
                                            <PaymentButton
                                                label="Cash"
                                                color="orange"
                                                disabled={
                                                    submitting ||
                                                    selectedFreshSeats.length === 0 ||
                                                    !customerName.trim() ||
                                                    !customerPhone.trim()
                                                }
                                                onClick={() => handleCreateBooking("OFFLINE_CASH")}
                                            />
                                            <PaymentButton
                                                label="UPI"
                                                color="slate"
                                                disabled={
                                                    submitting ||
                                                    selectedFreshSeats.length === 0 ||
                                                    !customerName.trim() ||
                                                    !customerPhone.trim()
                                                }
                                                onClick={() => handleCreateBooking("OFFLINE_UPI")}
                                            />
                                            <PaymentButton
                                                label="Unpaid"
                                                color="red"
                                                disabled={
                                                    submitting ||
                                                    selectedFreshSeats.length === 0 ||
                                                    !customerName.trim() ||
                                                    !customerPhone.trim()
                                                }
                                                onClick={() => handleCreateBooking("OFFLINE_UNPAID")}
                                            />
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    {isAdmin && (
                        <ExistingBookingsPanel
                            loading={loadingBookings}
                            bookings={existingBookings}
                            onViewBooking={(booking, seatNo) => {
                                const seatItems = getSeatItemsFromBooking(booking);
                                const firstSeatItem = seatItems.find((it) => String(it?.seatNo) === String(seatNo)) || seatItems[0] || null;
                                const firstSeat = String(firstSeatItem?.seatNo || seatNo || "");

                                setSelectedBookingDetail({
                                    seatNo: firstSeat,
                                    ticketNo: firstSeatItem?.ticketNo || "",
                                    passengerName:
                                        firstSeatItem?.passengerName || booking?.customerName || "",
                                    passengerGender:
                                        firstSeatItem?.passengerGender ||
                                        booking?.customerGender ||
                                        "",
                                    booking,
                                    bookingId: booking?._id,
                                    status:
                                        String(
                                            firstSeatItem?.seatStatus || booking?.seatStatus || ""
                                        ).toLowerCase() === "blocked"
                                            ? "blocked"
                                            : "booked",
                                    customerName: booking?.customerName || "",
                                    customerPhone: booking?.customerPhone || "",
                                    customerEmail: booking?.customerEmail || "",
                                    pickupName: booking?.pickupName || pickupStop?.name || "",
                                    dropName: booking?.dropName || dropStop?.name || "",
                                    pickupMarathi:
                                        booking?.pickupMarathi || pickupStop?.marathiName || "",
                                    dropMarathi:
                                        booking?.dropMarathi || dropStop?.marathiName || "",
                                    pickupTime: booking?.pickupTime || pickupStop?.time || "",
                                    dropTime: booking?.dropTime || dropStop?.time || "",
                                    fare: firstSeatItem?.fare || booking?.fare || 0,
                                    bookingCode: booking?.bookingCode || "",
                                    paymentStatus: booking?.paymentStatus || "UNPAID",
                                    paymentMethod: booking?.paymentMethod || "UNPAID",
                                    seatItems,
                                });

                                // Only open admin modal for admins
                                if (isAdmin) setSeatDetailModalOpen(true);
                            }}
                            onViewBlockedSeat={handleViewBlockedSeat}
                            onCancel={!isAdmin ? cancelBookingDirect : undefined}
                            onIssueVoucher={!isAdmin ? (b, s) => cancelBookingDirect(b, s, "ISSUE_VOUCHER") : undefined}
                        />
                    )}
                </div>
            </section>

            {/* Seat detail modal (admin only) */}
            {isAdmin && (
                <SeatBookingDetailsModal
                    open={seatDetailModalOpen}
                    data={selectedBookingDetail}
                    loading={cancelLoading || editLoading}
                    onClose={() => {
                        setSeatDetailModalOpen(false);
                        setSelectedBookingDetail(null);
                    }}
                    onEdit={handleUpdateBooking}
                    onCancel={() => {
                        setCancelModalOpen(true);
                    }}
                    onUnblock={handleUnblockBooking}
                />
            )}

            {/* Voucher created popup */}
            <VoucherCreatedModal open={voucherModalOpen} voucher={voucherData} onClose={closeVoucherModal} />

            {/* Cancel modal (admin only) */}
            {isAdmin && (
                <CancelBookingModal
                    open={cancelModalOpen}
                    seatNo={selectedBookingDetail?.seatNo}
                    ticketNo={selectedBookingDetail?.ticketNo}
                    passengerName={selectedBookingDetail?.passengerName}
                    passengerGender={
                        selectedBookingDetail?.passengerGender ||
                        bookedMap[String(selectedBookingDetail?.seatNo || "")]?.passengerGender ||
                        bookedMap[String(selectedBookingDetail?.seatNo || "")]?.gender ||
                        ""
                    }
                    loading={cancelLoading}
                    onClose={() => setCancelModalOpen(false)}
                    onRefundOriginal={() => handleCancelBooking("REFUND_ORIGINAL")}
                    onIssueVoucher={() => handleCancelBooking("ISSUE_VOUCHER")}
                    onMarkCancelled={() => handleCancelBooking("NO_REFUND")}
                />
            )}

            {/* Print modal */}
            <PrintSeatTemplateModal
                open={printModalOpen}
                onClose={() => setPrintModalOpen(false)}
                selectedBus={selectedBus}
                date={travelDate}
                bookings={existingBookings}
                seatLayout={String(selectedBus?.seatLayout || 39)}
            />
        </>
    );
}

function TopInfoCard({ icon, label, value }) {
    return (
        <div className="rounded-[18px] border border-[#D7ECEA] bg-[#F8FCFC] p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-[#0B5D5A] ring-1 ring-[#CFE5E3]">
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {label}
                    </div>
                    <div className="mt-1 truncate text-lg font-bold text-slate-900">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MiniInfoCard({ title, value, highlight = false }) {
    return (
        <div
            className={`rounded-[16px] border p-4 ${highlight
                ? "border-[#CFE5E3] bg-[#F8FCFC]"
                : "border-slate-200 bg-slate-50"
                }`}
        >
            <div
                className={`text-[11px] font-bold uppercase tracking-[0.18em] ${highlight ? "text-[#0B5D5A]" : "text-slate-500"
                    }`}
            >
                {title}
            </div>
            <div
                className={`mt-2 text-base font-bold leading-snug sm:text-lg ${highlight ? "text-[#0B5D5A]" : "text-slate-900"
                    }`}
            >
                {value}
            </div>
        </div>
    );
}

function PaymentButton({ label, color, onClick, disabled, loading = false }) {
    const styles = {
        teal: "bg-gradient-to-r from-[#0B5D5A] to-[#0A524F] text-white hover:from-[#094B49] hover:to-[#083F3E] shadow-[0_8px_16px_rgba(11,93,90,0.18)]",
        orange:
            "bg-[#F97316] text-white hover:bg-[#EA580C] shadow-[0_8px_16px_rgba(249,115,22,0.18)]",
        slate:
            "bg-slate-800 text-white hover:bg-slate-900 shadow-[0_8px_16px_rgba(30,41,59,0.16)]",
        red: "bg-white border border-red-300 text-red-600 hover:bg-red-50",
    };

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`inline-flex h-11 items-center justify-center rounded-[16px] px-4 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${styles[color]}`}
        >
            {loading ? "Processing..." : label}
        </button>
    );
}