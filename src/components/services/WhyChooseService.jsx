"use client";

import { motion } from "framer-motion";
import {
    FaShieldAlt,
    FaClock,
    FaChair,
    FaPhoneAlt,
} from "react-icons/fa";

const features = [
    {
        icon: FaShieldAlt,
        title: "Safe Travel",
        desc: "Reliable and secure daily route service for regular passengers.",
    },
    {
        icon: FaClock,
        title: "On-Time Service",
        desc: "Timely departures for both forward and return journeys.",
    },
    {
        icon: FaChair,
        title: "Comfortable Seats",
        desc: "Enjoy a smooth and comfortable ride with easy booking.",
    },
    {
        icon: FaPhoneAlt,
        title: "Quick Support",
        desc: "For booking and support, contact us anytime at +91 88881 57744.",
    },
];

export default function WhyChooseService() {
    return (
        <section className="py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-[#f5ad1b] font-semibold">Why Choose Us</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0E6B68] mt-2">
                        Why Travel With Morya?
                    </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-[#f8fbfa] rounded-[28px] p-6 border border-[#e7efee] shadow-lg"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#0E6B68] text-white flex items-center justify-center mb-4">
                                    <Icon className="text-xl" />
                                </div>
                                <h3 className="text-xl font-bold text-[#123b3a]">{item.title}</h3>
                                <p className="text-gray-600 text-sm leading-6 mt-3">{item.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}