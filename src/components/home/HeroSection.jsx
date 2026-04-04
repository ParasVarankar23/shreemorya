"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaSearch,
    FaPlaneDeparture,
    FaChevronRight,
} from "react-icons/fa";

function HeroSection() {
    return (
        <section
            id="home"
            className="relative overflow-hidden bg-slate-950 text-white py-10"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.2),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.15),transparent_25%)]" />

            <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-28">
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col justify-center"
                >
                    <span className="mb-4 inline-flex w-fit rounded-full border border-teal-400/20 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-300">
                        Trusted Travel Partner For Daily Routes
                    </span>

                    <h2 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                        Book Your Journey With <span className="text-teal-400">Morya Travels</span>
                    </h2>

                    <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                        Fast booking, comfortable travel, and trusted pickup & drop service for your regular and seasonal routes.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link
                            href="#booking"
                            className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-6 py-3 font-semibold text-white shadow-xl shadow-teal-500/25 transition hover:bg-teal-600"
                        >
                            Start Booking <FaChevronRight className="text-xs" />
                        </Link>
                        <Link
                            href="#routes"
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                        >
                            View Routes
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9 }}
                    className="relative"
                >
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-xl">
                        <div className="relative h-[520px] overflow-hidden rounded-[1.5rem]">
                            <Image
                                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop"
                                alt="Morya Travels Hero"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* HERO BOOKING BAR */}
            <div id="booking" className="relative z-10 mx-auto mb-14 max-w-6xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="grid gap-4 rounded-[2rem] border border-white/10 bg-white p-4 shadow-2xl md:grid-cols-4 md:p-5"
                >
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <FaMapMarkerAlt className="text-teal-600" /> Select Pickup
                        </label>
                        <select className="w-full bg-transparent text-sm text-slate-700 outline-none">
                            <option>Choose Pickup</option>
                            <option>Satara</option>
                            <option>Pune</option>
                            <option>Panvel</option>
                            <option>Borivali</option>
                        </select>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <FaMapMarkerAlt className="text-sky-600" /> Select Drop
                        </label>
                        <select className="w-full bg-transparent text-sm text-slate-700 outline-none">
                            <option>Choose Drop</option>
                            <option>Mumbai</option>
                            <option>Panvel</option>
                            <option>Pune</option>
                            <option>Satara</option>
                        </select>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <FaCalendarAlt className="text-orange-500" /> Travel Date
                        </label>
                        <input type="date" className="w-full bg-transparent text-sm text-slate-700 outline-none" />
                    </div>

                    <button className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-900">
                        Search Bus
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
