import { connectDB } from "@/lib/db";
import Counter from "@/models/counter.model";
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

    // To avoid duplicated codes when migrating from an older system,
    // determine latest existing voucher serial for the prefix (if any)
    const lastVoucher = await Voucher.findOne({
        voucherCode: { $regex: `^${prefix}\\d{4}$` },
    })
        .sort({ voucherCode: -1 })
        .select("voucherCode")
        .lean();

    let lastSerial = 0;
    if (lastVoucher?.voucherCode) {
        const parsed = parseInt(lastVoucher.voucherCode.slice(-4), 10);
        if (!Number.isNaN(parsed)) lastSerial = parsed;
    }

    // Use an aggregation-pipeline update to atomically initialize and increment
    // the counter without conflicting update operators. This works with MongoDB >=4.2.
    const updatePipeline = [
        { $set: { key: prefix } },
        {
            $set: {
                seq: {
                    $add: [
                        { $ifNull: ["$seq", lastSerial || 0] },
                        1,
                    ],
                },
            },
        },
    ];

    // Use the underlying native collection to run a pipeline-style update
    // Mongoose's model.findOneAndUpdate may not accept an array update unless
    // updatePipeline option is available; using the collection avoids that issue.
    const result = await Counter.collection.findOneAndUpdate(
        { key: prefix },
        updatePipeline,
        { returnDocument: "after", upsert: true }
    );

    const counterDoc = result && (result.value || result);
    const nextNumber = Number(counterDoc?.seq || (lastSerial + 1));
    const serial = String(nextNumber).padStart(4, "0");

    return `${prefix}${serial}`;
}