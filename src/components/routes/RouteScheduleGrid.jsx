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
        <section className="py-8 md:py-10 bg-[#f8fbfa]">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5">
                {/* HEADING */}
                <div className="text-center mb-6 md:mb-8">
                    <p className="text-[#f5ad1b] font-semibold text-xs sm:text-sm">
                        Daily Timings
                    </p>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0E6B68] mt-1">
                        Route Schedule Details
                    </h2>
                    <p className="text-gray-600 mt-2 max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-6">
                        Check all available regular route timings for forward and return journeys.
                    </p>
                </div>

                {/* GRID */}
                <div className="grid md:grid-cols-2 gap-4 lg:gap-5">
                    {routeCards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[18px] p-3 sm:p-4 shadow-md border border-[#e7efee]"
                        >
                            {/* TOP */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] bg-[#0E6B68] text-white flex items-center justify-center shrink-0">
                                    <FaBusAlt className="text-lg sm:text-xl" />
                                </div>

                                <div>
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#123b3a] leading-tight">
                                        {card.title}
                                    </h3>
                                    <p className="text-gray-500 text-[11px] sm:text-xs md:text-sm leading-tight">
                                        {card.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* ROUTE BOX */}
                            <div className="rounded-[16px] bg-[#f8fbfa] border border-[#e7efee] p-3 sm:p-4">
                                <p className="text-[#0E6B68] font-semibold text-sm sm:text-base">
                                    {card.label}
                                </p>

                                <h4 className="mt-2 text-lg sm:text-xl md:text-2xl font-bold text-[#123b3a] leading-snug break-words">
                                    {card.route}
                                </h4>

                                <p className="mt-3 text-[#f5ad1b] text-lg sm:text-xl md:text-2xl font-extrabold leading-none">
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