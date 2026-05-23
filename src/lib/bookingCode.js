import { connectDB } from "@/lib/db";
import Booking from "@/models/booking.model";
import Counter from "@/models/counter.model";

const MONTH_SHORT_NAMES = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
];

/**
 * Generate month-wise booking code
 * Format: 26APR0001
 * - 26 = year short
 * - APR = month short
 * - 0001 = running serial for that month
 *
 * @param {Date|string|null} travelDate Optional travel date or booking date
 * @returns {Promise<string>}
 */
export async function generateBookingCode(travelDate = null) {
    await connectDB();

    const date = travelDate ? new Date(travelDate) : new Date();

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid travelDate passed to generateBookingCode");
    }

    const yearShort = String(date.getFullYear()).slice(-2);
    const monthIndex = date.getMonth();
    const monthShort = MONTH_SHORT_NAMES[monthIndex];

    const prefix = `${yearShort}${monthShort}`;

    // Find last booking serial for this prefix to seed the counter if needed
    const lastBooking = await Booking.findOne({
        bookingCode: { $regex: `^${prefix}\\d{4}$` },
        bookingStatus: { $ne: "CANCELLED" },
    })
        .sort({ bookingCode: -1 })
        .select("bookingCode")
        .lean();

    let lastSerial = 0;
    if (lastBooking?.bookingCode) {
        const parsed = parseInt(lastBooking.bookingCode.slice(-4), 10);
        if (!Number.isNaN(parsed)) lastSerial = parsed;
    }

    const counterKey = `bookingCode:${prefix}`;

    // Ensure a Counter doc exists and seed it to lastSerial if absent.
    try {
        await Counter.findOneAndUpdate(
            { key: counterKey },
            { $setOnInsert: { seq: lastSerial } },
            { upsert: true }
        );
    } catch (e) {
        // ignore and continue — counter may already exist
    }

    // Ensure existing counter is at least lastSerial to avoid rolling back
    try {
        if (lastSerial && lastSerial > 0) {
            await Counter.findOneAndUpdate(
                { key: counterKey },
                { $max: { seq: lastSerial } }
            );
        }
    } catch (e) {
        // ignore
    }

    // Atomically increment and get the next sequence number
    const updated = await Counter.findOneAndUpdate(
        { key: counterKey },
        { $inc: { seq: 1 } },
        { new: true }
    ).lean();

    const nextNumber = (updated && Number(updated.seq)) || lastSerial + 1;
    const serial = String(nextNumber).padStart(4, "0");

    return `${prefix}${serial}`;
}

export { MONTH_SHORT_NAMES };
