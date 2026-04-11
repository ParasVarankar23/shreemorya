"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm() {
    const [form, setForm] = useState({
        emailOrPhone: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        const newErrors = {};

        if (!form.emailOrPhone.trim()) {
            newErrors.emailOrPhone = "Email or phone number is required";
        } else {
            const cleaned = form.emailOrPhone.replace(/\D/g, "");
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailOrPhone);
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

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

        setErrors((prev) => ({
            ...prev,
            [e.target.name]: "",
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            alert("Login successful! Connect backend/API next.");
        }
    };

    return (
        <main className="bg-[#f8fbfa] py-15 sm:py-10 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ================= MOBILE / TABLET (ONLY FORM) ================= */}
                <div className="lg:hidden flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="w-full max-w-lg bg-white rounded-[22px] shadow-lg border border-[#e7efee] p-5 sm:p-6"
                    >
                        {/* CENTERED HEADER */}
                        <div className="mb-5 text-center flex flex-col items-center">
                            <p className="text-[#E8A317] font-semibold text-[11px] sm:text-xs tracking-[0.18em]">
                                WELCOME BACK
                            </p>
                            <h2 className="text-[32px] sm:text-[36px] font-bold text-[#123b3a] mt-2 leading-tight">
                                Login
                            </h2>
                            <p className="text-gray-500 mt-2 text-sm sm:text-[15px] leading-6 max-w-[320px]">
                                Sign in to continue your booking journey.
                            </p>
                        </div>

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
                                    className={`w-full h-[50px] rounded-2xl border px-4 outline-none transition text-sm ${errors.emailOrPhone
                                        ? "border-red-500 bg-red-50"
                                        : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                        }`}
                                />
                                {errors.emailOrPhone && (
                                    <p className="text-red-500 text-xs mt-2">{errors.emailOrPhone}</p>
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
                                        className={`w-full h-[50px] rounded-2xl border px-4 pr-12 outline-none transition text-sm ${errors.password
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
                                    <p className="text-red-500 text-xs mt-2">{errors.password}</p>
                                )}
                            </div>

                            {/* Forgot */}
                            <div className="flex justify-end">
                                <a
                                    href="/forgot-password"
                                    className="text-sm font-semibold text-[#0E6B68] hover:text-[#0b5a57] transition"
                                >
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Login */}
                            <button
                                type="submit"
                                className="w-full h-[50px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-sm"
                            >
                                Login
                            </button>

                            {/* Divider */}
                            <div className="relative py-1">
                                <div className="border-t border-[#e7efee]" />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500 font-medium whitespace-nowrap">
                                    OR CONTINUE WITH
                                </span>
                            </div>

                            {/* Google */}
                            <button
                                type="button"
                                className="w-full h-[50px] rounded-2xl border border-[#dce8e6] bg-white text-[#123b3a] font-semibold flex items-center justify-center gap-3 hover:bg-[#f8fbfa] transition text-sm"
                            >
                                <FaGoogle className="text-[#EA4335] text-base" />
                                Continue with Google
                            </button>

                            {/* Signup */}
                            <p className="text-center text-sm text-gray-600">
                                Don&apos;t have an account?{" "}
                                <a
                                    href="/signup"
                                    className="text-[#0E6B68] font-semibold hover:underline"
                                >
                                    Create Account
                                </a>
                            </p>
                        </form>
                    </motion.div>
                </div>

                {/* ================= DESKTOP (LEFT + RIGHT) ================= */}
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
                        </div>
                    </motion.div>

                    {/* RIGHT FORM */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45 }}
                        className="bg-white rounded-[26px] shadow-lg border border-[#e7efee] px-7 py-7 xl:px-8 xl:py-8"
                    >
                        {/* ===== CENTERED HEADER SECTION ===== */}
                        <div className="mb-6 flex flex-col items-center text-center">
                            <p className="text-[#E8A317] font-semibold text-[12px] tracking-[0.18em]">
                                WELCOME BACK
                            </p>

                            <h2 className="text-[34px] xl:text-[38px] font-bold text-[#123b3a] mt-2 leading-tight">
                                Login
                            </h2>

                            <p className="text-gray-500 mt-2 text-[15px] leading-7 max-w-[360px]">
                                Sign in to continue your booking journey.
                            </p>
                        </div>

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
                                    className={`w-full h-[50px] rounded-2xl border px-4 outline-none transition text-[15px] ${errors.emailOrPhone
                                        ? "border-red-500 bg-red-50"
                                        : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                        }`}
                                />
                                {errors.emailOrPhone && (
                                    <p className="text-red-500 text-sm mt-2">{errors.emailOrPhone}</p>
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
                                        className={`w-full h-[50px] rounded-2xl border px-4 pr-12 outline-none transition text-[15px] ${errors.password
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
                                    <p className="text-red-500 text-sm mt-2">{errors.password}</p>
                                )}
                            </div>

                            {/* Forgot */}
                            <div className="flex justify-end">
                                <a
                                    href="/forgot-password"
                                    className="text-sm font-semibold text-[#0E6B68] hover:text-[#0b5a57] transition"
                                >
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Login */}
                            <button
                                type="submit"
                                className="w-full h-[50px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-[15px]"
                            >
                                Login
                            </button>

                            {/* Divider */}
                            <div className="relative py-1">
                                <div className="border-t border-[#e7efee]" />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500 font-medium whitespace-nowrap">
                                    OR CONTINUE WITH
                                </span>
                            </div>

                            {/* Google */}
                            <button
                                type="button"
                                className="w-full h-[50px] rounded-2xl border border-[#dce8e6] bg-white text-[#123b3a] font-semibold flex items-center justify-center gap-3 hover:bg-[#f8fbfa] transition text-[15px]"
                            >
                                <FaGoogle className="text-[#EA4335] text-base" />
                                Continue with Google
                            </button>

                            {/* Signup */}
                            <p className="text-center text-[15px] text-gray-600">
                                Don&apos;t have an account?{" "}
                                <a
                                    href="/signup"
                                    className="text-[#0E6B68] font-semibold hover:underline"
                                >
                                    Create Account
                                </a>
                            </p>
                        </form>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}