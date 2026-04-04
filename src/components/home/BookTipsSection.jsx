"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaBusAlt, FaMapMarkerAlt, FaWallet } from "react-icons/fa";

const tips = [
    {
        icon: FaBusAlt,
        title: "Choose Destination",
    },
    {
        icon: FaMapMarkerAlt,
        title: "Make Payment",
    },
    {
        icon: FaWallet,
        title: "Ready For Booking",
    },
];

function BookingTipsSection() {
    return (
        <section className="bg-[#FFF8EE] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, x: -25 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="rounded-[2rem] bg-white px-5 py-6 shadow-lg sm:px-6 sm:py-8"
                >
                    <p className="text-sm font-semibold text-[#F4A61D] sm:text-base">
                        3 Easy Steps for Book Your Next Trip
                    </p>

                    <h2 className="py-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                        Simple Booking Process
                    </h2>

                    <div className="grid gap-4 py-4">
                        {tips.map((tip, index) => {
                            const Icon = tip.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-4"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF7F7] text-[#0D5B5B]">
                                        <Icon />
                                    </div>
                                    <p className="font-semibold text-slate-800">{tip.title}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 25 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                >
                    <div className="relative h-[320px] overflow-hidden rounded-[2rem] sm:h-[420px] lg:h-[500px]">
                        <Image
                            src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop"
                            alt="Travel Booking"
                            fill
                            className="object-cover"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default BookingTipsSection;