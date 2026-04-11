"use client";

import { motion } from "framer-motion";
import { Playfair_Display } from "next/font/google";
import {
    FaBusAlt,
    FaShieldAlt,
    FaClock,
    FaMapMarkedAlt,
    FaHeadset,
    FaUserCheck,
} from "react-icons/fa";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
});

const features = [
    {
        id: 1,
        icon: FaBusAlt,
        title: "Comfortable Travel",
        desc: "Clean, spacious, and comfortable seating for a smooth daily journey.",
        color: "from-[#0E6B68] to-[#0b5956]",
        badge: "bg-[#ecf8f7] text-[#0E6B68]",
    },
    {
        id: 2,
        icon: FaShieldAlt,
        title: "Safe & Trusted",
        desc: "Reliable service with a trusted reputation for passenger safety and care.",
        color: "from-[#f5ad1b] to-[#d99712]",
        badge: "bg-[#fff3cf] text-[#b77900]",
    },
    {
        id: 3,
        icon: FaClock,
        title: "On-Time Schedule",
        desc: "Regular and punctual departures so you can plan your travel confidently.",
        color: "from-[#0E6B68] to-[#0b5956]",
        badge: "bg-[#ecf8f7] text-[#0E6B68]",
    },
    {
        id: 4,
        icon: FaMapMarkedAlt,
        title: "Reliable Routes",
        desc: "Well-managed daily routes connecting Shrivardhan, Borli, Borivali, and Virar.",
        color: "from-[#f5ad1b] to-[#d99712]",
        badge: "bg-[#fff3cf] text-[#b77900]",
    },
    {
        id: 5,
        icon: FaHeadset,
        title: "Quick Support",
        desc: "Easy contact and helpful booking assistance whenever you need travel help.",
        color: "from-[#0E6B68] to-[#0b5956]",
        badge: "bg-[#ecf8f7] text-[#0E6B68]",
    },
    {
        id: 6,
        icon: FaUserCheck,
        title: "Passenger Friendly",
        desc: "A travel experience designed with convenience, comfort, and satisfaction in mind.",
        color: "from-[#f5ad1b] to-[#d99712]",
        badge: "bg-[#fff3cf] text-[#b77900]",
    },
];

export default function WhyChooseService() {
    return (
        <section className="relative overflow-hidden bg-white py-10 md:py-20">
            {/* Soft premium background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f8fbfa] to-[#fefaf1]" />
            <div className="absolute top-12 right-12 w-40 h-40 bg-[#0E6B68]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-56 h-56 bg-[#f5ad1b]/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-14">
                    <p className="text-[#f5ad1b] font-semibold tracking-wide">
                        Why Choose Us
                    </p>

                    <h2
                        className={`${playfair.className} text-4xl md:text-5xl lg:text-6xl font-bold text-[#111827] mt-3 leading-tight`}
                    >
                        Why Travel With{" "}
                        <span className="text-[#0E6B68]">Shree Morya Travels</span>
                    </h2>

                    <p className="text-gray-600 mt-5 max-w-3xl mx-auto text-base md:text-lg leading-8">
                        We provide a trusted and comfortable daily travel experience with
                        punctual service, reliable routes, and passenger-first support for
                        every journey.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
                    {features.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 35 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: index * 0.08 }}
                                viewport={{ once: true }}
                                className="group relative bg-white/90 backdrop-blur-xl rounded-[30px] p-6 md:p-7 shadow-[0_18px_70px_rgba(0,0,0,0.06)] border border-white/80 hover:shadow-[0_24px_90px_rgba(0,0,0,0.10)] transition-all duration-300"
                            >
                                {/* Glow */}
                                <div className="absolute -top-5 -right-5 w-24 h-24 bg-[#f5ad1b]/10 rounded-full blur-2xl" />

                                {/* Icon */}
                                <div
                                    className={`relative w-16 h-16 rounded-3xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg mb-5`}
                                >
                                    <Icon className="text-2xl" />
                                </div>

                                {/* Small badge */}
                                <span
                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${item.badge}`}
                                >
                                    Premium Service
                                </span>

                                {/* Title */}
                                <h3
                                    className={`${playfair.className} text-2xl font-bold text-[#111827] leading-snug`}
                                >
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 mt-3 leading-7 text-sm md:text-base">
                                    {item.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}