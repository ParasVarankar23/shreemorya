import { sendStaffWelcomeEmail } from "@/lib/emailService";
import { connectDB } from "@/lib/mongodb";
import Staff from "@/models/staff.model";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { generateRandomPassword, getAuthUserFromRequest, hasRole } from "@/utils/auth";
import bcrypt from "bcryptjs";

/* ================= GET ================= */
export async function GET(req) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(req);
        if (!authUser) return errorResponse("Unauthorized", 401);
        if (!hasRole(authUser, ["admin", "staff"])) return errorResponse("Forbidden", 403);

        const { searchParams } = new URL(req.url);
        const search = (searchParams.get("search") || "").trim();

        const query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phoneNumber: { $regex: search, $options: "i" } },
            ];
        }


        const staff = await Staff.find(query)
            .select("fullName email phoneNumber role position createdAt")
            .sort({ createdAt: -1 });

        return successResponse({ data: staff }, "Staff fetched");
    } catch (err) {
        return errorResponse("Failed to fetch staff", 500, err.message);
    }
}

/* ================= POST ================= */
export async function POST(req) {
    try {
        await connectDB();

        const authUser = await getAuthUserFromRequest(req);
        if (!authUser) return errorResponse("Unauthorized", 401);
        if (!hasRole(authUser, ["admin"])) return errorResponse("Admin only", 403);

        const body = await req.json();

        // Debug: log incoming body to help diagnose missing fields
        try {
            console.log("[POST /api/admin/staff] body:", JSON.stringify(body));
        } catch (e) {
            console.log("[POST /api/admin/staff] body (raw):", body);
        }

        let { fullName, email, phoneNumber, password, position } = body;

        // Debug: ensure position variable is present
        console.log("[POST /api/admin/staff] position variable:", position);

        fullName = fullName?.trim();
        email = email?.trim().toLowerCase();
        phoneNumber = phoneNumber?.trim();

        if (!fullName || !email || !phoneNumber || !position) {
            return errorResponse("All fields required", 400);
        }

        const exist = await Staff.findOne({
            $or: [{ email }, { phoneNumber }],
        });

        if (exist) return errorResponse("User already exists", 409);

        const plainPassword = password || generateRandomPassword(fullName);
        const hashed = await bcrypt.hash(plainPassword, 10);


        const staffDoc = await Staff.create({
            fullName,
            email,
            phoneNumber,
            password: hashed,
            position,
        });

        // Defensive update (not usually needed) and fetch saved doc
        if (position) {
            await Staff.findByIdAndUpdate(staffDoc._id, { $set: { position } });
        }

        const saved = await Staff.findById(staffDoc._id).select("-password").lean();

        try {
            console.log("[POST /api/admin/staff] created user (saved):", JSON.stringify(saved));
        } catch (e) {
            console.log("[POST /api/admin/staff] created user (saved):", saved);
        }

        await sendStaffWelcomeEmail({
            to: email,
            fullName,
            position,
            email,
            password: plainPassword,
        });

        return successResponse({ data: saved }, "Staff created");
    } catch (err) {
        console.error("[POST /api/admin/staff] error:", err);
        return errorResponse("Failed to create staff", 500, err.message);
    }
}