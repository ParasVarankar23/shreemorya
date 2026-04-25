"use client";

export function getAuthHeaders(extra = {}) {
    let token = "";

    if (globalThis.window !== undefined) {
        token = localStorage.getItem("accessToken") || "";
    }

    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    };
}

export function showAppToast(type = "info", message = "") {
    if (globalThis.window === undefined) return;

    // If you already use sonner / react-hot-toast, replace this here
    // Example:
    // if (type === "error") toast.error(message)
    // else if (type === "success") toast.success(message)
    // else toast(message)

    console.log(`[${type.toUpperCase()}] ${message}`);
}

export function normalizeStopsFromSchedules(schedules = []) {
    const map = new Map();

    schedules.forEach((schedule) => {
        const busStops = [];

        const forwardTrip = schedule?.forwardTrip || schedule?.trip || null;
        const returnTrip = schedule?.returnTrip || null;

        const addTripStops = (trip) => {
            if (!trip) return;

            if (trip?.from) {
                busStops.push({
                    name: trip.from,
                    marathiName: trip.fromMr || trip.fromMarathi || trip.marathiName || "",
                    time: trip.departureTime || trip.startTime || "",
                    order: 1,
                });
            }

            (trip?.pickupPoints || []).forEach((stop, index) => {
                busStops.push({
                    name: stop?.name || stop?.stopName || stop?.englishName || "",
                    marathiName:
                        stop?.marathiName ||
                        stop?.marathi ||
                        stop?.marathiLabel ||
                        stop?.localName ||
                        "",
                    time: stop?.time || stop?.arrivalTime || stop?.departureTime || "",
                    order: typeof stop?.order === "number" ? stop.order : index + 2,
                });
            });

            (trip?.dropPoints || []).forEach((stop, index) => {
                busStops.push({
                    name: stop?.name || stop?.stopName || stop?.englishName || "",
                    marathiName:
                        stop?.marathiName ||
                        stop?.marathi ||
                        stop?.marathiLabel ||
                        stop?.localName ||
                        "",
                    time: stop?.time || stop?.arrivalTime || stop?.departureTime || "",
                    order: typeof stop?.order === "number" ? stop.order : index + 2,
                });
            });

            if (trip?.to) {
                busStops.push({
                    name: trip.to,
                    marathiName: trip.toMr || trip.toMarathi || trip.marathiName || "",
                    time: trip.arrivalTime || trip.endTime || "",
                    order: 9999,
                });
            }
        };

        addTripStops(forwardTrip);
        addTripStops(returnTrip);

        busStops.forEach((stop) => {
            const name = stop?.name || "";
            if (!name) return;

            const key = String(name).trim().toLowerCase();

            if (!map.has(key)) {
                map.set(key, {
                    value: name,
                    name,
                    marathiName: stop?.marathiName || "",
                    time: stop?.time || "",
                    order: typeof stop?.order === "number" ? stop.order : 0,
                });
            }
        });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function formatCurrency(amount) {
    const value = Number(amount || 0);
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatDateDisplay(date) {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;

    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function getStopMarathiOnly(stop) {
    if (!stop) return "";
    if (typeof stop === "string") return stop;

    return (
        stop?.marathiName ||
        stop?.marathi ||
        stop?.localName ||
        stop?.name ||
        ""
    );
}