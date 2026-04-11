"use client";

import { showAppToast } from "@/lib/toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaCheckCircle,
    FaEye,
    FaEyeSlash,
    FaGoogle,
    FaUserSecret,
} from "react-icons/fa";

export default function LoginForm() {
    const router = useRouter();

    const [form, setForm] = useState({
        emailOrPhone: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    // =========================
    // GOOGLE SCRIPT LOAD
    // =========================
    useEffect(() => {
        const scriptId = "google-identity-script-login";

        const initializeGoogle = () => {
            if (
                typeof window !== "undefined" &&
                window.google &&
                process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
            ) {
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                    callback: handleGoogleCredentialResponse,
                });
            }
        };

        const existingScript = document.getElementById(scriptId);

        if (existingScript) {
            initializeGoogle();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.id = scriptId;
        script.onload = initializeGoogle;

        document.body.appendChild(script);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =========================
    // REDIRECT BASED ON ROLE
    // =========================
    const redirectByRole = (user) => {
        const role = user?.role;

        if (role === "admin") {
            router.push("/admin");
            return;
        }

        if (role === "staff") {
            router.push("/staff");
            return;
        }

        if (role === "guest" || user?.isGuest) {
            router.push("/guest");
            return;
        }

        router.push("/user");
    };

    // =========================
    // SAVE AUTH DATA
    // =========================
    const saveAuthData = (data) => {
        const { accessToken, refreshToken, user } = data || {};

        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (user) localStorage.setItem("user", JSON.stringify(user));

        return user;
    };

    // =========================
    // VALIDATION
    // =========================
    const validate = () => {
        const newErrors = {};

        if (!form.emailOrPhone.trim()) {
            newErrors.emailOrPhone = "Email or phone number is required";
        } else {
            const cleaned = form.emailOrPhone.replace(/\D/g, "");
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailOrPhone.trim());
            const isPhone = /^[6-9]\d{9}$/.test(cleaned);

            if (!isEmail && !isPhone) {
                newErrors.emailOrPhone = "Enter a valid email or 10-digit phone number";
            }
        }

        if (!form.password.trim()) {
            newErrors.password = "Password is required";
        } else if (form.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
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
    // NORMAL LOGIN
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);
            setMessage("");
            setSuccess(false);

            const payload = {
                emailOrPhone: form.emailOrPhone.trim(),
                password: form.password.trim(),
            };

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Login failed");
            }

            const user = saveAuthData(data.data);

            const successMessage = data.message || "Login successful! Redirecting...";
            setSuccess(true);
            setMessage(successMessage);
            showAppToast("success", successMessage);

            setTimeout(() => {
                redirectByRole(user);
            }, 1000);
        } catch (error) {
            console.error("Login error:", error);
            setSuccess(false);
            const errorMessage = error.message || "Failed to login";
            setMessage(errorMessage);
            showAppToast("error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // GUEST LOGIN
    // =========================
    const handleGuestLogin = async () => {
        try {
            setGuestLoading(true);
            setMessage("");
            setSuccess(false);

            const response = await fetch("/api/auth/guest-login", {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Guest login failed");
            }

            const user = saveAuthData(data.data);

            const successMessage =
                data.message || "Guest login successful! Redirecting...";
            setSuccess(true);
            setMessage(successMessage);
            showAppToast("success", successMessage);

            setTimeout(() => {
                redirectByRole(user);
            }, 1000);
        } catch (error) {
            console.error("Guest login error:", error);
            setSuccess(false);
            const errorMessage = error.message || "Failed to login as guest";
            setMessage(errorMessage);
            showAppToast("error", errorMessage);
        } finally {
            setGuestLoading(false);
        }
    };

    // =========================
    // GOOGLE LOGIN CALLBACK
    // =========================
    const handleGoogleCredentialResponse = async (response) => {
        try {
            setGoogleLoading(true);
            setMessage("");
            setSuccess(false);

            const res = await fetch("/api/auth/google-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    credential: response.credential,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Google login failed");
            }

            const user = saveAuthData(data.data);

            const successMessage = "Google login successful! Redirecting...";
            setSuccess(true);
            setMessage(successMessage);
            showAppToast("success", successMessage);

            setTimeout(() => {
                redirectByRole(user);
            }, 1000);
        } catch (error) {
            console.error("Google login error:", error);
            setSuccess(false);
            const errorMessage = error.message || "Failed to continue with Google";
            setMessage(errorMessage);
            showAppToast("error", errorMessage);
        } finally {
            setGoogleLoading(false);
        }
    };

    // =========================
    // TRIGGER GOOGLE LOGIN
    // =========================
    const handleGoogleLogin = () => {
        if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
            const errorMessage =
                "Google Client ID missing. Please check your .env file.";
            setSuccess(false);
            setMessage(errorMessage);
            showAppToast("error", errorMessage);
            return;
        }

        if (typeof window === "undefined" || !window.google) {
            const errorMessage =
                "Google Sign-In is not ready yet. Please try again.";
            setSuccess(false);
            setMessage(errorMessage);
            showAppToast("error", errorMessage);
            return;
        }

        setMessage("");
        window.google.accounts.id.prompt();
    };

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

    // =========================
    // FORM UI (REUSABLE)
    // =========================
    const renderForm = () => (
        <>
            <div className="mb-6 flex flex-col items-center text-center">
                <p className="text-[#E8A317] font-semibold text-[11px] sm:text-xs tracking-[0.18em]">
                    WELCOME BACK
                </p>

                <h2 className="text-[32px] sm:text-[36px] xl:text-[38px] font-bold text-[#123b3a] mt-2 leading-tight">
                    Login
                </h2>

                <p className="text-gray-500 mt-2 text-sm sm:text-[15px] leading-6 sm:leading-7 max-w-[360px]">
                    Sign in to continue your booking journey.
                </p>
            </div>

            {renderMessage()}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email / Phone */}
                <div>
                    <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                        Email or Phone Number
                    </label>
                    <input
                        type="text"
                        name="emailOrPhone"
                        value={form.emailOrPhone}
                        onChange={handleChange}
                        placeholder="Enter email or phone number"
                        className={`w-full h-[52px] rounded-2xl border px-4 outline-none transition text-sm sm:text-[15px] ${errors.emailOrPhone
                            ? "border-red-500 bg-red-50"
                            : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                            }`}
                    />
                    {errors.emailOrPhone && (
                        <p className="text-red-500 text-xs sm:text-sm mt-2">
                            {errors.emailOrPhone}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            className={`w-full h-[52px] rounded-2xl border px-4 pr-12 outline-none transition text-sm sm:text-[15px] ${errors.password
                                ? "border-red-500 bg-red-50"
                                : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-xs sm:text-sm mt-2">{errors.password}</p>
                    )}
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                    <a
                        href="/forgot-password"
                        className="text-sm font-semibold text-[#0E6B68] hover:text-[#0b5a57] transition"
                    >
                        Forgot Password?
                    </a>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[52px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-sm sm:text-[15px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {/* Guest Login */}
                <button
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={guestLoading}
                    className="w-full h-[52px] rounded-2xl border border-[#cfe3e1] bg-[#f8fbfa] text-[#123b3a] font-semibold hover:bg-[#eef7f6] transition shadow-sm text-sm sm:text-[15px] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    <FaUserSecret className="text-[#0E6B68]" />
                    {guestLoading ? "Please wait..." : "Continue as Guest"}
                </button>

                {/* Divider */}
                <div className="relative py-1">
                    <div className="border-t border-[#e7efee]" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[11px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
                        OR CONTINUE WITH
                    </span>
                </div>

                {/* Google */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full h-[52px] rounded-2xl border border-[#dce8e6] bg-white text-[#123b3a] font-semibold flex items-center justify-center gap-3 hover:bg-[#f8fbfa] transition text-sm sm:text-[15px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <FaGoogle className="text-[#EA4335] text-base" />
                    {googleLoading ? "Please wait..." : "Continue with Google"}
                </button>

                {/* Signup Link */}
                <p className="text-center text-sm sm:text-[15px] text-gray-600 pt-1">
                    Don&apos;t have an account?{" "}
                    <a
                        href="/signup"
                        className="text-[#0E6B68] font-semibold hover:underline"
                    >
                        Create Account
                    </a>
                </p>
            </form>
        </>
    );

    return (
        <main className="bg-[#f8fbfa] py-10 sm:py-12 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ================= MOBILE / TABLET ================= */}
                <div className="lg:hidden flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="w-full max-w-lg bg-white rounded-[22px] shadow-lg border border-[#e7efee] p-5 sm:p-6"
                    >
                        {renderForm()}
                    </motion.div>
                </div>

                {/* ================= DESKTOP ================= */}
                <div className="hidden lg:grid lg:grid-cols-[0.96fr_0.9fr] gap-5 xl:gap-6 items-start">
                    {/* LEFT CARD */}
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

                        <div className="relative z-10 max-w-[440px]">
                            <p className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-[#E8A317] font-semibold text-sm">
                                <span className="w-2 h-2 rounded-full bg-[#7ed321]" />
                                Premium Bus Booking
                            </p>

                            <h2 className="mt-5 text-[44px] xl:text-[48px] font-bold leading-[1.05]">
                                Login to Your
                                <br />
                                Account
                            </h2>

                            <p className="mt-4 text-white/85 text-[16px] leading-8 max-w-[430px]">
                                Access your bookings, manage routes, and continue your travel journey with Morya Travels.
                            </p>

                            <div className="mt-6 space-y-3">
                                {[
                                    "Safe & trusted daily service",
                                    "Regular route timings available",
                                    "Shrivardhan • Borli • Borivali • Virar",
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl bg-white/10 border border-white/10 px-5 py-3 text-[15px] font-medium"
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-7 rounded-2xl bg-white/10 border border-white/10 p-5">
                                <p className="text-white/90 text-sm leading-7">
                                    Login with your email or phone number. You can also continue as guest or use Google Sign-In.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT FORM */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45 }}
                        className="bg-white rounded-[26px] shadow-lg border border-[#e7efee] px-7 py-7 xl:px-8 xl:py-8"
                    >
                        {renderForm()}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}