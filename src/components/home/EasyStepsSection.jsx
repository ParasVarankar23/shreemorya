"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaTicketAlt, FaBusAlt } from "react-icons/fa";

const steps = [
    {
        id: "1",
        title: "Choose Your Destination",
        desc: "Select pickup and drop point easily.",
        icon: FaMapMarkerAlt,
    },
    {
        id: "2",
        title: "Make Your Payment",
        desc: "Secure and quick payment process.",
        icon: FaTicketAlt,
    },
    {
        id: "3",
        title: "Easy Way To Travel",
        desc: "Enjoy your smooth travel experience.",
        icon: FaBusAlt,
    },
];

function EasyStepsSection() {
    return (
        <section className="bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-sm font-semibold text-[#0D5B5B] sm:text-base">
                        Easy Steps <span className="text-[#F4A61D] italic">For Booking</span>
                    </p>
                    <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                        Book in 3 Simple Steps
                    </h2>
                </div>

                <div className="grid gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3 lg:py-10">
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="rounded-[2rem] border border-slate-200 bg-white px-5 py-6 text-center shadow-sm"
                            >
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF7F7] text-[#0D5B5B]">
                                    <Icon />
                                </div>

                                <div className="py-4">
                                    <span className="rounded-full bg-[#0D5B5B] px-3 py-1 text-xs font-bold text-white">
                                        {step.id}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                                    {step.title}
                                </h3>
                                <p className="py-3 text-sm leading-7 text-slate-600 sm:text-base">
                                    {step.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="rounded-[2rem] bg-[#F4A61D] px-5 py-5 text-center text-white shadow-lg sm:px-8">
                    <p className="text-lg font-bold sm:text-2xl">
                        48+ <span className="font-medium">Tours and Trip Packages, Globally</span>
                    </p>
                </div>
            </div>
        </section>
    );
}

export default EasyStepsSection;