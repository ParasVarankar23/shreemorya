"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bus, ShieldCheck, Settings2 } from "lucide-react";

const CONSENT_KEY = "shree_morya_cookie_consent";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [showManage, setShowManage] = useState(false);
    const [analytics, setAnalytics] = useState(false);

    useEffect(() => {
        const savedConsent = globalThis.localStorage.getItem(CONSENT_KEY);
        if (!savedConsent) {
            setIsVisible(true);
        }
    }, []);

    const saveConsent = (value) => {
        globalThis.localStorage.setItem(CONSENT_KEY, value);
        setIsVisible(false);
        setShowManage(false);
    };

    const saveCustomConsent = () => {
        const value = analytics ? "custom_analytics_on" : "custom_analytics_off";
        saveConsent(value);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-x-3 bottom-3 z-[80] sm:inset-x-4 sm:bottom-4">
            <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-r from-[#0B5D5A] via-[#0D6663] to-[#0E6F6B] shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">

                {/* TOP GOLD LINE */}
                <div className="h-1 w-full bg-gradient-to-r from-[#F4B31A] via-[#FFD166] to-[#F4B31A]" />

                {!showManage ? (
                    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                            {/* LEFT CONTENT */}
                            <div className="flex-1">
                                {/* badge */}
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md">
                                    <ShieldCheck className="h-4 w-4 text-[#FFD166]" />
                                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFE08A] sm:text-sm">
                                        Shree Morya Travels Privacy
                                    </span>
                                </div>

                                <h3 className="mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[34px]">
                                    We use cookies to improve your journey
                                </h3>

                                <p className="mt-3 max-w-4xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
                                    At{" "}
                                    <span className="font-semibold text-[#FFE08A]">
                                        Shree Morya Travels
                                    </span>
                                    , we use essential cookies to keep the website secure and running
                                    smoothly, and optional analytics cookies to improve your booking
                                    experience. Please review our
                                    <Link
                                        href="/privacy"
                                        className="mx-1 font-semibold text-[#FFD166] hover:text-[#FFE08A] transition"
                                    >
                                        Privacy Policy
                                    </Link>
                                    and
                                    <Link
                                        href="/terms"
                                        className="ml-1 font-semibold text-[#FFD166] hover:text-[#FFE08A] transition"
                                    >
                                        Terms & Conditions
                                    </Link>
                                    .
                                </p>

                                {/* small feature chips */}
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90">
                                        <Bus className="h-4 w-4 text-[#F4B31A]" />
                                        Safe Booking Experience
                                    </div>

                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90">
                                        <ShieldCheck className="h-4 w-4 text-[#F4B31A]" />
                                        Privacy Protected
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT ACTIONS */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:w-auto lg:shrink-0">
                                <button
                                    type="button"
                                    onClick={() => saveConsent("cancelled")}
                                    className="inline-flex min-w-[120px] items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:border-white/25 hover:bg-white/15"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowManage(true)}
                                    className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:border-white/25 hover:bg-white/15"
                                >
                                    <Settings2 className="h-4 w-4" />
                                    Manage
                                </button>

                                <button
                                    type="button"
                                    onClick={() => saveConsent("accepted_all")}
                                    className="inline-flex min-w-[155px] items-center justify-center rounded-full bg-[#F4B31A] px-6 py-3 text-sm font-bold text-[#12312F] shadow-[0_10px_30px_rgba(244,179,26,0.35)] transition duration-300 hover:scale-[1.03] hover:bg-[#FFD166]"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
                        <div className="flex flex-col gap-5">

                            {/* Header */}
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-md">
                                    <Settings2 className="h-4 w-4 text-[#FFD166]" />
                                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFE08A] sm:text-sm">
                                        Manage Cookie Preferences
                                    </span>
                                </div>

                                <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                                    Choose which cookies you want to allow
                                </h3>

                                <p className="mt-2 text-sm text-white/80 sm:text-base">
                                    Essential cookies remain enabled for secure website functionality
                                    on Shree Morya Travels.
                                </p>
                            </div>

                            {/* Settings Card */}
                            <div className="rounded-[24px] border border-white/10 bg-white/95 p-4 shadow-xl sm:p-6">
                                {/* Essential */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-[#12312F] sm:text-base">
                                            Essential Cookies
                                        </p>
                                        <p className="text-xs text-slate-600 sm:text-sm">
                                            Required for secure website access, page performance,
                                            and smooth booking flow.
                                        </p>
                                    </div>

                                    <span className="inline-flex w-fit rounded-full border border-[#F4B31A]/30 bg-[#F4B31A]/15 px-3 py-1 text-xs font-bold text-[#A96E00]">
                                        Always Active
                                    </span>
                                </div>

                                <div className="my-5 h-px w-full bg-slate-200" />

                                {/* Analytics */}
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-[#12312F] sm:text-base">
                                            Analytics Cookies
                                        </p>
                                        <p className="text-xs text-slate-600 sm:text-sm">
                                            Helps Shree Morya Travels understand visitors and improve
                                            routes, booking pages, and overall customer experience.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setAnalytics(!analytics)}
                                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition duration-300 ${analytics ? "bg-[#0B5D5A]" : "bg-slate-300"
                                            }`}
                                        aria-pressed={analytics}
                                        aria-label="Toggle analytics cookies"
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-300 ${analytics ? "translate-x-9" : "translate-x-1"
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowManage(false)}
                                    className="inline-flex min-w-[120px] items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/15"
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    onClick={saveCustomConsent}
                                    className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-[#F4B31A] px-6 py-3 text-sm font-bold text-[#12312F] shadow-[0_10px_30px_rgba(244,179,26,0.35)] transition duration-300 hover:scale-[1.03] hover:bg-[#FFD166]"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}