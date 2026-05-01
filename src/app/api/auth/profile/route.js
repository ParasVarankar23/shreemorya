import { deleteCloudinaryImage, uploadAssetToCloudinary } from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import Staff from "@/models/staff.model";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import jwt from "jsonwebtoken";

async function getUserFromToken(req) {
    const authHeader =
        req.headers.get("authorization") || req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Unauthorized. Token missing.");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw new Error("Invalid or expired token");
    }

    if (!decoded?.userId) {
        throw new Error("Invalid token payload");
    }

    const user = await User.findById(decoded.userId);

    if (user) return user;

    // Try staff collection as fallback
    const staff = await Staff.findById(decoded.userId);
    if (staff) return staff;

    throw new Error("User not found");
}

// =========================
// GET PROFILE
// =========================
export async function GET(req) {
    try {
        await connectDB();

        const user = await getUserFromToken(req);

        return successResponse(
            {
                user: {
                    id: user._id,
                    fullName: user.fullName || "",
                    email: user.email || "",
                    phoneNumber: user.phoneNumber || "",
                    profileImage: user.profileImage || "",
                    gender: user.gender || "",
                    dateOfBirth: user.dateOfBirth || "",
                    address: user.address || "",
                    city: user.city || "",
                    state: user.state || "",
                    pincode: user.pincode || "",
                    role: user.role,
                    isGuest: user.isGuest,
                    authProvider: user.authProvider,
                    createdAt: user.createdAt,
                },
            },
            "Profile fetched successfully",
            200
        );
    } catch (error) {
        console.error("Get Profile API Error:", error);
        return errorResponse("Failed to fetch profile", 401, error.message);
    }
}

// =========================
// UPDATE PROFILE
// =========================
export async function PUT(req) {
    try {
        await connectDB();

        const user = await getUserFromToken(req);

        if (user.isGuest) {
            return errorResponse("Guest users cannot update profile", 400);
        }

        const formData = await req.formData();

        const fullName = String(formData.get("fullName") ?? user.fullName ?? "").trim();
        const gender = String(formData.get("gender") ?? user.gender ?? "").trim().toLowerCase();
        const dateOfBirth = String(formData.get("dateOfBirth") ?? user.dateOfBirth ?? "").trim();
        const address = String(formData.get("address") ?? user.address ?? "").trim();
        const city = String(formData.get("city") ?? user.city ?? "").trim();
        const state = String(formData.get("state") ?? user.state ?? "").trim();
        const pincode = String(formData.get("pincode") ?? user.pincode ?? "").trim();

        const imageFile = formData.get("profileImage");

        if (!fullName) {
            return errorResponse("Full name is required", 400);
        }

        if (gender && !["male", "female", "other"].includes(gender)) {
            return errorResponse("Gender must be male, female, or other", 400);
        }

        if (pincode && !/^[0-9]{6}$/.test(pincode)) {
            return errorResponse("Pincode must be 6 digits", 400);
        }

        user.fullName = fullName;
        user.gender = gender;
        user.dateOfBirth = dateOfBirth;
        user.address = address;
        user.city = city;
        user.state = state;
        user.pincode = pincode;

        if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
            const mimeType = imageFile.type || "image/jpeg";

            if (!mimeType.startsWith("image/")) {
                return errorResponse("Only image files are allowed for profile image", 400);
            }

            if (imageFile.size > 5 * 1024 * 1024) {
                return errorResponse("Profile image must be less than 5MB", 400);
            }

            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploaded = await uploadAssetToCloudinary({
                buffer,
                folder: "shree-morya-travels/profile",
                mimeType,
                resourceType: "image",
            });

            if (user.profileImagePublicId) {
                try {
                    await deleteCloudinaryImage(user.profileImagePublicId);
                } catch (deleteError) {
                    console.warn("Failed to delete old profile image:", deleteError.message);
                }
            }

            user.profileImage = uploaded.secure_url || "";
            user.profileImagePublicId = uploaded.public_id || "";
        }

        await user.save();

        return successResponse(
            {
                user: {
                    id: user._id,
                    fullName: user.fullName || "",
                    email: user.email || "",
                    phoneNumber: user.phoneNumber || "",
                    profileImage: user.profileImage || "",
                    gender: user.gender || "",
                    dateOfBirth: user.dateOfBirth || "",
                    address: user.address || "",
                    city: user.city || "",
                    state: user.state || "",
                    pincode: user.pincode || "",
                    role: user.role,
                    isGuest: user.isGuest,
                    authProvider: user.authProvider,
                    createdAt: user.createdAt,
                },
            },
            "Profile updated successfully",
            200
        );
    } catch (error) {
        console.error("Update Profile API Error:", error);
        return errorResponse("Failed to update profile", 500, error.message);
    }
}