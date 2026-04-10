"use client";

import { motion } from "framer-motion";
import { FaBusAlt } from "react-icons/fa";

const routeCards = [
    {
        id: 1,
        title: "Daily Schedule",
        subtitle: "Regular service timing",
        label: "Departure Route",
        route: "Shrivardhan → Borli → Borivali → Virar",
        time: "8:30 PM",
    },
    {
        id: 2,
        title: "Daily Schedule",
        subtitle: "Regular service timing",
        label: "Return Route",
        route: "Virar → Borivali → Borli → Shrivardhan",
        time: "9:00 PM",
    },
    {
        id: 3,
        title: "Daily Schedule",
        subtitle: "Regular service timing",
        label: "Departure Route",
        route: "Shrivardhan → Borli → Borivali → Virar",
        time: "1:30 PM",
    },
    {
        id: 4,
        title: "Daily Schedule",
        subtitle: "Regular service timing",
        label: "Return Route",
        route: "Virar → Borivali → Borli → Shrivardhan",
        time: "2:00 PM",
    },
];

export default function RouteScheduleGrid() {
    return (
        <section className="py-16 md:py-20 bg-[#f8fbfa]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-[#f5ad1b] font-semibold">Daily Timings</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0E6B68] mt-2">
                        Route Schedule Details
                    </h2>
                    <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
                        Check all available regular route timings for forward and return
                        journeys. Choose the best suitable time for your comfortable travel.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {routeCards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: index * 0.08 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[30px] p-5 sm:p-6 md:p-8 shadow-xl border border-[#e7efee]"
                        >
                            {/* TOP */}
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-16 h-16 rounded-[22px] bg-[#0E6B68] text-white flex items-center justify-center shrink-0">
                                    <FaBusAlt className="text-3xl" />
                                </div>

                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-[#123b3a] leading-tight">
                                        {card.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm md:text-base">{card.subtitle}</p>
                                </div>
                            </div>

                            {/* ROUTE BOX */}
                            <div className="rounded-[24px] bg-[#f8fbfa] border border-[#e7efee] p-5 sm:p-6">
                                <p className="text-[#0E6B68] font-semibold text-lg md:text-xl">
                                    {card.label}
                                </p>

                                <h4 className="mt-4 text-2xl md:text-3xl font-bold text-[#123b3a] leading-snug">
                                    {card.route}
                                </h4>

                                <p className="mt-5 text-[#f5ad1b] text-3xl md:text-4xl font-extrabold">
                                    {card.time}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}