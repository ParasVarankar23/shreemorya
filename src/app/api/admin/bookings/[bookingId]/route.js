import createAuditLog from "@/lib/createAuditLog";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking.model";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import { NextResponse } from "next/server";

/* ------------------------------------------
   GET /api/admin/bookings/[bookingId]
------------------------------------------- */
export async function GET(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin/Staff only" },
                { status: 403 }
            );
        }

        const { bookingId } = await params;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Booking fetched successfully",
            data: booking,
        });
    } catch (error) {
        console.error("GET /api/admin/bookings/[bookingId] error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch booking" },
            { status: 500 }
        );
    }
}
/* ------------------------------------------
   DELETE /api/admin/bookings/[bookingId]
------------------------------------------- */
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin/Staff only" },
                { status: 403 }
            );
        }

        const { bookingId } = await params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        if (booking.bookingStatus !== "CANCELLED" || booking.seatStatus !== "blocked") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only blocked seats can be unblocked",
                },
                { status: 400 }
            );
        }

        await booking.deleteOne();

        return NextResponse.json({
            success: true,
            message: "Blocked seat removed successfully",
        });
    } catch (error) {
        console.error("DELETE /api/admin/bookings/[bookingId] error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to unblock seat" },
            { status: 500 }
        );
    }
}
/* ------------------------------------------
   PUT /api/admin/bookings/[bookingId]
------------------------------------------- */
export async function PUT(request, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!hasRole(authUser, ["admin", "staff"])) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Admin/Staff only" },
                { status: 403 }
            );
        }

        const { bookingId } = await params;
        const body = await request.json();

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        const oldValues = booking.toObject();

        const allowedFields = [
            "customerName",
            "customerPhone",
            "customerEmail",
            "customerGender",
            "notes",
        ];

        for (const key of allowedFields) {
            if (key in body) {
                booking[key] = body[key];
            }
        }

        booking.updatedBy = authUser.userId;

        await booking.save();

        try {
            await createAuditLog({
                userId: authUser.userId,
                userRole: authUser.role,
                action: "UPDATE_BOOKING",
                entityType: "BOOKING",
                entityId: booking._id,
                entityCode: booking.bookingCode,
                message: `Updated booking ${booking.bookingCode}`,
                oldValues,
                newValues: booking.toObject(),
                status: "SUCCESS",
            });
        } catch (auditError) {
            console.error("Audit log update booking error:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: "Booking updated successfully",
            data: booking,
        });
    } catch (error) {
        console.error("PUT /api/admin/bookings/[bookingId] error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to update booking" },
            { status: 500 }
        );
    }
}