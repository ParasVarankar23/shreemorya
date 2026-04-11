"use client";

import { showAppToast } from "@/lib/toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaCheckCircle,
    FaClock,
    FaGoogle,
    FaMapMarkedAlt,
    FaShieldAlt,
} from "react-icons/fa";

export default function SignupForm() {
    const router = useRouter();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    // Load Google Identity script
    useEffect(() => {
        const scriptId = "google-identity-script";

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

    const validate = () => {
        const newErrors = {};

        if (!form.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        } else if (form.fullName.trim().length < 2) {
            newErrors.fullName = "Please enter a valid full name";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        const cleanPhone = form.phoneNumber.replace(/\D/g, "");

        if (!cleanPhone) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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

    const saveAuthData = (data) => {
        const { accessToken, refreshToken, user } = data || {};

        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (user) localStorage.setItem("user", JSON.stringify(user));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);
            setMessage("");
            setSuccess(false);

            const payload = {
                fullName: form.fullName.trim(),
                email: form.email.trim().toLowerCase(),
                phoneNumber: form.phoneNumber.replace(/\D/g, ""),
            };

            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Signup failed");
            }

            saveAuthData(data.data);

            setSuccess(true);
            const successMessage =
                data.message ||
                "Signup successful! Your password has been sent to your email.";

            setMessage(successMessage);

            showAppToast("success", successMessage);

            setForm({
                fullName: "",
                email: "",
                phoneNumber: "",
            });

            setTimeout(() => {
                router.push("/");
            }, 1800);
        } catch (error) {
            console.error("Signup error:", error);
            setSuccess(false);
            const errorMessage = error.message || "Failed to signup";
            setMessage(errorMessage);
            showAppToast("error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

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

            saveAuthData(data.data);

            setSuccess(true);
            const successMessage = "Google signup/login successful! Redirecting...";
            setMessage(successMessage);
            showAppToast("success", successMessage);

            setTimeout(() => {
                router.push("/");
            }, 1200);
        } catch (error) {
            console.error("Google signup/login error:", error);
            setSuccess(false);
            const errorMessage = error.message || "Failed to continue with Google";
            setMessage(errorMessage);
            showAppToast("error", errorMessage);
        } finally {
            setGoogleLoading(false);
        }
    };

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

        if (window.__gsiPromptInProgress) {
            const errorMessage =
                "Google sign-in is already in progress. Please close it or try again in a moment.";
            setSuccess(false);
            setMessage(errorMessage);
            showAppToast("error", errorMessage);
            return;
        }

        setMessage("");
        window.__gsiPromptInProgress = true;
        window.google.accounts.id.prompt((notification) => {
            window.__gsiPromptInProgress = false;

            if (
                notification.isNotDisplayed?.() ||
                notification.isSkippedMoment?.()
            ) {
                const errorMessage =
                    "Google sign-in is blocked in your browser. Please use email or phone signup instead.";
                setSuccess(false);
                setMessage(errorMessage);
                showAppToast("error", errorMessage);
            }
        });
    };

    const features = [
        { icon: FaShieldAlt, text: "Safe & trusted daily service" },
        { icon: FaClock, text: "Regular route timings available" },
        { icon: FaMapMarkedAlt, text: "Shrivardhan • Borli • Borivali • Virar" },
    ];

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

    const renderForm = (isDesktop = false) => (
        <>
            <div className={`mb-6 flex flex-col items-center text-center ${isDesktop ? "" : ""}`}>
                <p className="text-[#E8A317] font-semibold text-[11px] sm:text-xs tracking-[0.18em]">
                    CREATE ACCOUNT
                </p>
                <h2 className="text-[30px] sm:text-[34px] xl:text-[36px] font-bold text-[#123b3a] mt-2 leading-tight">
                    Sign Up
                </h2>
                <p className="text-gray-500 mt-2 text-sm sm:text-[15px] leading-6 sm:leading-7 max-w-[340px]">
                    Join Morya Travels and start booking easily. Your password will be sent to your email after signup.
                </p>
            </div>

            {renderMessage()}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                    <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`w-full h-[52px] rounded-2xl border px-4 outline-none transition text-sm sm:text-[15px] ${errors.fullName
                            ? "border-red-500 bg-red-50"
                            : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                            }`}
                    />
                    {errors.fullName && (
                        <p className="text-red-500 text-xs sm:text-sm mt-2">{errors.fullName}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className={`w-full h-[52px] rounded-2xl border px-4 outline-none transition text-sm sm:text-[15px] ${errors.email
                            ? "border-red-500 bg-red-50"
                            : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                            }`}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs sm:text-sm mt-2">{errors.email}</p>
                    )}
                </div>

                {/* Phone Number */}
                <div>
                    <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        placeholder="Enter your 10-digit phone number"
                        className={`w-full h-[52px] rounded-2xl border px-4 outline-none transition text-sm sm:text-[15px] ${errors.phoneNumber
                            ? "border-red-500 bg-red-50"
                            : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                            }`}
                    />
                    {errors.phoneNumber && (
                        <p className="text-red-500 text-xs sm:text-sm mt-2">{errors.phoneNumber}</p>
                    )}
                </div>

                {/* Signup Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[52px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-sm sm:text-[15px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Creating Account..." : "Create Account"}
                </button>

                {/* Divider */}
                <div className="relative py-1">
                    <div className="border-t border-[#e7efee]" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[11px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
                        OR CONTINUE WITH
                    </span>
                </div>

                {/* Google Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full h-[52px] rounded-2xl border border-[#dce8e6] bg-white text-[#123b3a] font-semibold flex items-center justify-center gap-3 hover:bg-[#f8fbfa] transition text-sm sm:text-[15px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <FaGoogle className="text-[#EA4335] text-base" />
                    {googleLoading ? "Please wait..." : "Continue with Google"}
                </button>

                {/* Login Link */}
                <p className="text-center text-sm sm:text-[15px] text-gray-600 pt-1">
                    Already have an account?{" "}
                    <a
                        href="/login"
                        className="text-[#0E6B68] font-semibold hover:underline"
                    >
                        Login Now
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
                        {renderForm(false)}
                    </motion.div>
                </div>

                {/* ================= DESKTOP ================= */}
                <div className="hidden lg:grid lg:grid-cols-[0.96fr_0.9fr] gap-5 xl:gap-6 items-start">
                    {/* LEFT SIDE */}
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
                                Premium Bus Booking
                            </p>

                            <h2 className="mt-5 text-[42px] xl:text-[46px] font-bold leading-[1.08]">
                                Create Your
                                <br />
                                Account
                            </h2>

                            <p className="mt-4 text-white/85 text-[16px] leading-8 max-w-[430px]">
                                Join Morya Travels for easy booking, route updates, and a smooth premium bus travel experience.
                            </p>

                            <div className="mt-7 space-y-3">
                                {features.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/10 px-5 py-3"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                <Icon className="text-[#E8A317]" />
                                            </div>
                                            <span className="text-[15px] font-medium">
                                                {item.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-7 rounded-2xl bg-white/10 border border-white/10 p-5">
                                <p className="text-white/90 text-sm leading-7">
                                    After signup, a secure password will be automatically generated and sent directly to your registered email address.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT SIDE */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45 }}
                        className="bg-white rounded-[26px] shadow-lg border border-[#e7efee] px-7 py-7 xl:px-8 xl:py-8"
                    >
                        {renderForm(true)}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}