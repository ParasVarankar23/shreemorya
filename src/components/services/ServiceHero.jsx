"use client";

import { motion } from "framer-motion";
import { FaBusAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";

export default function ServiceHero() {
    return (
        <section className="relative overflow-hidden bg-[#0E6B68] text-white pt-28 md:pt-32 pb-16 md:pb-20">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-15"
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
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                    >
                        <p className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-[#f5ad1b] font-semibold text-sm mb-5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#7ed321]" />
                            Daily Route Service
                        </p>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                            Regular Bus
                            <br />
                            <span className="text-[#f5ad1b]">Service Routes</span>
                        </h1>

                        <p className="mt-5 text-white/85 text-base sm:text-lg leading-8 max-w-2xl">
                            Comfortable, safe, and trusted daily travel with Morya Tours &
                            Travels. Book your seat easily for your regular route between
                            Shrivardhan, Borli, Borivali, and Virar.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <FaMapMarkerAlt className="text-[#f5ad1b]" />
                                <span className="font-medium">Shrivardhan → Virar</span>
                            </div>

                            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <FaClock className="text-[#f5ad1b]" />
                                <span className="font-medium">8:30 PM & 9:00 PM</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT CARD */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-2xl text-[#123b3a]">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-14 h-14 rounded-2xl bg-[#0E6B68] text-white flex items-center justify-center">
                                    <FaBusAlt className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Daily Schedule</h3>
                                    <p className="text-sm text-gray-500">Regular service timing</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-[#e7efee] bg-[#f8fbfa] p-4">
                                    <p className="text-sm text-[#0E6B68] font-semibold">Departure Route</p>
                                    <h4 className="text-lg font-bold mt-1">
                                        Shrivardhan → Borli → Borivali → Virar
                                    </h4>
                                    <p className="mt-2 text-[#f5ad1b] font-bold text-lg">8:30 PM</p>
                                </div>

                                <div className="rounded-2xl border border-[#e7efee] bg-[#f8fbfa] p-4">
                                    <p className="text-sm text-[#0E6B68] font-semibold">Return Route</p>
                                    <h4 className="text-lg font-bold mt-1">
                                        Virar → Borivali → Borli → Shrivardhan
                                    </h4>
                                    <p className="mt-2 text-[#f5ad1b] font-bold text-lg">9:00 PM</p>
                                </div>
                            </div>

                            <button className="mt-6 w-full bg-[#7ed321] hover:bg-[#73c51d] text-[#123b3a] py-3 rounded-full font-semibold transition">
                                Book Your Seat
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}