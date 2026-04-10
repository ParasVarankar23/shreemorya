"use client";

import { motion } from "framer-motion";
import { FaRoute, FaClock } from "react-icons/fa";

export default function RouteHero() {
    return (
        <section className="relative overflow-hidden bg-[#0E6B68] py-20 md:py-24 text-white">
            {/* Background overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-10"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80')",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0E6B68]/95 via-[#0E6B68]/90 to-[#0E6B68]/85" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    {/* LEFT */}
                    <motion.div
                        initial={{ opacity: 0, x: -35 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                    >
                        <p className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-[#f5ad1b] font-semibold text-sm mb-5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#7ed321]" />
                            Daily Travel Routes
                        </p>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                            Morya Travels
                            <br />
                            <span className="text-[#f5ad1b]">Route Schedule</span>
                        </h1>

                        <p className="mt-5 text-white/85 text-base sm:text-lg leading-8 max-w-2xl">
                            Check our daily route timings for regular comfortable travel
                            between Shrivardhan, Borli, Borivali, and Virar with trusted
                            Morya Tours & Travels service.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <FaRoute className="text-[#f5ad1b]" />
                                <span className="font-medium">4 Daily Route Timings</span>
                            </div>

                            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <FaClock className="text-[#f5ad1b]" />
                                <span className="font-medium">1:30 PM • 2:00 PM • 8:30 PM • 9:00 PM</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT CARD */}
                    <motion.div
                        initial={{ opacity: 0, x: 35 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-2xl text-[#123b3a]">
                            <h3 className="text-2xl md:text-3xl font-bold">Quick Route Info</h3>
                            <p className="text-gray-500 mt-2">Regular service for daily passengers</p>

                            <div className="mt-6 space-y-4">
                                <div className="rounded-2xl bg-[#f8fbfa] border border-[#e7efee] p-4">
                                    <p className="text-sm text-[#0E6B68] font-semibold">Main Route</p>
                                    <h4 className="text-lg md:text-xl font-bold mt-1">
                                        Shrivardhan → Borli → Borivali → Virar
                                    </h4>
                                </div>

                                <div className="rounded-2xl bg-[#fff9eb] border border-[#fde7b0] p-4">
                                    <p className="text-sm text-[#f5ad1b] font-semibold">Return Route</p>
                                    <h4 className="text-lg md:text-xl font-bold mt-1">
                                        Virar → Borivali → Borli → Shrivardhan
                                    </h4>
                                </div>
                            </div>

                            <button className="mt-6 w-full bg-[#7ed321] hover:bg-[#73c51d] text-[#123b3a] py-3 rounded-full font-semibold transition">
                                View All Timings
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}