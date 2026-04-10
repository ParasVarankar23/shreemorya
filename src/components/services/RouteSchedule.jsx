"use client";

import { motion } from "framer-motion";
import { FaBus, FaClock, FaArrowRight, FaArrowLeft } from "react-icons/fa";

const routes = [
    {
        id: 1,
        title: "Forward Journey",
        icon: FaArrowRight,
        route: "Shrivardhan → Borli → Borivali → Virar",
        time: "8:30 PM",
        color: "bg-[#0E6B68]",
    },
    {
        id: 2,
        title: "Return Journey",
        icon: FaArrowLeft,
        route: "Virar → Borivali → Borli → Shrivardhan",
        time: "9:00 PM",
        color: "bg-[#f5ad1b]",
    },
];

export default function RouteSchedule() {
    return (
        <section className="py-16 md:py-20 bg-[#f8fbfa]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-[#f5ad1b] font-semibold">Service Timings</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0E6B68] mt-2">
                        Daily Route Schedule
                    </h2>
                    <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
                        Our regular service is designed for comfort, safety, and timely
                        travel between Shrivardhan, Borli, Borivali, and Virar.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {routes.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-[28px] p-6 md:p-7 shadow-xl border border-[#e7efee]"
                            >
                                <div className="flex items-center gap-4 mb-5">
                                    <div
                                        className={`w-14 h-14 rounded-2xl ${item.color} text-white flex items-center justify-center`}
                                    >
                                        <Icon className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">{item.title}</p>
                                        <h3 className="text-2xl font-bold text-[#123b3a]">
                                            Route {item.id}
                                        </h3>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-[#f8fbfa] border border-[#edf2f1] p-4">
                                    <div className="flex items-center gap-3 text-[#0E6B68] mb-3">
                                        <FaBus />
                                        <span className="font-semibold">Route</span>
                                    </div>
                                    <p className="text-lg font-bold text-[#123b3a] leading-8">
                                        {item.route}
                                    </p>
                                </div>

                                <div className="mt-4 rounded-2xl bg-[#fff9eb] border border-[#fde7b0] p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-[#f5ad1b]">
                                        <FaClock />
                                        <span className="font-semibold">Departure Time</span>
                                    </div>
                                    <span className="text-xl font-bold text-[#123b3a]">
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