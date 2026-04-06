"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FaCheckCircle, FaMapMarkerAlt } from "react-icons/fa";
import { packages } from "./homeData";

export default function PackagesSection() {
    return (
        <section
            id="packages"
            className="relative py-24 bg-[#f7fbfa] overflow-hidden"
        >
            {/* TOP TORN BORDER */}
            <div className="absolute top-0 left-0 w-full z-10 leading-none">
                <svg
                    viewBox="0 0 1440 120"
                    className="w-full h-[70px] md:h-[90px] fill-white drop-shadow-[0_8px_10px_rgba(0,0,0,0.08)]"
                    preserveAspectRatio="none"
                >
                    <path d="M0,70 
                   C60,40 120,95 180,68 
                   C240,42 300,92 360,66
                   C420,38 480,88 540,64
                   C600,38 660,94 720,68
                   C780,42 840,92 900,66
                   C960,40 1020,90 1080,62
                   C1140,36 1200,88 1260,60
                   C1320,34 1380,82 1440,52
                   L1440,0 L0,0 Z" />
                </svg>
            </div>

            {/* BOTTOM TORN BORDER */}
            <div className="absolute bottom-0 left-0 w-full z-10 leading-none rotate-180">
                <svg
                    viewBox="0 0 1440 120"
                    className="w-full h-[70px] md:h-[90px] fill-white drop-shadow-[0_8px_10px_rgba(0,0,0,0.08)]"
                    preserveAspectRatio="none"
                >
                    <path d="M0,70 
                   C60,40 120,95 180,68 
                   C240,42 300,92 360,66
                   C420,38 480,88 540,64
                   C600,38 660,94 720,68
                   C780,42 840,92 900,66
                   C960,40 1020,90 1080,62
                   C1140,36 1200,88 1260,60
                   C1320,34 1380,82 1440,52
                   L1440,0 L0,0 Z" />
                </svg>
            </div>

            {/* DECORATIVE BG BLOBS */}
            <div className="absolute top-20 left-[-80px] w-72 h-72 bg-[#0d5b5a]/8 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-[-80px] w-80 h-80 bg-[#f4b32c]/10 rounded-full blur-3xl" />

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* HEADER */}
                <div className="text-center mb-14">
                    <p className="text-[#f4b32c] font-semibold tracking-wide">
                        Trending Destination Packages
                    </p>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-3 text-[#123b3a]">
                        Best Travel Packages
                    </h3>
                    <p className="text-gray-600 max-w-2xl mx-auto mt-4 text-sm md:text-base leading-7">
                        Explore handpicked premium journeys for families, groups, and solo travelers.
                        Safe travel, best comfort, and unforgettable experiences with Morya Travels.
                    </p>
                </div>

                {/* FILTER TABS LIKE IMAGE */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {["All", "Goa", "Manali", "Kerala", "Kashmir", "Rajasthan", "Pune"].map(
                        (item, index) => (
                            <button
                                key={index}
                                className={`px-5 py-2 rounded-full text-sm font-medium border transition ${index === 0
                                        ? "bg-[#0d5b5a] text-white border-[#0d5b5a]"
                                        : "bg-white text-[#123b3a] border-[#d9e6e4] hover:border-[#0d5b5a] hover:text-[#0d5b5a]"
                                    }`}
                            >
                                {item}
                            </button>
                        )
                    )}
                </div>

                {/* PACKAGE CARDS */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {packages.map((pkg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: index * 0.15 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8 }}
                            className="group bg-white rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-[#e8efee] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-300"
                        >
                            {/* IMAGE */}
                            <div className="relative h-60 overflow-hidden">
                                <Image
                                    src={pkg.image}
                                    alt={pkg.title}
                                    fill
                                    unoptimized
                                    className="object-cover group-hover:scale-105 transition duration-500"
                                />

                                {/* TOP BADGE */}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-[#0d5b5a] text-xs" />
                                    <span className="text-xs font-semibold text-[#123b3a]">
                                        Popular Tour
                                    </span>
                                </div>

                                {/* PRICE FLOATING */}
                                <div className="absolute bottom-4 right-4 bg-[#f4b32c] text-white px-4 py-2 rounded-full font-bold shadow-xl">
                                    {pkg.price}
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="p-6">
                                <h4 className="text-xl md:text-2xl font-bold text-[#123b3a]">
                                    {pkg.title}
                                </h4>

                                <p className="text-gray-500 text-sm mt-2 leading-6">
                                    Comfortable bus travel, best stays, curated sightseeing, and a premium
                                    experience designed for your perfect holiday.
                                </p>

                                <ul className="mt-5 space-y-3">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-gray-600 text-sm">
                                            <FaCheckCircle className="text-[#7ed321] shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className="mt-6 w-full bg-[#0d5b5a] text-white py-3 rounded-full font-semibold hover:bg-[#0a4b4a] transition">
                                    Book Now
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}