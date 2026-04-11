import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User.model";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { uploadAssetToCloudinary, deleteCloudinaryImage } from "@/lib/cloudinary";

async function getUserFromToken(req) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Unauthorized. Token missing.");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }

    if (!decoded?.userId) {
        throw new Error("Invalid token payload");
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
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

        // Editable fields
        const fullName = String(formData.get("fullName") ?? user.fullName ?? "").trim();
        const gender = String(formData.get("gender") ?? user.gender ?? "").trim().toLowerCase();
        const dateOfBirth = String(formData.get("dateOfBirth") ?? user.dateOfBirth ?? "").trim();
        const address = String(formData.get("address") ?? user.address ?? "").trim();
        const city = String(formData.get("city") ?? user.city ?? "").trim();
        const state = String(formData.get("state") ?? user.state ?? "").trim();
        const pincode = String(formData.get("pincode") ?? user.pincode ?? "").trim();

        // NOT editable fields (ignore even if sent)
        // const email = formData.get("email");
        // const phoneNumber = formData.get("phoneNumber");

        const imageFile = formData.get("profileImage");

        // Validations
        if (!fullName) {
            return errorResponse("Full name is required", 400);
        }

        if (gender && !["male", "female", "other"].includes(gender)) {
            return errorResponse("Gender must be male, female, or other", 400);
        }

        if (pincode && !/^[0-9]{6}$/.test(pincode)) {
            return errorResponse("Pincode must be 6 digits", 400);
        }

        // Update text fields
        user.fullName = fullName; // editable now
        user.gender = gender;
        user.dateOfBirth = dateOfBirth;
        user.address = address;
        user.city = city;
        user.state = state;
        user.pincode = pincode;

        // Handle image upload if new file is provided
        if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
            const mimeType = imageFile.type || "image/jpeg";

            if (!mimeType.startsWith("image/")) {
                return errorResponse("Only image files are allowed for profile image", 400);
            }

            // 5MB limit
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

            // Delete old image after successful upload
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
                    email: user.email || "", // readonly
                    phoneNumber: user.phoneNumber || "", // readonly
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