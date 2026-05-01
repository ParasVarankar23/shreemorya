import { connectDB } from "@/lib/mongodb";
import Staff from "@/models/staff.model";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { getAuthUserFromRequest, hasRole } from "@/utils/auth";
import bcrypt from "bcryptjs";

/* ================= GET ================= */
export async function GET(req) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(req);
        if (!authUser) return errorResponse("Unauthorized", 401);

        const id = req.url.split("/").pop();

        const user = await Staff.findById(id).select(
            "fullName email phoneNumber position"
        );

        if (!user) return errorResponse("Not found", 404);

        return successResponse({ user });
    } catch (err) {
        return errorResponse("Error", 500);
    }
}

/* ================= PUT ================= */
export async function PUT(req) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(req);
        if (!authUser) return errorResponse("Unauthorized", 401);
        if (!hasRole(authUser, ["admin"])) return errorResponse("Admin only", 403);

        const id = req.url.split("/").pop();
        const body = await req.json();

        const update = {};

        if (body.fullName) update.fullName = body.fullName;
        if (body.email) update.email = body.email;
        if (body.phoneNumber) update.phoneNumber = body.phoneNumber;
        if (body.position) update.position = body.position;

        if (body.password) {
            update.password = await bcrypt.hash(body.password, 10);
        }

        const user = await Staff.findByIdAndUpdate(id, update, { new: true }).select("-password");

        return successResponse({ data: user }, "Updated");
    } catch (err) {
        return errorResponse("Update failed", 500);
    }
}

/* ================= DELETE ================= */
export async function DELETE(req) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(req);
        if (!authUser) return errorResponse("Unauthorized", 401);
        if (!hasRole(authUser, ["admin"])) return errorResponse("Admin only", 403);

        const id = req.url.split("/").pop();

        await Staff.findByIdAndDelete(id);

        return successResponse({}, "Deleted");
    } catch (err) {
        return errorResponse("Delete failed", 500);
    }
}