"use client";

import {
    BusFront,
    Download,
    Mail,
    Phone,
    Printer,
    User,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

export default function BookingProcessPanel({
    selectedBus,
    travelDate,
    pickupStop,
    dropStop,
    onCloseBus,
}) {
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [existingBookings, setExistingBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    const [seatDetailModalOpen, setSeatDetailModalOpen] = useState(false);
    const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [blockModalOpen, setBlockModalOpen] = useState(false);

    const [cancelLoading, setCancelLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [blockLoading, setBlockLoading] = useState(false);
    const [blockSeatNo, setBlockSeatNo] = useState("");
    const [blockReason, setBlockReason] = useState("");

    useEffect(() => {
        if (selectedBus?._id && travelDate) {
            loadExistingBookings();
        } else {
            setExistingBookings([]);
            setSelectedSeats([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBus?._id, travelDate]);

    const bookedMap = useMemo(() => {
        const map = {};

        existingBookings.forEach((booking) => {
            const seats = Array.isArray(booking?.seats) ? booking.seats : [];

            seats.forEach((seatNo) => {
                map[String(seatNo)] = {
                    bookingId: booking?._id,
                    status:
                        booking?.bookingStatus === "CANCELLED"
                            ? "blocked"
                            : booking?.seatStatus || "booked",
                    customerName: booking?.customerName || "",
                    customerPhone: booking?.customerPhone || "",
                    customerEmail: booking?.customerEmail || "",
                    pickupName: booking?.pickupName || pickupStop?.name || "",
                    dropName: booking?.dropName || dropStop?.name || "",
                    pickupMarathi: booking?.pickupMarathi || pickupStop?.marathiName || "",
                    dropMarathi: booking?.dropMarathi || dropStop?.marathiName || "",
                    pickupTime: booking?.pickupTime || pickupStop?.time || "",
                    dropTime: booking?.dropTime || dropStop?.time || "",
                    fare: booking?.finalPayableAmount || booking?.fare || 0,
                    bookingCode: booking?.bookingCode || "",
                    paymentStatus: booking?.paymentStatus || "UNPAID",
                    paymentMethod: booking?.paymentMethod || "UNPAID",
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

    const selectedFare = useMemo(() => {
        const perSeat = Number(selectedBus?.fare || 0);
        return perSeat * selectedSeats.length;
    }, [selectedBus, selectedSeats]);

    const loadExistingBookings = async () => {
        try {
            setLoadingBookings(true);

            const params = new URLSearchParams({
                scheduleId: selectedBus?._id || "",
                date: travelDate || "",
            });

            const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to load existing bookings");
            }

            setExistingBookings(Array.isArray(data?.data) ? data.data : []);
        } catch (error) {
            console.error("loadExistingBookings error:", error);
            setExistingBookings([]);
            showAppToast("error", error.message || "Failed to load existing bookings");
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleSeatSelect = (seatNo) => {
        setSelectedSeats((prev) => {
            const key = String(seatNo);
            if (prev.includes(key)) {
                return prev.filter((item) => item !== key);
            }
            return [...prev, key];
        });
    };

    const handleViewBooking = (seatNo, bookingData) => {
        if (!bookingData) return;

        const matchedBooking = existingBookings.find((booking) =>
            (booking?.seats || []).map(String).includes(String(seatNo))
        );

        setSelectedBookingDetail({
            seatNo: String(seatNo),
            ...bookingData,
            booking: matchedBooking || null,
        });
        setSeatDetailModalOpen(true);
    };

    const handleViewBlockedSeat = (seatNo) => {
        const matchedBooking = existingBookings.find((booking) =>
            (booking?.seats || []).map(String).includes(String(seatNo))
        );

        if (!matchedBooking) {
            return;
        }

        setSelectedBookingDetail({
            seatNo: String(seatNo),
            booking: matchedBooking,
            bookingId: matchedBooking?._id,
            status: "blocked",
            customerName: matchedBooking?.customerName || "Blocked Seat",
            customerPhone: matchedBooking?.customerPhone || "BLOCKED",
            customerEmail: matchedBooking?.customerEmail || "",
            pickupName: matchedBooking?.pickupName || pickupStop?.name || "",
            dropName: matchedBooking?.dropName || dropStop?.name || "",
            pickupMarathi: matchedBooking?.pickupMarathi || pickupStop?.marathiName || "",
            dropMarathi: matchedBooking?.dropMarathi || dropStop?.marathiName || "",
            pickupTime: matchedBooking?.pickupTime || pickupStop?.time || "",
            dropTime: matchedBooking?.dropTime || dropStop?.time || "",
            fare: matchedBooking?.finalPayableAmount || matchedBooking?.fare || 0,
            bookingCode: matchedBooking?.bookingCode || "",
            paymentStatus: matchedBooking?.paymentStatus || "UNPAID",
            paymentMethod: matchedBooking?.paymentMethod || "OFFLINE_UNPAID",
        });
        setSeatDetailModalOpen(true);
    };

    const resetForm = () => {
        setSelectedSeats([]);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
    };

    const handleCreateBooking = async (paymentMode) => {
        try {
            if (!selectedBus?._id) return showAppToast("error", "Please select a bus first");
            if (!travelDate) return showAppToast("error", "Please select travel date");
            if (!pickupStop || !dropStop) return showAppToast("error", "Pickup and drop are required");
            if (selectedSeats.length === 0) return showAppToast("error", "Please select at least one seat");
            if (!customerName.trim()) return showAppToast("error", "Passenger name is required");
            if (!customerPhone.trim()) return showAppToast("error", "Phone number is required");

            setSubmitting(true);

            const payload = {
                scheduleId: selectedBus._id,
                travelDate,
                seats: selectedSeats,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                customerEmail: customerEmail.trim(),
                pickupName: pickupStop?.name || "",
                pickupMarathi: pickupStop?.marathiName || "",
                pickupTime: pickupStop?.time || "",
                dropName: dropStop?.name || "",
                dropMarathi: dropStop?.marathiName || "",
                dropTime: dropStop?.time || "",
                fare: Number(selectedBus?.fare || 0),
                paymentMode,
            };

            const res = await fetch("/api/admin/bookings", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to create booking");
            }

            showAppToast("success", "Booking created successfully");
            resetForm();
            await loadExistingBookings();
        } catch (error) {
            console.error("handleCreateBooking error:", error);
            showAppToast("error", error.message || "Failed to create booking");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBlockSeat = async () => {
        try {
            if (!selectedBus?._id) return showAppToast("error", "Please select a bus first");
            if (!travelDate) return showAppToast("error", "Please select travel date");
            if (!blockSeatNo) return showAppToast("error", "Please select a seat number to block");

            const seatNo = String(blockSeatNo).trim();
            const alreadyBooked = bookedMap[seatNo];

            if (alreadyBooked) {
                showAppToast("error", `Seat ${seatNo} is already occupied`);
                return;
            }

            setBlockLoading(true);

            const res = await fetch("/api/admin/bookings", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    scheduleId: selectedBus._id,
                    travelDate,
                    seats: [seatNo],
                    customerName: "Blocked Seat",
                    customerPhone: "BLOCKED",
                    customerEmail: blockReason.trim(),
                    pickupName: pickupStop?.name || "",
                    pickupMarathi: pickupStop?.marathiName || "",
                    pickupTime: pickupStop?.time || "",
                    dropName: dropStop?.name || "",
                    dropMarathi: dropStop?.marathiName || "",
                    dropTime: dropStop?.time || "",
                    fare: 0,
                    paymentMode: "OFFLINE_UNPAID",
                    seatStatus: "blocked",
                    bookingStatus: "CANCELLED",
                    cancelActionType: "NO_REFUND",
                    isBlockSeat: true,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to block seat");
            }

            showAppToast("success", `Seat ${seatNo} blocked successfully`);
            setBlockModalOpen(false);
            setBlockSeatNo("");
            setBlockReason("");
            await loadExistingBookings();
        } catch (error) {
            console.error("handleBlockSeat error:", error);
            showAppToast("error", error.message || "Failed to block seat");
        } finally {
            setBlockLoading(false);
        }
    };

    const handleUpdateBooking = async (updatedValues) => {
        try {
            if (!selectedBookingDetail?.booking?._id) return;

            setEditLoading(true);

            const res = await fetch(`/api/admin/bookings/${selectedBookingDetail.booking._id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(updatedValues),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to update booking");
            }

            showAppToast("success", "Booking updated successfully");
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
            if (!selectedBookingDetail?.booking?._id) return;

            setCancelLoading(true);

            const res = await fetch(`/api/admin/bookings/${selectedBookingDetail.booking._id}/cancel`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ actionType }),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to cancel booking");
            }

            showAppToast("success", data?.message || "Booking cancelled successfully");

            setCancelModalOpen(false);
            setSeatDetailModalOpen(false);
            setSelectedBookingDetail(null);

            await loadExistingBookings();
        } catch (error) {
            console.error("handleCancelBooking error:", error);
            showAppToast("error", error.message || "Failed to cancel booking");
        } finally {
            setCancelLoading(false);
        }
    };

    if (!selectedBus) return null;

    const totalSeats = Number(selectedBus?.seatLayout || 39);
    const availableCount = Math.max(totalSeats - bookedSeats.length - blockedSeats.length, 0);

    return (
        <>
            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                {/* Header */}
                <div className="border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                            <div className="mb-1.5 text-[11px] font-bold tracking-[0.28em] text-[#0B5D5A] uppercase">
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
                            <button
                                type="button"
                                onClick={() => setBlockModalOpen(true)}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] border border-orange-300 bg-orange-50 px-4 text-sm font-semibold text-orange-700 transition-all duration-200 hover:bg-orange-100"
                            >

                                Block Seat
                            </button>

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
                <div className="grid grid-cols-1 gap-3 border-b border-slate-200 px-4 py-4 sm:grid-cols-2 xl:grid-cols-4 sm:px-5">
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
                        icon={<Printer className="h-5 w-5" />}
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
                <div className="grid grid-cols-1 gap-5 p-4 xl:grid-cols-[1.5fr_0.9fr] sm:p-5">
                    {/* LEFT */}
                    <div className="space-y-5">
                        {/* Seat Layout */}
                        <div className="rounded-[22px] border border-[#D7ECEA] bg-[#F8FCFC] p-4 sm:p-5">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                        Bus Seat Layout
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500 sm:text-base">
                                        View the selected bus seat structure.
                                    </p>
                                </div>

                                <div className="rounded-full border border-[#CFE5E3] bg-white px-4 py-1.5 text-sm font-bold text-[#0B5D5A]">
                                    Available: {availableCount}
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
                                onBlockedSeat={(seatNo) =>
                                    showAppToast(
                                        "warning",
                                        `Seat ${seatNo} is blocked. Use the blocked seat list to manage it.`
                                    )
                                }
                            />
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
                                {/* Name */}
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                                        Passenger Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Enter passenger name"
                                            className="h-12 w-full rounded-[16px] border border-slate-300 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                        />
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
                                        value={formatCurrency(selectedFare)}
                                        highlight
                                    />
                                </div>

                                {/* Payment Buttons */}
                                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <PaymentButton
                                        label="Online"
                                        color="teal"
                                        disabled={submitting}
                                        onClick={() => handleCreateBooking("ONLINE")}
                                    />
                                    <PaymentButton
                                        label="Cash"
                                        color="orange"
                                        disabled={submitting}
                                        onClick={() => handleCreateBooking("OFFLINE_CASH")}
                                    />
                                    <PaymentButton
                                        label="UPI"
                                        color="slate"
                                        disabled={submitting}
                                        onClick={() => handleCreateBooking("OFFLINE_UPI")}
                                    />
                                    <PaymentButton
                                        label="Unpaid"
                                        color="red"
                                        disabled={submitting}
                                        onClick={() => handleCreateBooking("OFFLINE_UNPAID")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <ExistingBookingsPanel
                        loading={loadingBookings}
                        bookings={existingBookings}
                        onViewBooking={(booking) => {
                            const firstSeat = Array.isArray(booking?.seats) ? booking.seats[0] : "";
                            setSelectedBookingDetail({
                                seatNo: String(firstSeat || ""),
                                booking,
                                bookingId: booking?._id,
                                status:
                                    booking?.bookingStatus === "CANCELLED" ? "blocked" : "booked",
                                customerName: booking?.customerName || "",
                                customerPhone: booking?.customerPhone || "",
                                customerEmail: booking?.customerEmail || "",
                                pickupName: booking?.pickupName || pickupStop?.name || "",
                                dropName: booking?.dropName || dropStop?.name || "",
                                pickupMarathi: booking?.pickupMarathi || pickupStop?.marathiName || "",
                                dropMarathi: booking?.dropMarathi || dropStop?.marathiName || "",
                                pickupTime: booking?.pickupTime || pickupStop?.time || "",
                                dropTime: booking?.dropTime || dropStop?.time || "",
                                fare: booking?.finalPayableAmount || booking?.fare || 0,
                                bookingCode: booking?.bookingCode || "",
                                paymentStatus: booking?.paymentStatus || "UNPAID",
                                paymentMethod: booking?.paymentMethod || "UNPAID",
                            });
                            setSeatDetailModalOpen(true);
                        }}
                        onViewBlockedSeat={handleViewBlockedSeat}
                    />
                </div>
            </section>

            <SeatBookingDetailsModal
                open={seatDetailModalOpen}
                data={selectedBookingDetail}
                loading={editLoading}
                onClose={() => {
                    setSeatDetailModalOpen(false);
                    setSelectedBookingDetail(null);
                }}
                onEdit={handleUpdateBooking}
                onCancel={() => {
                    setCancelModalOpen(true);
                }}
            />

            <CancelBookingModal
                open={cancelModalOpen}
                seatNo={selectedBookingDetail?.seatNo}
                loading={cancelLoading}
                onClose={() => setCancelModalOpen(false)}
                onRefundOriginal={() => handleCancelBooking("REFUND_ORIGINAL")}
                onIssueVoucher={() => handleCancelBooking("ISSUE_VOUCHER")}
                onMarkCancelled={() => handleCancelBooking("NO_REFUND")}
            />

            <PrintSeatTemplateModal
                open={printModalOpen}
                onClose={() => setPrintModalOpen(false)}
                selectedBus={selectedBus}
                date={travelDate}
                bookings={existingBookings}
                seatLayout={String(selectedBus?.seatLayout || 39)}
            />

            {blockModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-[28px] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
                                    Block Seat
                                </div>
                                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                                    Select seat number to block
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    This will create a blocked seat entry for the selected bus/date.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setBlockModalOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-800">
                                    Seat Number
                                </label>
                                <select
                                    value={blockSeatNo}
                                    onChange={(e) => setBlockSeatNo(e.target.value)}
                                    className="h-12 w-full rounded-[16px] border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                >
                                    <option value="">Select seat number</option>
                                    {Array.from({ length: totalSeats }, (_, index) => String(index + 1)).map((seat) => (
                                        <option key={seat} value={seat}>
                                            Seat {seat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-800">
                                    Reason / Note
                                </label>
                                <textarea
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="Optional reason for blocking"
                                    rows={4}
                                    className="w-full rounded-[16px] border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setBlockModalOpen(false)}
                                className="inline-flex h-11 items-center justify-center rounded-[16px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleBlockSeat}
                                disabled={blockLoading}
                                className="inline-flex h-11 items-center justify-center rounded-[16px] bg-orange-600 px-5 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {blockLoading ? "Blocking..." : "Block Seat"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                className={`text-[11px] font-bold tracking-[0.18em] uppercase ${highlight ? "text-[#0B5D5A]" : "text-slate-500"
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

function PaymentButton({ label, color, onClick, disabled }) {
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
            {disabled ? "Please wait..." : label}
        </button>
    );
}