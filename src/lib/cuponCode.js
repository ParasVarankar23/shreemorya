import { connectDB } from "@/lib/db";
import Coupon from "@/models/coupon.model";

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
 * Generate coupon code
 * Format: MORYA26APR001
 */
export async function generateCouponCode(dateInput = null) {
    await connectDB();

    const date = dateInput ? new Date(dateInput) : new Date();

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid dateInput passed to generateCouponCode");
    }

    const yearShort = String(date.getFullYear()).slice(-2);
    const monthShort = MONTH_SHORT_NAMES[date.getMonth()];
    const prefix = `MORYA${yearShort}${monthShort}`;

    const lastCoupon = await Coupon.findOne({
        code: { $regex: `^${prefix}\\d{3}$` },
    })
        .sort({ code: -1 })
        .select("code")
        .lean();

    let nextNumber = 1;

    if (lastCoupon?.code) {
        const lastSerial = parseInt(lastCoupon.code.slice(-3), 10);
        if (!Number.isNaN(lastSerial)) {
            nextNumber = lastSerial + 1;
        }
    }

    const serial = String(nextNumber).padStart(3, "0");

    return `${prefix}${serial}`;
}