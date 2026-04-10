"use client";

import { motion } from "framer-motion";
import { Playfair_Display } from "next/font/google";
import { FaRoute, FaClock, FaArrowRight } from "react-icons/fa";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
});

export default function RouteHero() {
    return (
        <section className="relative overflow-hidden bg-white py-20 md:py-24 text-black">
            {/* Soft Premium Background */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.03]"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80')",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f8fbfa] to-[#fefaf1]" />

            {/* Decorative blobs */}
            <div className="absolute top-10 right-10 w-40 h-40 bg-[#0E6B68]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-52 h-52 bg-[#E8A317]/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
                    {/* LEFT CONTENT */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.75 }}
                        viewport={{ once: true }}
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white border border-[#e7efee] px-4 py-2 rounded-full text-[#0E6B68] font-semibold text-sm shadow-md mb-6">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#7ed321]" />
                            Premium Daily Travel Routes
                        </div>

                        {/* Heading */}
                        <h1
                            className={`${playfair.className} text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-[#111827]`}
                        >
                            Morya Travels
                            <br />
                            <span className="text-[#0E6B68]">Route Schedule</span>
                        </h1>

                        {/* Description */}
                        <p className="mt-6 text-gray-600 text-base sm:text-lg leading-8 max-w-2xl">
                            Check our daily route timings for safe, comfortable, and trusted
                            travel between Shrivardhan, Borli, Borivali, and Virar with
                            Shree Morya Travels regular passenger service.
                        </p>

                        {/* Premium Info Chips */}
                        <div className="mt-8 flex flex-wrap gap-4">
                            <div className="bg-white border border-[#e7efee] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg hover:shadow-xl transition">
                                <FaRoute className="text-[#0E6B68] text-lg" />
                                <div>
                                    <p className="text-xs text-gray-500">Route Coverage</p>
                                    <p className="font-semibold text-[#111827]">
                                        4 Daily Route Timings
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white border border-[#e7efee] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg hover:shadow-xl transition">
                                <FaClock className="text-[#E8A317] text-lg" />
                                <div>
                                    <p className="text-xs text-gray-500">Available Timings</p>
                                    <p className="font-semibold text-[#111827]">
                                        1:30 PM • 2:00 PM • 8:30 PM • 9:00 PM
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-10 flex flex-wrap gap-4">
                            <button className="bg-[#0E6B68] hover:bg-[#0b5956] text-white px-7 py-3.5 rounded-full font-semibold shadow-xl transition flex items-center gap-2">
                                View Timings
                                <FaArrowRight className="text-sm" />
                            </button>

                            <button className="bg-white border border-[#dce8e7] hover:border-[#0E6B68] text-[#111827] px-7 py-3.5 rounded-full font-semibold shadow-md hover:shadow-lg transition">
                                Check Routes
                            </button>
                        </div>
                    </motion.div>

                    {/* RIGHT PREMIUM CARD */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.75 }}
                        viewport={{ once: true }}
                    >
                        <div className="relative bg-white/90 backdrop-blur-xl rounded-[36px] p-6 md:p-8 xl:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-white/80">
                            {/* Top glow */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#E8A317]/15 rounded-full blur-2xl" />

                            {/* Heading */}
                            <div className="mb-6">
                                <h3
                                    className={`${playfair.className} text-2xl md:text-3xl font-bold text-[#111827]`}
                                >
                                    Quick Route Info
                                </h3>
                                <p className="text-gray-500 mt-2">
                                    Regular service for daily passengers
                                </p>
                            </div>

                            {/* Route Info Cards */}
                            <div className="space-y-4">
                                <div className="rounded-3xl border border-[#e7efee] bg-gradient-to-r from-[#f8fbfa] to-white p-5 shadow-sm">
                                    <p className="text-sm text-[#0E6B68] font-semibold">
                                        Main Route
                                    </p>
                                    <h4 className="text-lg md:text-xl font-bold mt-2 text-[#111827] leading-snug">
                                        Shrivardhan → Borli → Borivali → Virar
                                    </h4>
                                </div>

                                <div className="rounded-3xl border border-[#fde7b0] bg-gradient-to-r from-[#fff9eb] to-white p-5 shadow-sm">
                                    <p className="text-sm text-[#E8A317] font-semibold">
                                        Return Route
                                    </p>
                                    <h4 className="text-lg md:text-xl font-bold mt-2 text-[#111827] leading-snug">
                                        Virar → Borivali → Borli → Shrivardhan
                                    </h4>
                                </div>
                            </div>

                            {/* Bottom CTA */}
                            <button className="mt-7 w-full bg-[#0E6B68] hover:bg-[#0b5956] text-white py-3.5 rounded-full font-semibold transition shadow-xl">
                                View All Timings
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}