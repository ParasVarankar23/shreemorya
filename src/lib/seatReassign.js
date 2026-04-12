/**
 * Reassign booked seats when bus is replaced with smaller capacity.
 *
 * Rules:
 * 1. Keep seats <= newCapacity if still valid
 * 2. Seats above newCapacity are invalid
 * 3. Invalid seats get reassigned to highest available valid seats (descending)
 *
 * Example:
 * old booked seats: [1, 5, 21, 24, 27, 30, 35]
 * newCapacity: 22
 *
 * valid kept: [1, 5, 21]
 * invalid: [24, 27, 30, 35]
 * available valid seats descending from 22..1 excluding already kept
 */
export function reassignSeats(oldBookedSeats = [], newCapacity) {
    if (!Array.isArray(oldBookedSeats)) {
        throw new Error("oldBookedSeats must be an array");
    }

    if (!Number.isInteger(newCapacity) || newCapacity <= 0) {
        throw new Error("newCapacity must be a positive integer");
    }

    const normalizedSeats = oldBookedSeats
        .map((seat) => Number(seat))
        .filter((seat) => Number.isInteger(seat) && seat > 0)
        .sort((a, b) => a - b);

    const keptSeats = normalizedSeats.filter((seat) => seat <= newCapacity);
    const invalidSeats = normalizedSeats.filter((seat) => seat > newCapacity);

    const keptSet = new Set(keptSeats);

    const availableSeats = [];
    for (let seat = newCapacity; seat >= 1; seat--) {
        if (!keptSet.has(seat)) {
            availableSeats.push(seat);
        }
    }

    if (invalidSeats.length > availableSeats.length) {
        throw new Error("Not enough seats available in new bus capacity");
    }

    // Bigger old invalid seat gets higher available seat first
    const invalidDescending = [...invalidSeats].sort((a, b) => b - a);

    const reassignmentMap = {};
    invalidDescending.forEach((oldSeat, index) => {
        reassignmentMap[oldSeat] = availableSeats[index];
    });

    const finalSeats = normalizedSeats.map((seat) =>
        seat > newCapacity ? reassignmentMap[seat] : seat
    );

    return {
        oldBookedSeats: normalizedSeats,
        keptSeats,
        invalidSeats,
        reassignmentMap, // e.g. {35: 22, 30: 20, 27: 19, 24: 18}
        finalSeats: finalSeats.sort((a, b) => a - b),
    };
}