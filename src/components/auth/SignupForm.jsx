"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    FaShieldAlt,
    FaClock,
    FaMapMarkedAlt,
    FaGoogle,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";

export default function SignupForm() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validate = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Name is required";
        } else if (form.name.trim().length < 2) {
            newErrors.name = "Enter a valid full name";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!form.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ""))) {
            newErrors.phone = "Enter a valid 10-digit phone number";
        }

        if (!form.password.trim()) {
            newErrors.password = "Password is required";
        } else if (form.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!form.confirmPassword.trim()) {
            newErrors.confirmPassword = "Confirm your password";
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
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
            alert("Signup successful! Connect backend/API next.");
        }
    };

    const features = [
        { icon: FaShieldAlt, text: "Safe & trusted daily service" },
        { icon: FaClock, text: "Regular route timings available" },
        { icon: FaMapMarkedAlt, text: "Shrivardhan • Borli • Borivali • Virar" },
    ];

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
                        {/* Centered Header */}
                        <div className="mb-5 text-center flex flex-col items-center">
                            <p className="text-[#E8A317] font-semibold text-[11px] sm:text-xs tracking-[0.18em]">
                                CREATE ACCOUNT
                            </p>
                            <h2 className="text-[30px] sm:text-[34px] font-bold text-[#123b3a] mt-2 leading-tight">
                                Sign Up
                            </h2>
                            <p className="text-gray-500 mt-2 text-sm sm:text-[15px] leading-6 max-w-[320px]">
                                Join Morya Travels and start booking easily.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className={`w-full h-[50px] rounded-2xl border px-4 outline-none transition text-sm ${errors.name
                                        ? "border-red-500 bg-red-50"
                                        : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                        }`}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-2">{errors.name}</p>
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
                                    placeholder="Enter email address"
                                    className={`w-full h-[50px] rounded-2xl border px-4 outline-none transition text-sm ${errors.email
                                        ? "border-red-500 bg-red-50"
                                        : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                        }`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-2">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit phone number"
                                    className={`w-full h-[50px] rounded-2xl border px-4 outline-none transition text-sm ${errors.phone
                                        ? "border-red-500 bg-red-50"
                                        : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                        }`}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-2">{errors.phone}</p>
                                )}
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                className="w-full h-[50px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-sm"
                            >
                                Create Account
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

                            {/* Login Link */}
                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{" "}
                                <a
                                    href="/login"
                                    className="text-[#0E6B68] font-semibold hover:underline"
                                >
                                    Login Now
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

                            <h2 className="mt-5 text-[42px] xl:text-[46px] font-bold leading-[1.08]">
                                Create Your
                                <br />
                                Account
                            </h2>

                            <p className="mt-4 text-white/85 text-[16px] leading-8 max-w-[430px]">
                                Join Morya Travels for easy booking, route updates, and a smooth premium bus travel experience.
                            </p>

                            <div className="mt-6 space-y-3">
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
                        </div>
                    </motion.div>

                    {/* RIGHT FORM */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45 }}
                        className="bg-white rounded-[26px] shadow-lg border border-[#e7efee] px-7 py-7 xl:px-8 xl:py-8"
                    >
                        {/* Centered Header */}
                        <div className="mb-6 flex flex-col items-center text-center">
                            <p className="text-[#E8A317] font-semibold text-[12px] tracking-[0.18em]">
                                CREATE ACCOUNT
                            </p>
                            <h2 className="text-[32px] xl:text-[36px] font-bold text-[#123b3a] mt-2 leading-tight">
                                Sign Up
                            </h2>
                            <p className="text-gray-500 mt-2 text-[15px] leading-7 max-w-[360px]">
                                Join Morya Travels and start booking easily.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className={`w-full h-[50px] rounded-2xl border px-4 outline-none transition text-[15px] ${errors.name
                                        ? "border-red-500 bg-red-50"
                                        : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                        }`}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-2">{errors.name}</p>
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
                                    placeholder="Enter email address"
                                    className={`w-full h-[50px] rounded-2xl border px-4 outline-none transition text-[15px] ${errors.email
                                        ? "border-red-500 bg-red-50"
                                        : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                        }`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-[#123b3a] mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit phone number"
                                    className={`w-full h-[50px] rounded-2xl border px-4 outline-none transition text-[15px] ${errors.phone
                                        ? "border-red-500 bg-red-50"
                                        : "border-[#dce8e6] bg-[#f8fbfa] focus:border-[#0E6B68]"
                                        }`}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
                                )}
                            </div>

                            {/* Signup */}
                            <button
                                type="submit"
                                className="w-full h-[50px] rounded-2xl bg-[#0E6B68] text-white font-semibold hover:bg-[#0b5a57] transition shadow-md text-[15px]"
                            >
                                Create Account
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

                            {/* Login Link */}
                            <p className="text-center text-[15px] text-gray-600">
                                Already have an account?{" "}
                                <a
                                    href="/login"
                                    className="text-[#0E6B68] font-semibold hover:underline"
                                >
                                    Login Now
                                </a>
                            </p>
                        </form>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}