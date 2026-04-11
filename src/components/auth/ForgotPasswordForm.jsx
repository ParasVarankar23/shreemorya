"use client";

import { showAppToast } from "@/lib/toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    FaCheckCircle,
    FaEnvelope,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";

export default function ForgotPasswordForm() {
    const router = useRouter();

    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // =========================
    // VALIDATION
    // =========================
    const validateStep1 = () => {
        const newErrors = {};

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            newErrors.email = "Enter a valid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!form.otp.trim()) {
            newErrors.otp = "OTP is required";
        } else if (!/^\d{4,6}$/.test(form.otp.trim())) {
            newErrors.otp = "Enter a valid OTP";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};

        if (!form.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
        } else if (form.newPassword.trim().length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters";
        }

        if (!form.confirmPassword.trim()) {
            newErrors.confirmPassword = "Confirm your password";
        } else if (form.newPassword.trim() !== form.confirmPassword.trim()) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // =========================
    // HANDLE CHANGE
    // =========================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        if (message) {
            setMessage("");
            setSuccess(false);
        }
    };

    // =========================
    // API CALL: STEP 1 SEND OTP
    // =========================
    const handleSendOtp = async () => {
        if (!validateStep1()) return;

        try {
            setLoading(true);
            setMessage("");
            setSuccess(false);

            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    step: "send-otp",
                    email: form.email.trim().toLowerCase(),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to send OTP");
            }

            const successMessage =
                data.message || "OTP sent successfully to your email";
            setSuccess(true);
            setMessage(successMessage);
            showAppToast("success", successMessage);
            setStep(2);
        } catch (error) {
            console.error("Send OTP error:", error);
            setSuccess(false);
            const errorMessage = error.message || "Failed to send OTP";
            setMessage(errorMessage);
            showAppToast("error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // API CALL: STEP 2 VERIFY OTP
    // =========================
    const handleVerifyOtp = async () => {
        if (!validateStep2()) return;

        try {
            setLoading(true);
            setMessage("");
            setSuccess(false);

            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    step: "verify-otp",
                    email: form.email.trim().toLowerCase(),
                    otp: form.otp.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "OTP verification failed");
            }

            const successMessage = data.message || "OTP verified successfully";
            setSuccess(true);
            setMessage(successMessage);
            showAppToast("success", successMessage);
            setStep(3);
        } catch (error) {
            console.error("Verify OTP error:", error);
            setSuccess(false);
            const errorMessage = error.message || "Failed to verify OTP";
            setMessage(errorMessage);
            showAppToast("error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // API CALL: STEP 3 RESET PASSWORD
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step !== 3) return;
        if (!validateStep3()) return;

        try {
            setLoading(true);
            setMessage("");
            setSuccess(false);

            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    step: "reset-password",
                    email: form.email.trim().toLowerCase(),
                    otp: form.otp.trim(),
                    newPassword: form.newPassword.trim(),
                    confirmPassword: form.confirmPassword.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to reset password");
            }

            const successMessage = data.message || "Password reset successful";
            setSuccess(true);
            setMessage(successMessage);
            showAppToast("success", successMessage);

            setTimeout(() => {
                router.push("/login");
            }, 1600);
        } catch (error) {
            console.error("Reset password error:", error);
            setSuccess(false);
            const errorMessage = error.message || "Failed to reset password";
            setMessage(errorMessage);
            showAppToast("error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // STEP ITEMS
    // =========================
    const stepItems = [
        {
            number: 1,
            title: "Verify Email",
            desc: "Enter your registered email address.",
        },
        {
            number: 2,
            title: "Enter OTP",
            desc: "Check your inbox and verify OTP.",
        },
        {
            number: 3,
            title: "Reset Password",
            desc: "Create your new secure password.",
        },
    ];

    // =========================
    // MESSAGE UI
    // =========================
    const renderMessage = () => {
        if (!message) return null;

        return (
            <div
                className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium flex items-start gap-3 ${success
                    ? "bg-[#e8f7f5] text-[#0E6B68] border-[#bfe5df]"
                    : "bg-red-50 text-red-600 border-red-200"
                    }`}
            >
                {success && <FaCheckCircle className="mt-0.5 shrink-0" />}
                <span>{message}</span>
            </div>
        );
    };

    return (
        <section className="bg-[#f8fbfa] py-10 sm:py-12 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* MOBILE / TABLET */}
                <div className="lg:hidden flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="w-full max-w-lg bg-white rounded-[24px] shadow-lg border border-[#e7efee] p-5 sm:p-6"
                    >
                        <div className="mb-5 text-center flex flex-col items-center">
                            <p className="text-[#E8A317] font-semibold text-[11px] sm:text-xs tracking-[0.18em]">
                                RESET PASSWORD
                            </p>
                            <h2 className="text-[30px] sm:text-[34px] font-bold text-[#123b3a] mt-2 leading-tight">
                                Forgot Password
                            </h2>
                            <p className="text-gray-500 mt-2 text-sm sm:text-[15px] leading-6 max-w-[320px]">
                                Complete the 3 simple steps to reset your password securely.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {stepItems.map((item) => {
                                const active = step >= item.number;
                                return (
                                    <div
                                        key={item.number}
                                        className={`rounded-2xl border px-2 py-3 text-center transition ${active
                                            ? "bg-[#0E6B68] text-white border-[#0E6B68]"
                                            : "bg-[#f8fbfa] text-gray-500 border-[#e7efee]"
                                            }`}
                                    >
                                        <div className="text-sm font-bold">{item.number}</div>
                                        <div className="text-[11px] mt-1">{item.title}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {renderMessage()}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* STEP 1 */}
                            {step === 1 && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="Enter registered email"
                                                className={`w-full h-[50px] rounded-2xl border px-4 pl-11 outline-none transition text-sm ${errors.email
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                                    }`}
                                            />
                                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-xs mt-2">{errors.email}</p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={loading}
                                        className="w-full h-[50px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Sending OTP..." : "Send OTP"}
                                    </button>
                                </>
                            )}

                            {/* STEP 2 */}
                            {step === 2 && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                            Enter OTP
                                        </label>
                                        <input
                                            type="text"
                                            name="otp"
                                            value={form.otp}
                                            onChange={handleChange}
                                            placeholder="Enter OTP"
                                            maxLength={6}
                                            className={`w-full h-[50px] rounded-2xl border px-4 outline-none transition text-sm tracking-[0.25em] text-center ${errors.otp
                                                ? "border-red-500 bg-red-50"
                                                : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                                }`}
                                        />
                                        {errors.otp && (
                                            <p className="text-red-500 text-xs mt-2">{errors.otp}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="w-1/2 h-[50px] rounded-2xl border border-[#dce8e6] text-[#123b3a] font-semibold hover:bg-[#f8fbfa] transition text-sm"
                                        >
                                            Back
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleVerifyOtp}
                                            disabled={loading}
                                            className="w-1/2 h-[50px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? "Verifying..." : "Verify OTP"}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* STEP 3 */}
                            {step === 3 && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                name="newPassword"
                                                value={form.newPassword}
                                                onChange={handleChange}
                                                placeholder="Enter new password"
                                                className={`w-full h-[50px] rounded-2xl border px-4 pr-12 outline-none transition text-sm ${errors.newPassword
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                            >
                                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errors.newPassword && (
                                            <p className="text-red-500 text-xs mt-2">
                                                {errors.newPassword}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm new password"
                                                className={`w-full h-[50px] rounded-2xl border px-4 pr-12 outline-none transition text-sm ${errors.confirmPassword
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(!showConfirmPassword)
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-red-500 text-xs mt-2">
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className="w-1/2 h-[50px] rounded-2xl border border-[#dce8e6] text-[#123b3a] font-semibold hover:bg-[#f8fbfa] transition text-sm"
                                        >
                                            Back
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-1/2 h-[50px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? "Resetting..." : "Reset Password"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </motion.div>
                </div>

                {/* DESKTOP */}
                <div className="hidden lg:grid lg:grid-cols-[0.96fr_0.9fr] gap-5 xl:gap-6 items-start">
                    {/* LEFT */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45 }}
                        className="relative overflow-hidden rounded-[26px] bg-[#0E6B68] text-white px-8 py-8 xl:px-9 xl:py-9"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-10"
                            style={{
                                backgroundImage:
                                    "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0E6B68]/95 via-[#0E6B68]/92 to-[#083f3e]/95" />

                        <div className="relative z-10 max-w-[460px]">
                            <p className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-[#E8A317] font-semibold text-sm">
                                <span className="w-2 h-2 rounded-full bg-[#7ed321]" />
                                Secure Account Recovery
                            </p>

                            <h2 className="mt-5 text-[22px] xl:text-[36px] font-bold leading-[1.08]">
                                Reset Your Password
                            </h2>

                            <p className="mt-4 text-white/85 text-[16px] leading-8 max-w-[430px]">
                                Recover your Morya Travels account in 3 simple steps and continue your booking journey safely.
                            </p>

                            <div className="mt-7 space-y-4">
                                {stepItems.map((item) => {
                                    const active = step >= item.number;
                                    return (
                                        <div
                                            key={item.number}
                                            className={`rounded-2xl border px-5 py-4 transition ${active
                                                ? "bg-white/15 border-white/20"
                                                : "bg-white/8 border-white/10"
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${active
                                                        ? "bg-[#E8A317] text-[#123b3a]"
                                                        : "bg-white/10 text-white"
                                                        }`}
                                                >
                                                    {active ? <FaCheckCircle /> : item.number}
                                                </div>

                                                <div>
                                                    <h3 className="text-[16px] font-semibold">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-white/75 text-sm mt-1">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45 }}
                        className="bg-white rounded-[26px] shadow-lg border border-[#e7efee] px-7 py-7 xl:px-8 xl:py-8"
                    >
                        <div className="mb-6 flex flex-col items-center text-center">
                            <p className="text-[#E8A317] font-semibold text-[12px] tracking-[0.18em]">
                                RESET PASSWORD
                            </p>
                            <h2 className="text-[32px] xl:text-[36px] font-bold text-[#123b3a] mt-2 leading-tight">
                                Forgot Password
                            </h2>
                            <p className="text-gray-500 mt-2 text-[15px] leading-7 max-w-[360px]">
                                Complete the 3 simple steps to reset your password securely.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {stepItems.map((item) => {
                                const active = step >= item.number;
                                return (
                                    <div
                                        key={item.number}
                                        className={`rounded-2xl border px-3 py-3 text-center transition ${active
                                            ? "bg-[#0E6B68] text-white border-[#0E6B68]"
                                            : "bg-[#f8fbfa] text-gray-500 border-[#e7efee]"
                                            }`}
                                    >
                                        <div className="text-sm font-bold">{item.number}</div>
                                        <div className="text-[11px] mt-1">{item.title}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {renderMessage()}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* STEP 1 */}
                            {step === 1 && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="Enter registered email"
                                                className={`w-full h-[50px] rounded-2xl border px-4 pl-11 outline-none transition text-[15px] ${errors.email
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                                    }`}
                                            />
                                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={loading}
                                        className="w-full h-[50px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-[15px] disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Sending OTP..." : "Send OTP"}
                                    </button>
                                </>
                            )}

                            {/* STEP 2 */}
                            {step === 2 && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                            Enter OTP
                                        </label>
                                        <input
                                            type="text"
                                            name="otp"
                                            value={form.otp}
                                            onChange={handleChange}
                                            placeholder="Enter OTP"
                                            maxLength={6}
                                            className={`w-full h-[50px] rounded-2xl border px-4 outline-none transition text-[15px] tracking-[0.25em] text-center ${errors.otp
                                                ? "border-red-500 bg-red-50"
                                                : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                                }`}
                                        />
                                        {errors.otp && (
                                            <p className="text-red-500 text-sm mt-2">{errors.otp}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="w-1/2 h-[50px] rounded-2xl border border-[#dce8e6] text-[#123b3a] font-semibold hover:bg-[#f8fbfa] transition text-[15px]"
                                        >
                                            Back
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleVerifyOtp}
                                            disabled={loading}
                                            className="w-1/2 h-[50px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-[15px] disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? "Verifying..." : "Verify OTP"}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* STEP 3 */}
                            {step === 3 && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                name="newPassword"
                                                value={form.newPassword}
                                                onChange={handleChange}
                                                placeholder="Enter new password"
                                                className={`w-full h-[50px] rounded-2xl border px-4 pr-12 outline-none transition text-[15px] ${errors.newPassword
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                            >
                                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errors.newPassword && (
                                            <p className="text-red-500 text-sm mt-2">
                                                {errors.newPassword}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm new password"
                                                className={`w-full h-[50px] rounded-2xl border px-4 pr-12 outline-none transition text-[15px] ${errors.confirmPassword
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(!showConfirmPassword)
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-red-500 text-sm mt-2">
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className="w-1/2 h-[50px] rounded-2xl border border-[#dce8e6] text-[#123b3a] font-semibold hover:bg-[#f8fbfa] transition text-[15px]"
                                        >
                                            Back
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-1/2 h-[50px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-[15px] disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? "Resetting..." : "Reset Password"}
                                        </button>
                                    </div>
                                </>
                            )}

                            <p className="text-center text-[15px] text-gray-600 pt-2">
                                Remember your password?{" "}
                                <a
                                    href="/login"
                                    className="text-[#0E6B68] font-semibold hover:underline"
                                >
                                    Back to Login
                                </a>
                            </p>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}