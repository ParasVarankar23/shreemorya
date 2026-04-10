"use client";

import { motion } from "framer-motion";
import { Playfair_Display } from "next/font/google";
import { FaBusAlt, FaClock, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
});

export default function ServiceHero() {
    return (
        <section className="relative overflow-hidden bg-white text-black py-20 md:py-24">
            {/* Soft premium background */}
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
                            Premium Daily Route Service
                        </div>

                        {/* Heading */}
                        <h1
                            className={`${playfair.className} text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-[#111827]`}
                        >
                            Comfortable
                            <br />
                            <span className="text-[#0E6B68]">Daily Bus Service</span>
                        </h1>

                        {/* Sub text */}
                        <p className="mt-6 text-gray-600 text-base sm:text-lg leading-8 max-w-2xl">
                            Travel with confidence through our trusted daily routes. Shree
                            Morya Travels offers safe, comfortable, and premium regular travel
                            between Shrivardhan, Borli, Borivali, and Virar with smooth
                            pickup support and reliable timing.
                        </p>

                        {/* Premium chips */}
                        <div className="mt-8 flex flex-wrap gap-4">
                            <div className="bg-white border border-[#e7efee] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg hover:shadow-xl transition">
                                <FaMapMarkerAlt className="text-[#0E6B68] text-lg" />
                                <div>
                                    <p className="text-xs text-gray-500">Main Route</p>
                                    <p className="font-semibold text-[#111827]">
                                        Shrivardhan → Virar
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white border border-[#e7efee] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg hover:shadow-xl transition">
                                <FaClock className="text-[#E8A317] text-lg" />
                                <div>
                                    <p className="text-xs text-gray-500">Departure</p>
                                    <p className="font-semibold text-[#111827]">
                                        8:30 PM & 9:00 PM
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-10 flex flex-wrap gap-4">
                            <button className="bg-[#0E6B68] hover:bg-[#0b5956] text-white px-7 py-3.5 rounded-full font-semibold shadow-xl transition flex items-center gap-2">
                                Book Your Seat
                                <FaArrowRight className="text-sm" />
                            </button>

                            <button className="bg-white border border-[#dce8e7] hover:border-[#0E6B68] text-[#111827] px-7 py-3.5 rounded-full font-semibold shadow-md hover:shadow-lg transition">
                                View Timings
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

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#0E6B68] to-[#0b5956] text-white flex items-center justify-center shadow-lg">
                                    <FaBusAlt className="text-2xl" />
                                </div>

                                <div>
                                    <h3
                                        className={`${playfair.className} text-2xl md:text-3xl font-bold text-[#111827]`}
                                    >
                                        Daily Schedule
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Trusted regular passenger service
                                    </p>
                                </div>
                            </div>

                            {/* Route cards */}
                            <div className="space-y-4">
                                <div className="rounded-3xl border border-[#e7efee] bg-gradient-to-r from-[#f8fbfa] to-white p-5 shadow-sm">
                                    <p className="text-sm text-[#0E6B68] font-semibold">
                                        Departure Route
                                    </p>
                                    <h4 className="text-lg md:text-xl font-bold mt-2 text-[#111827] leading-snug">
                                        Shrivardhan → Borli → Borivali → Virar
                                    </h4>
                                    <div className="mt-3 inline-flex items-center gap-2 bg-[#ecf8f7] text-[#0E6B68] px-3 py-1.5 rounded-full text-sm font-semibold">
                                        <FaClock className="text-xs" />
                                        8:30 PM
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-[#fde7b0] bg-gradient-to-r from-[#fff9eb] to-white p-5 shadow-sm">
                                    <p className="text-sm text-[#E8A317] font-semibold">
                                        Return Route
                                    </p>
                                    <h4 className="text-lg md:text-xl font-bold mt-2 text-[#111827] leading-snug">
                                        Virar → Borivali → Borli → Shrivardhan
                                    </h4>
                                    <div className="mt-3 inline-flex items-center gap-2 bg-[#fff3cf] text-[#b77900] px-3 py-1.5 rounded-full text-sm font-semibold">
                                        <FaClock className="text-xs" />
                                        9:00 PM
                                    </div>
                                </div>
                            </div>

                            {/* Bottom CTA */}
                            <button className="mt-7 w-full bg-[#0E6B68] hover:bg-[#0b5956] text-white py-3.5 rounded-full font-semibold transition shadow-xl">
                                Check Full Route Schedule
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}