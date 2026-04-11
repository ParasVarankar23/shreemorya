"use client";

import { motion } from "framer-motion";
import { Playfair_Display } from "next/font/google";
import { FaBusAlt, FaClock } from "react-icons/fa";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
});

const routeCards = [
    {
        id: 1,
        title: "Daily Schedule",
        subtitle: "Regular service timing",
        label: "Departure Route",
        route: "Shrivardhan → Borli → Borivali → Virar",
        time: "8:30 PM",
        iconColor: "from-[#0E6B68] to-[#0b5956]",
        badgeBg: "bg-[#ecf8f7]",
        badgeText: "text-[#0E6B68]",
        labelColor: "text-[#0E6B68]",
        boxBg: "from-[#f8fbfa] to-white",
        boxBorder: "border-[#e7efee]",
    },
    {
        id: 2,
        title: "Daily Schedule",
        subtitle: "Regular service timing",
        label: "Return Route",
        route: "Virar → Borivali → Borli → Shrivardhan",
        time: "9:00 PM",
        iconColor: "from-[#f5ad1b] to-[#d99712]",
        badgeBg: "bg-[#fff3cf]",
        badgeText: "text-[#b77900]",
        labelColor: "text-[#E8A317]",
        boxBg: "from-[#fff9eb] to-white",
        boxBorder: "border-[#fde7b0]",
    },
    {
        id: 3,
        title: "Daily Schedule",
        subtitle: "Regular service timing",
        label: "Departure Route",
        route: "Shrivardhan → Borli → Borivali → Virar",
        time: "1:30 PM",
        iconColor: "from-[#0E6B68] to-[#0b5956]",
        badgeBg: "bg-[#ecf8f7]",
        badgeText: "text-[#0E6B68]",
        labelColor: "text-[#0E6B68]",
        boxBg: "from-[#f8fbfa] to-white",
        boxBorder: "border-[#e7efee]",
    },
    {
        id: 4,
        title: "Daily Schedule",
        subtitle: "Regular service timing",
        label: "Return Route",
        route: "Virar → Borivali → Borli → Shrivardhan",
        time: "2:00 PM",
        iconColor: "from-[#f5ad1b] to-[#d99712]",
        badgeBg: "bg-[#fff3cf]",
        badgeText: "text-[#b77900]",
        labelColor: "text-[#E8A317]",
        boxBg: "from-[#fff9eb] to-white",
        boxBorder: "border-[#fde7b0]",
    },
];

export default function RouteScheduleGrid() {
    return (
        <section className="relative overflow-hidden bg-white py-10 md:py-20">
            {/* Soft premium background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f8fbfa] to-[#fefaf1]" />
            <div className="absolute top-12 right-12 w-40 h-40 bg-[#0E6B68]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-56 h-56 bg-[#f5ad1b]/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* HEADING */}
                <div className="text-center mb-14">
                    <p className="text-[#f5ad1b] font-semibold tracking-wide text-sm md:text-base">
                        Daily Timings
                    </p>

                    <h2
                        className={`${playfair.className} text-4xl md:text-5xl lg:text-6xl font-bold text-[#111827] mt-3 leading-tight`}
                    >
                        Route <span className="text-[#0E6B68]">Schedule Details</span>
                    </h2>

                    <p className="text-gray-600 mt-5 max-w-3xl mx-auto text-base md:text-lg leading-8">
                        Check all available regular route timings for forward and return
                        journeys with safe, comfortable, and trusted daily travel service.
                    </p>
                </div>

                {/* GRID */}
                <div className="grid md:grid-cols-2 gap-7 lg:gap-8">
                    {routeCards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: index * 0.08 }}
                            viewport={{ once: true }}
                            className="group relative bg-white/90 backdrop-blur-xl rounded-[30px] p-6 md:p-7 shadow-[0_18px_70px_rgba(0,0,0,0.06)] border border-white/80 hover:shadow-[0_24px_90px_rgba(0,0,0,0.10)] transition-all duration-300"
                        >
                            {/* Glow */}
                            <div className="absolute -top-5 -right-5 w-24 h-24 bg-[#f5ad1b]/10 rounded-full blur-2xl" />

                            {/* TOP */}
                            <div className="relative flex items-center gap-4 mb-5">
                                <div
                                    className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${card.iconColor} text-white flex items-center justify-center shrink-0 shadow-lg`}
                                >
                                    <FaBusAlt className="text-xl" />
                                </div>

                                <div>
                                    <h3
                                        className={`${playfair.className} text-2xl md:text-3xl font-bold text-[#111827] leading-tight`}
                                    >
                                        {card.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm md:text-base leading-tight mt-1">
                                        {card.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* ROUTE BOX */}
                            <div
                                className={`rounded-3xl bg-gradient-to-r ${card.boxBg} border ${card.boxBorder} p-5 shadow-sm`}
                            >
                                <p className={`${card.labelColor} font-semibold text-sm md:text-base`}>
                                    {card.label}
                                </p>

                                <h4 className="mt-3 text-lg sm:text-xl md:text-2xl font-bold text-[#123b3a] leading-snug break-words">
                                    {card.route}
                                </h4>

                                {/* Time Badge */}
                                <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-3 text-[#111827]">
                                        <div
                                            className={`w-11 h-11 rounded-2xl ${card.badgeBg} ${card.badgeText} flex items-center justify-center`}
                                        >
                                            <FaClock />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Departure Time</p>
                                            <p className="font-semibold text-[#123b3a]">Regular Service</p>
                                        </div>
                                    </div>

                                    <span
                                        className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-base md:text-lg font-bold ${card.badgeBg} ${card.badgeText}`}
                                    >
                                        {card.time}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}