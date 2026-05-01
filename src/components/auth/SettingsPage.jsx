"use client";

import {
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    Lock,
    RefreshCcw,
    Save,
    ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { showAppToast } from "../../lib/toast";

export default function SettingsPage() {
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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

            const res = await fetch("/api/auth/refresh", {
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

    const handleChange = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const resetForm = () => {
        setForm({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    const validateForm = () => {
        if (!form.oldPassword.trim()) {
            showToast("error", "Old password is required");
            return false;
        }

        if (!form.newPassword.trim()) {
            showToast("error", "New password is required");
            return false;
        }

        if (!form.confirmPassword.trim()) {
            showToast("error", "Confirm password is required");
            return false;
        }

        if (form.newPassword.length < 6) {
            showToast("error", "New password must be at least 6 characters long");
            return false;
        }

        if (form.newPassword !== form.confirmPassword) {
            showToast("error", "New password and confirm password do not match");
            return false;
        }

        if (form.oldPassword === form.newPassword) {
            showToast("error", "New password cannot be the same as old password");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            const payload = {
                oldPassword: form.oldPassword,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
            };

            let res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(payload),
            });

            if (res.status === 401) {
                const newAccessToken = await refreshAccessToken();

                if (newAccessToken) {
                    res = await fetch("/api/auth/change-password", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${newAccessToken}`,
                        },
                        body: JSON.stringify(payload),
                    });
                }
            }

            const data = await safeJson(res);

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to change password");
            }

            showToast("success", "Password changed successfully");
            resetForm();
        } catch (error) {
            console.error("Change password error:", error);
            showToast("error", error.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-[#F6FBFB] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-6 rounded-[28px] border border-[#D7ECEA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#0B5D5A]">
                                Account Security
                            </div>
                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Settings
                            </h1>
                            <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
                                Change your password securely
                            </p>
                        </div>

                        <div className="rounded-full border border-[#CFE5E3] bg-[#F8FCFC] px-4 py-2 text-sm font-bold text-[#0B5D5A]">
                            Secure Password Update
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
                    {/* Left Info Card */}
                    <div className="rounded-[28px] border border-[#D7ECEA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                Security Tips
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Keep your account protected
                            </p>
                        </div>

                        <div className="space-y-4">
                            <InfoRow
                                icon={<ShieldCheck className="h-5 w-5" />}
                                title="Use Strong Password"
                                text="Use at least 6 characters with letters, numbers, and symbols."
                            />

                            <InfoRow
                                icon={<KeyRound className="h-5 w-5" />}
                                title="Do Not Reuse"
                                text="Avoid using the same password you already used before."
                            />

                            <InfoRow
                                icon={<Lock className="h-5 w-5" />}
                                title="Keep It Private"
                                text="Never share your password with anyone."
                            />
                        </div>
                    </div>

                    {/* Right Form Card */}
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-[28px] border border-[#D7ECEA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6"
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                Change Password
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Enter your old password and set a new one
                            </p>
                        </div>

                        <div className="space-y-5">
                            <PasswordField
                                label="Old Password"
                                value={form.oldPassword}
                                onChange={(e) => handleChange("oldPassword", e.target.value)}
                                show={showOld}
                                setShow={setShowOld}
                                placeholder="Enter old password"
                            />

                            <PasswordField
                                label="New Password"
                                value={form.newPassword}
                                onChange={(e) => handleChange("newPassword", e.target.value)}
                                show={showNew}
                                setShow={setShowNew}
                                placeholder="Enter new password"
                            />

                            <PasswordField
                                label="Confirm Password"
                                value={form.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                show={showConfirm}
                                setShow={setShowConfirm}
                                placeholder="Confirm new password"
                            />
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={loading}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCcw className="h-4.5 w-4.5" />
                                Reset
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#0B5D5A] to-[#0A524F] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(11,93,90,0.18)] transition hover:from-[#094B49] hover:to-[#083F3E] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4.5 w-4.5" />
                                        Change Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

function PasswordField({
    label,
    value,
    onChange,
    show,
    setShow,
    placeholder,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
                {label} <span className="text-red-500">*</span>
            </label>

            <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="h-12 w-full rounded-[16px] border border-slate-300 bg-white pl-10 pr-12 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
                />

                <button
                    type="button"
                    onClick={() => setShow((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#0B5D5A]"
                >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
}

function InfoRow({ icon, title, text }) {
    return (
        <div className="rounded-[20px] border border-[#D7ECEA] bg-[#F8FCFC] p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#0B5D5A] shadow-sm">
                    {icon}
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                </div>
            </div>
        </div>
    );
}