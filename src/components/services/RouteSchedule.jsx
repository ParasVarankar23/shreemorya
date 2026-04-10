"use client";

import { motion } from "framer-motion";
import { Playfair_Display } from "next/font/google";
import { FaBus, FaClock, FaArrowRight, FaArrowLeft } from "react-icons/fa";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
});

const routes = [
    {
        id: 1,
        title: "Forward Journey",
        icon: FaArrowRight,
        route: "Shrivardhan → Borli → Borivali → Virar",
        time: "8:30 PM",
        color: "from-[#0E6B68] to-[#0b5956]",
        badgeBg: "bg-[#ecf8f7]",
        badgeText: "text-[#0E6B68]",
    },
    {
        id: 2,
        title: "Return Journey",
        icon: FaArrowLeft,
        route: "Virar → Borivali → Borli → Shrivardhan",
        time: "9:00 PM",
        color: "from-[#f5ad1b] to-[#d99712]",
        badgeBg: "bg-[#fff3cf]",
        badgeText: "text-[#b77900]",
    },
];

export default function RouteSchedule() {
    return (
        <section className="relative overflow-hidden bg-white py-20 md:py-24">
            {/* Soft premium background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f8fbfa] to-[#fefaf1]" />
            <div className="absolute top-16 right-12 w-40 h-40 bg-[#0E6B68]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-52 h-52 bg-[#f5ad1b]/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-14">
                    <p className="text-[#f5ad1b] font-semibold tracking-wide">
                        Service Timings
                    </p>

                    <h2
                        className={`${playfair.className} text-4xl md:text-5xl lg:text-6xl font-bold text-[#111827] mt-3 leading-tight`}
                    >
                        Daily <span className="text-[#0E6B68]">Route Schedule</span>
                    </h2>

                    <p className="text-gray-600 mt-5 max-w-3xl mx-auto text-base md:text-lg leading-8">
                        Our regular service is designed for comfort, safety, and timely
                        travel between Shrivardhan, Borli, Borivali, and Virar with trusted
                        daily schedules for passengers.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-2 gap-7 lg:gap-8">
                    {routes.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 35 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: index * 0.12 }}
                                viewport={{ once: true }}
                                className="group relative bg-white/90 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.07)] border border-white/80 hover:shadow-[0_24px_90px_rgba(0,0,0,0.10)] transition-all duration-300"
                            >
                                {/* Glow */}
                                <div className="absolute -top-5 -right-5 w-24 h-24 bg-[#f5ad1b]/10 rounded-full blur-2xl" />

                                {/* Header */}
                                <div className="relative flex items-center gap-4 mb-6">
                                    <div
                                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg`}
                                    >
                                        <Icon className="text-xl" />
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">{item.title}</p>
                                        <h3
                                            className={`${playfair.className} text-2xl md:text-3xl font-bold text-[#111827]`}
                                        >
                                            Route {item.id}
                                        </h3>
                                    </div>
                                </div>

                                {/* Route box */}
                                <div className="relative rounded-3xl bg-gradient-to-r from-[#f8fbfa] to-white border border-[#edf2f1] p-5 shadow-sm">
                                    <div className="flex items-center gap-3 text-[#0E6B68] mb-3">
                                        <FaBus className="text-base" />
                                        <span className="font-semibold">Route</span>
                                    </div>

                                    <p className="text-lg md:text-xl font-bold text-[#123b3a] leading-8">
                                        {item.route}
                                    </p>
                                </div>

                                {/* Time box */}
                                <div className="mt-5 rounded-3xl bg-white border border-[#eef3f2] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
                                    <div className="flex items-center gap-3 text-[#111827]">
                                        <div
                                            className={`w-11 h-11 rounded-2xl ${item.badgeBg} ${item.badgeText} flex items-center justify-center`}
                                        >
                                            <FaClock />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Departure Time</p>
                                            <p className="font-semibold text-[#123b3a]">
                                                Regular Service
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-base md:text-lg font-bold ${item.badgeBg} ${item.badgeText}`}
                                    >
                                        {item.time}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}