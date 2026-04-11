"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    FaMapMarkerAlt,
    FaRoute,
    FaCalendarAlt,
    FaSearch,
    FaChair,
    FaCreditCard,
    FaPhoneAlt,
    FaCheckCircle,
    FaBus,
} from "react-icons/fa";

const bookingSteps = [
    {
        id: "1",
        title: "Select Pickup & Drop",
        desc: "Choose your boarding point and destination for a smooth travel experience.",
        icon: FaMapMarkerAlt,
    },
    {
        id: "2",
        title: "Choose Travel Date",
        desc: "Select your preferred journey date and check available bus schedules.",
        icon: FaCalendarAlt,
    },
    {
        id: "3",
        title: "Search Available Buses",
        desc: "View routes, timings, and seat availability for your selected travel date.",
        icon: FaSearch,
    },
    {
        id: "4",
        title: "Select Your Seat",
        desc: "Choose your preferred seat easily from the available seat layout.",
        icon: FaChair,
    },
    {
        id: "5",
        title: "Enter Details & Pay",
        desc: "Fill in passenger details and complete secure online payment quickly.",
        icon: FaCreditCard,
    },
    {
        id: "6",
        title: "Get Instant Confirmation",
        desc: "Receive your booking confirmation instantly and travel with confidence.",
        icon: FaCheckCircle,
    },
];

const highlights = [
    "Safe & Comfortable Travel",
    "Trusted Daily Routes",
    "Easy Online Booking",
    "Instant Ticket Confirmation",
];

export default function CallUsSection() {
    return (
        <section className="relative py-10 md:py-20 lg:py-20 bg-[#f8fbfa] overflow-hidden">
            {/* DECOR */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#f4efe1] to-transparent" />
            <div className="absolute -top-8 left-0 w-52 h-52 rounded-full bg-[#f4b32c]/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#0d5b5a]/8 blur-3xl" />

            <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14">
                {/* TOP CONTENT */}
                <div className="grid lg:grid-cols-2 gap-10 xl:gap-14 items-center">
                    {/* LEFT CONTENT */}
                    <div>
                        <div className="mb-8">
                            <p className="text-[#f4b32c] font-semibold text-lg sm:text-xl">
                                6 Easy Steps
                            </p>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#123b3a] mt-2 leading-tight">
                                Book Your Next Journey
                            </h2>
                            <p className="text-gray-600 mt-4 text-sm sm:text-base md:text-lg leading-7 max-w-2xl">
                                Morya Travels makes bus booking simple, fast, and secure. Follow
                                these easy steps to book your seat and enjoy a smooth journey.
                            </p>
                        </div>

                        {/* STEPS */}
                        <div className="space-y-4">
                            {bookingSteps.map((step, index) => {
                                const Icon = step.icon;

                                return (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.08 }}
                                        viewport={{ once: true }}
                                        className="group flex items-center gap-3 sm:gap-4 bg-white rounded-[24px] p-3 sm:p-4 shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-[#e8efee] hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)] transition-all duration-300"
                                    >
                                        {/* STEP NUMBER */}
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0d5b5a] text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg shrink-0">
                                            {step.id}
                                        </div>

                                        {/* TEXT */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm sm:text-base md:text-lg font-bold text-[#123b3a]">
                                                {step.title}
                                            </h4>
                                            <p className="text-[12px] sm:text-sm text-gray-600 mt-1 leading-5 sm:leading-6">
                                                {step.desc}
                                            </p>
                                        </div>

                                        {/* ICON */}
                                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-[3px] border-[#f4b32c] text-[#0d5b5a] flex items-center justify-center bg-white shadow-md shrink-0">
                                            <Icon className="text-lg sm:text-xl" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT VISUAL */}
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-[340px] sm:max-w-[440px] md:max-w-[520px] lg:max-w-[560px] xl:max-w-[620px]">
                            {/* BG CARD */}
                            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-[#fff8e8] via-[#f9f6ec] to-[#eef8f6] shadow-[0_30px_80px_rgba(0,0,0,0.08)]" />

                            {/* MAIN CONTENT BOX */}
                            <div className="relative rounded-[40px] p-6 sm:p-8 md:p-10 min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] overflow-hidden">
                                {/* FLOATING BADGES */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="absolute top-5 left-5 sm:top-6 sm:left-6 z-20 bg-[#f4b32c] text-[#123b3a] rounded-[20px] px-4 py-3 shadow-xl"
                                >
                                    <p className="text-xs sm:text-sm font-semibold">Special Route Offer</p>
                                    <h4 className="text-2xl sm:text-4xl font-bold leading-none mt-1">
                                        24/7
                                    </h4>
                                    <p className="text-xs sm:text-sm font-semibold mt-1">Support Available</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="absolute top-8 right-4 sm:right-6 z-20 hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-[#e8efee]"
                                >
                                    <FaBus className="text-[#0d5b5a]" />
                                    <span className="text-sm font-semibold text-[#123b3a]">
                                        Daily Bus Service
                                    </span>
                                </motion.div>

                                {/* HERO IMAGE */}
                                <div className="absolute bottom-0 right-0 left-0 flex justify-center items-end h-full z-10">
                                    <div className="relative w-[280px] sm:w-[360px] md:w-[420px] lg:w-[480px] h-[420px] sm:h-[500px] md:h-[560px] lg:h-[620px]">
                                        <Image
                                            src="/hero.png"
                                            alt="Morya Travels Hero"
                                            fill
                                            priority
                                            className="object-contain object-bottom"
                                        />
                                    </div>
                                </div>

                                {/* VERTICAL TEXT */}
                                <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rotate-180 writing-mode-vertical hidden xl:flex items-center gap-2 z-20">
                                    <span className="text-[#f4b32c] text-5xl font-semibold italic tracking-wide">
                                        Journey
                                    </span>
                                </div>

                                {/* MINI FLOATING ICONS */}
                                <div className="absolute left-4 sm:left-8 bottom-28 sm:bottom-32 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                                    <FaRoute className="text-[#0d5b5a] text-base sm:text-lg" />
                                </div>

                                <div className="absolute right-12 sm:right-16 top-1/3 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                                    <FaBus className="text-[#f4b32c] text-base sm:text-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM CALL US PANEL */}
                <div className="mt-12 lg:mt-16">
                    <div className="relative bg-[#0d6a69] rounded-[30px] lg:rounded-[40px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.15)]">
                        {/* CLOUD STYLE TOP */}
                        <div className="relative h-10 sm:h-12 lg:h-16 bg-white">
                            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 sm:gap-3">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white rounded-full translate-y-1/2"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="relative px-5 sm:px-8 lg:px-10 py-10 sm:py-12 lg:py-14">
                            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
                                {/* LEFT */}
                                <div>
                                    <p className="text-white/90 text-sm sm:text-base font-medium">
                                        Why Choose Us?
                                    </p>

                                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2">
                                        Trusted Travel Service for Daily Routes
                                    </h3>

                                    <div className="grid sm:grid-cols-2 gap-3 mt-6">
                                        {highlights.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <span className="w-3.5 h-3.5 rounded-full bg-[#f4b32c] shrink-0" />
                                                <span className="text-white/90 text-sm sm:text-base">
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="mt-7 bg-[#7ed321] hover:bg-[#6fc01c] text-[#123b3a] px-6 sm:px-7 py-3 rounded-full font-semibold transition shadow-lg">
                                        Discover More
                                    </button>
                                </div>

                                {/* RIGHT */}
                                <div className="relative">
                                    <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 lg:p-10">
                                        <p className="text-[#f4b32c] text-lg sm:text-xl font-semibold">
                                            24 Hours Service
                                        </p>

                                        <h3 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">
                                            CALL US
                                        </h3>

                                        <a
                                            href="tel:+918888157744"
                                            className="mt-4 inline-flex items-center gap-3 text-[#7ed321] text-xl sm:text-2xl lg:text-3xl font-bold hover:text-white transition"
                                        >
                                            <span className="w-12 h-12 rounded-full bg-[#f4b32c] text-[#123b3a] flex items-center justify-center shadow-lg">
                                                <FaPhoneAlt />
                                            </span>
                                            +91 88881 57744
                                        </a>

                                        <p className="text-white/80 mt-4 text-sm sm:text-base leading-7">
                                            Need help with booking, routes, seat selection, or payment?
                                            Our support team is ready to assist you anytime for a smooth
                                            travel experience.
                                        </p>

                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <span className="px-4 py-2 rounded-full bg-white/10 text-white text-sm border border-white/10">
                                                Fast Support
                                            </span>
                                            <span className="px-4 py-2 rounded-full bg-white/10 text-white text-sm border border-white/10">
                                                Booking Help
                                            </span>
                                            <span className="px-4 py-2 rounded-full bg-white/10 text-white text-sm border border-white/10">
                                                Route Guidance
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BOTTOM SILHOUETTE STYLE */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 lg:h-20 opacity-10 pointer-events-none">
                                <div className="w-full h-full bg-gradient-to-t from-black/30 to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .writing-mode-vertical {
          writing-mode: vertical-rl;
        }
      `}</style>
        </section>
    );
}