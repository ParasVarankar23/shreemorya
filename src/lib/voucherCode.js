import { connectDB } from "@/lib/db";
import Voucher from "@/models/voucher.model";

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
 * Generate month-wise voucher code
 * Format: VCH26APR0001
 */
export async function generateVoucherCode(issueDate = null) {
    await connectDB();

    const date = issueDate ? new Date(issueDate) : new Date();

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid issueDate passed to generateVoucherCode");
    }

    const yearShort = String(date.getFullYear()).slice(-2);
    const monthShort = MONTH_SHORT_NAMES[date.getMonth()];
    const prefix = `VCH${yearShort}${monthShort}`;

    const lastVoucher = await Voucher.findOne({
        voucherCode: { $regex: `^${prefix}\\d{4}$` },
    })
        .sort({ voucherCode: -1 })
        .select("voucherCode")
        .lean();

    let nextNumber = 1;

    if (lastVoucher?.voucherCode) {
        const lastSerial = parseInt(lastVoucher.voucherCode.slice(-4), 10);
        if (!Number.isNaN(lastSerial)) {
            nextNumber = lastSerial + 1;
        }
    }

    const serial = String(nextNumber).padStart(4, "0");

    return `${prefix}${serial}`;
}