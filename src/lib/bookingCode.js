import { connectDB } from "@/lib/db";
import Booking from "@/models/booking.model";

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

    // Find all codes for same month prefix
    // Example: 26APR0001, 26APR0002...
    const lastBooking = await Booking.findOne({
        bookingCode: { $regex: `^${prefix}\\d{4}$` },
    })
        .sort({ bookingCode: -1 })
        .select("bookingCode")
        .lean();

    let nextNumber = 1;

    if (lastBooking?.bookingCode) {
        const lastSerial = parseInt(lastBooking.bookingCode.slice(-4), 10);
        if (!Number.isNaN(lastSerial)) {
            nextNumber = lastSerial + 1;
        }
    }

    const serial = String(nextNumber).padStart(4, "0");

    return `${prefix}${serial}`;
}

export { MONTH_SHORT_NAMES };
