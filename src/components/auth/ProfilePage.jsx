"use client";

import {
    Calendar,
    Camera,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Save,
    Shield,
    User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { showAppToast } from "../../lib/toast";

export default function ProfilePage() {
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        role: "",
        profileImage: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const getAccessToken = () => {
        if (typeof window === "undefined") return "";
        return (
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("authToken") ||
            ""
        );
    };

    const getRefreshToken = () => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem("refreshToken") || "";
    };

    const setAccessToken = (token) => {
        if (typeof window === "undefined") return;
        localStorage.setItem("accessToken", token);
        localStorage.setItem("token", token);
    };

    const setRefreshToken = (token) => {
        if (typeof window === "undefined") return;
        localStorage.setItem("refreshToken", token);
    };

    const getAuthHeaders = () => {
        const token = getAccessToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // use centralized toast
    const showToast = (type, message) => showAppToast(type, message);

    const safeJson = async (res) => {
        const contentType = res.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            const text = await res.text();
            console.error("Expected JSON but got:", text);
            throw new Error("Invalid JSON response from server");
        }

        return res.json();
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = getRefreshToken();

            if (!refreshToken) return null;

            const res = await fetch("/api/auth/refresh-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await safeJson(res);

            if (!res.ok || !data?.success) {
                return null;
            }

            const nextAccessToken = data?.accessToken || data?.data?.accessToken || "";
            const nextRefreshToken = data?.refreshToken || data?.data?.refreshToken || "";

            if (nextAccessToken) {
                setAccessToken(nextAccessToken);
            }

            if (nextRefreshToken) {
                setRefreshToken(nextRefreshToken);
            }

            return nextAccessToken || null;
        } catch (error) {
            console.error("refreshAccessToken error:", error);
            return null;
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);

            let res = await fetch("/api/auth/profile", {
                method: "GET",
                headers: {
                    ...getAuthHeaders(),
                },
            });

            if (res.status === 401) {
                const newAccessToken = await refreshAccessToken();

                if (newAccessToken) {
                    res = await fetch("/api/auth/profile", {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${newAccessToken}`,
                        },
                    });
                }
            }

            const data = await safeJson(res);

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to fetch profile");
            }

            const user = data?.data?.user || {};

            setForm({
                fullName: user.fullName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                role: user.role || "",
                profileImage: user.profileImage || "",
                gender: user.gender || "",
                dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : "",
                address: user.address || "",
                city: user.city || "",
                state: user.state || "",
                pincode: user.pincode || "",
            });

            setPreviewImage(user.profileImage || "");
        } catch (error) {
            console.error("fetchProfile error:", error);
            showToast("error", error.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSelectImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("error", "Please select a valid image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast("error", "Profile image must be less than 5MB");
            return;
        }

        setSelectedImageFile(file);

        const objectUrl = URL.createObjectURL(file);
        setPreviewImage(objectUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!form.fullName.trim()) {
                return showToast("error", "Full name is required");
            }

            setSaving(true);

            const payload = new FormData();
            payload.append("fullName", form.fullName.trim());
            payload.append("gender", form.gender || "");
            payload.append("dateOfBirth", form.dateOfBirth || "");
            payload.append("address", form.address || "");
            payload.append("city", form.city || "");
            payload.append("state", form.state || "");
            payload.append("pincode", form.pincode || "");

            if (selectedImageFile) {
                payload.append("profileImage", selectedImageFile);
            }

            let res = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: {
                    ...getAuthHeaders(),
                },
                body: payload,
            });

            if (res.status === 401) {
                const newAccessToken = await refreshAccessToken();

                if (newAccessToken) {
                    res = await fetch("/api/auth/profile", {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${newAccessToken}`,
                        },
                        body: payload,
                    });
                }
            }

            const data = await safeJson(res);

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to update profile");
            }

            const user = data?.data?.user || {};

            setForm({
                fullName: user.fullName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                role: user.role || "",
                profileImage: user.profileImage || "",
                gender: user.gender || "",
                dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : "",
                address: user.address || "",
                city: user.city || "",
                state: user.state || "",
                pincode: user.pincode || "",
            });

            setPreviewImage(user.profileImage || "");
            setSelectedImageFile(null);

            showToast("success", "Profile updated successfully");
        } catch (error) {
            console.error("handleSubmit error:", error);
            showToast("error", error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-[#F6FBFB] px-4">
                <div className="flex items-center gap-3 rounded-2xl border border-[#D7ECEA] bg-white px-6 py-4 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-[#0B5D5A]" />
                    <span className="text-sm font-semibold text-slate-700">
                        Loading profile...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-[#F6FBFB] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 rounded-[28px] border border-[#D7ECEA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#0B5D5A]">
                                Account Settings
                            </div>
                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                My Profile
                            </h1>
                            <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
                                Manage your personal details and profile photo
                            </p>
                        </div>

                        <div className="rounded-full border border-[#CFE5E3] bg-[#F8FCFC] px-4 py-2 text-sm font-bold text-[#0B5D5A]">
                            Secure Profile Management
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
                    <div className="rounded-[28px] border border-[#D7ECEA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                Profile Photo
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Upload image (stored in Cloudinary)
                            </p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-[#D7ECEA] bg-[#F8FCFC] shadow-[0_10px_24px_rgba(11,93,90,0.08)]">
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Profile Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-16 w-16 text-[#0B5D5A]" />
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0B5D5A] text-white shadow-[0_8px_20px_rgba(11,93,90,0.22)] transition hover:bg-[#094B49]"
                                >
                                    <Camera className="h-5 w-5" />
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleSelectImage}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-5 inline-flex h-11 items-center justify-center rounded-[16px] border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Choose Image
                            </button>

                            <p className="mt-3 text-center text-xs font-medium text-slate-500">
                                JPG, PNG, WEBP • Max 5MB
                            </p>

                            <div className="mt-6 w-full rounded-[20px] border border-[#D7ECEA] bg-[#F8FCFC] p-4">
                                <div className="mb-3 text-sm font-bold text-slate-900">
                                    Profile Summary
                                </div>

                                <div className="space-y-3">
                                    <SummaryRow icon={<User className="h-4 w-4" />} label="Full Name" value={form.fullName || "-"} />
                                    <SummaryRow icon={<Mail className="h-4 w-4" />} label="Email" value={form.email || "-"} />
                                    <SummaryRow icon={<Phone className="h-4 w-4" />} label="Phone" value={form.phoneNumber || "-"} />
                                    <SummaryRow icon={<Shield className="h-4 w-4" />} label="Role" value={String(form.role || "-").toUpperCase()} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-[#D7ECEA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                Personal Information
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Update your profile details below
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputField
                                label="Full Name"
                                icon={<User className="h-4.5 w-4.5" />}
                                value={form.fullName}
                                onChange={(e) => handleChange("fullName", e.target.value)}
                                placeholder="Enter full name"
                                required
                            />

                            <InputField
                                label="Email ID"
                                icon={<Mail className="h-4.5 w-4.5" />}
                                value={form.email}
                                onChange={() => { }}
                                placeholder="Email"
                                readOnly
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputField
                                label="Phone Number"
                                icon={<Phone className="h-4.5 w-4.5" />}
                                value={form.phoneNumber}
                                onChange={() => { }}
                                placeholder="Phone Number"
                                readOnly
                            />

                            <InputField
                                label="Role"
                                icon={<Shield className="h-4.5 w-4.5" />}
                                value={String(form.role || "").toUpperCase()}
                                onChange={() => { }}
                                placeholder="Role"
                                readOnly
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <SelectField
                                label="Gender"
                                value={form.gender}
                                onChange={(e) => handleChange("gender", e.target.value)}
                            />

                            <InputField
                                label="Date of Birth"
                                icon={<Calendar className="h-4.5 w-4.5" />}
                                type="date"
                                value={form.dateOfBirth}
                                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                            />
                        </div>

                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Address
                            </label>
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3.5 top-4 h-4.5 w-4.5 text-slate-400" />
                                <textarea
                                    value={form.address}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                    placeholder="Enter address"
                                    rows={4}
                                    className="w-full rounded-[16px] border border-slate-300 bg-white pl-10 pr-4 pt-3.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <InputField
                                label="City"
                                value={form.city}
                                onChange={(e) => handleChange("city", e.target.value)}
                                placeholder="Enter city"
                            />

                            <InputField
                                label="State"
                                value={form.state}
                                onChange={(e) => handleChange("state", e.target.value)}
                                placeholder="Enter state"
                            />

                            <InputField
                                label="Pincode"
                                value={form.pincode}
                                onChange={(e) => handleChange("pincode", e.target.value)}
                                placeholder="Enter pincode"
                            />
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <button
                                type="button"
                                onClick={fetchProfile}
                                disabled={saving}
                                className="inline-flex h-12 items-center justify-center rounded-[18px] border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Refresh
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#0B5D5A] to-[#0A524F] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(11,93,90,0.18)] transition hover:from-[#094B49] hover:to-[#083F3E] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4.5 w-4.5" />
                                        Save Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}

function InputField({
    label,
    icon,
    value,
    onChange,
    placeholder,
    type = "text",
    readOnly = false,
    required = false,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    className={`h-12 w-full rounded-[16px] border px-4 text-sm font-medium outline-none transition-all duration-200 ${icon ? "pl-10" : "pl-4"
                        } ${readOnly
                            ? "border-slate-200 bg-slate-50 text-slate-500"
                            : "border-slate-300 bg-white text-slate-800 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                        }`}
                />
            </div>
        </div>
    );
}

function SelectField({ label, value, onChange }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
                {label}
            </label>
            <select
                value={value}
                onChange={onChange}
                className="h-12 w-full rounded-[16px] border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
            >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>
        </div>
    );
}

function SummaryRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3 rounded-[14px] border border-white bg-white px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#F8FCFC] text-[#0B5D5A]">
                {icon}
            </div>
            <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {label}
                </div>
                <div className="truncate text-sm font-semibold text-slate-900">
                    {value}
                </div>
            </div>
        </div>
    );
}