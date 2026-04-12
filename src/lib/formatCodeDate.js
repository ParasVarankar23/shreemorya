export const MONTH_SHORT_NAMES = [
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

export function getYearMonthPrefix(dateInput = null) {
    const date = dateInput ? new Date(dateInput) : new Date();

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date passed to getYearMonthPrefix");
    }

    const yearShort = String(date.getFullYear()).slice(-2);
    const monthShort = MONTH_SHORT_NAMES[date.getMonth()];

    return {
        yearShort,
        monthShort,
        prefix: `${yearShort}${monthShort}`,
        date,
    };
}