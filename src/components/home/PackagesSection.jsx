"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Playfair_Display, Dancing_Script } from "next/font/google";
import { FaCheckCircle, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
});

const dancing = Dancing_Script({
    subsets: ["latin"],
    weight: ["700"],
});

const packages = [
    {
        title: "Goa Beach Escape",
        image: "/goa.png",
        oldPrice: "₹8,999",
        price: "₹6,499",
        badge: "Popular Tour",
        features: [
            "AC Sleeper / Seater Bus",
            "2 Nights Hotel Stay",
            "Beachside Sightseeing",
            "Family & Group Friendly",
        ],
    },
    {
        title: "Manali Mountain Trip",
        image: "/manali.png",
        oldPrice: "₹11,999",
        price: "₹8,499",
        badge: "Top Rated",
        features: [
            "Luxury Pushback Bus",
            "3 Nights Hotel Stay",
            "Snow Point Visit",
            "Best for Couples & Friends",
        ],
    },
    {
        title: "Kerala Nature Tour",
        image: "/kerala.png",
        oldPrice: "₹10,499",
        price: "₹7,999",
        badge: "Best Seller",
        features: [
            "Comfortable AC Travel",
            "Premium Stay Included",
            "Backwater & Nature Views",
            "Relaxing Family Package",
        ],
    },
    {
        title: "Kashmir Paradise Package",
        image: "/kashmir.png",
        oldPrice: "₹15,999",
        price: "₹11,499",
        badge: "Luxury Tour",
        features: [
            "Premium Long Route Travel",
            "4 Nights Stay Included",
            "Scenic Valley Sightseeing",
            "Safe & Memorable Experience",
        ],
    },
    {
        title: "Rajasthan Heritage Journey",
        image: "/rajasthan.png",
        oldPrice: "₹12,499",
        price: "₹8,999",
        badge: "Cultural Tour",
        features: [
            "Comfortable Bus Travel",
            "Hotel & City Exploration",
            "Fort & Palace Sightseeing",
            "Perfect for Family Tours",
        ],
    },
    {
        title: "Pune Weekend Special",
        image: "/pune.png",
        oldPrice: "₹3,999",
        price: "₹2,499",
        badge: "Budget Tour",
        features: [
            "Quick & Easy Weekend Route",
            "Comfortable Seat Booking",
            "Affordable Family Package",
            "Best for Short Trips",
        ],
    },
];

export default function PackagesSection() {
    return (
        <section
            id="packages"
            className="relative py-20 md:py-20 lg:py-28 bg-[#f7fbfa] overflow-hidden"
        >
            {/* TOP PREMIUM LINE */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0E6B68] via-[#157A74] to-[#f5ad1b]" />

            {/* TOP TORN BORDER */}
            <div className="absolute top-0 left-0 w-full z-10 leading-none">
                <svg
                    viewBox="0 0 1440 120"
                    className="w-full h-[60px] md:h-[80px] fill-white drop-shadow-[0_8px_10px_rgba(0,0,0,0.08)]"
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
                    className="w-full h-[60px] md:h-[80px] fill-white drop-shadow-[0_8px_10px_rgba(0,0,0,0.08)]"
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
            <div className="absolute top-20 left-[-80px] w-72 h-72 bg-[#0E6B68]/8 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-[-80px] w-80 h-80 bg-[#f5ad1b]/10 rounded-full blur-3xl" />

            <div className="relative z-20 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <p className="text-[#f5ad1b] font-semibold tracking-[0.18em] uppercase text-xs sm:text-sm">
                        Trending Destination Packages
                    </p>

                    <h3 className="mt-3 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#123b3a] leading-tight">
                        <span className={playfair.className}>Best Travel</span>{" "}
                        <span
                            className={`${dancing.className} text-[#f5ad1b] text-4xl md:text-5xl lg:text-6xl xl:text-7xl inline-block`}
                        >
                            Packages
                        </span>
                    </h3>

                    <p className="text-[#5f6f6a] max-w-2xl mx-auto mt-4 text-sm md:text-base leading-7">
                        Explore handpicked premium journeys for families, groups, and solo travelers.
                        Safe travel, best comfort, and unforgettable experiences with Morya Travels.
                    </p>
                </motion.div>

                {/* FILTER TABS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {["All", "Goa", "Manali", "Kerala", "Kashmir", "Rajasthan", "Pune"].map(
                        (item, index) => (
                            <button
                                key={index}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-300 ${index === 0
                                    ? "bg-[#0E6B68] text-white border-[#0E6B68] shadow-md"
                                    : "bg-white text-[#123b3a] border-[#d9e6e4] hover:border-[#0E6B68] hover:text-[#0E6B68] hover:shadow-sm"
                                    }`}
                            >
                                {item}
                            </button>
                        )
                    )}
                </motion.div>

                {/* PACKAGE CARDS - 6 TOTAL */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-7 xl:gap-8">
                    {packages.map((pkg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65, delay: index * 0.08 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8 }}
                            className="group bg-white rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-[#e8efee] hover:shadow-[0_20px_55px_rgba(0,0,0,0.12)] transition-all duration-300"
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

                                {/* DARK OVERLAY */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

                                {/* TOP BADGE */}
                                <div className="absolute top-4 left-4 bg-white/92 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-[#0E6B68] text-xs" />
                                    <span className="text-xs font-semibold text-[#123b3a]">
                                        {pkg.badge}
                                    </span>
                                </div>

                                {/* AMAZON STYLE PRICE FLOATING */}
                                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-xl border border-white/70">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] text-gray-400 line-through font-medium">
                                            {pkg.oldPrice}
                                        </span>
                                        <span className="text-[#f5ad1b] text-lg font-extrabold leading-none">
                                            {pkg.price}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="p-6">
                                <h4 className={`${playfair.className} text-xl md:text-2xl font-bold text-[#123b3a]`}>
                                    {pkg.title}
                                </h4>

                                <p className="text-[#5f6f6a] text-sm mt-2 leading-6">
                                    Comfortable bus travel, best stays, curated sightseeing, and a premium
                                    experience designed for your perfect holiday.
                                </p>

                                <ul className="mt-5 space-y-3">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-[#5f6f6a] text-sm">
                                            <FaCheckCircle className="text-[#7BBF38] shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className="mt-6 w-full bg-[#0E6B68] text-white py-3 rounded-full font-semibold hover:bg-[#0b5552] transition shadow-md hover:shadow-lg">
                                    Book Now
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* PREMIUM OFFER BANNER */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="mt-12 lg:mt-16"
                >
                    <motion.div
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                        className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-[#f5ad1b] shadow-[0_18px_50px_rgba(245,173,27,0.28)] px-5 sm:px-7 md:px-8 py-5 sm:py-6"
                    >
                        {/* TOP SOFT GLOW */}
                        <div className="absolute -top-8 left-16 w-40 h-20 bg-white/10 blur-2xl rounded-full" />
                        <div className="absolute -top-6 right-20 w-32 h-16 bg-white/10 blur-2xl rounded-full" />

                        {/* BOTTOM CLOUD DECOR */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 pointer-events-none opacity-25">
                            <div className="absolute left-0 bottom-0 w-16 h-8 bg-white rounded-full" />
                            <div className="absolute left-8 bottom-0 w-12 h-6 bg-white rounded-full" />
                            <div className="absolute left-20 bottom-0 w-20 h-9 bg-white rounded-full" />
                            <div className="absolute left-36 bottom-0 w-14 h-7 bg-white rounded-full" />
                            <div className="absolute left-56 bottom-0 w-16 h-8 bg-white rounded-full" />
                            <div className="absolute left-72 bottom-0 w-12 h-6 bg-white rounded-full" />
                            <div className="absolute left-96 bottom-0 w-20 h-9 bg-white rounded-full" />
                            <div className="absolute left-[48%] bottom-0 w-14 h-7 bg-white rounded-full" />
                            <div className="absolute left-[56%] bottom-0 w-16 h-8 bg-white rounded-full" />
                            <div className="absolute left-[64%] bottom-0 w-12 h-6 bg-white rounded-full" />
                            <div className="absolute right-40 bottom-0 w-16 h-8 bg-white rounded-full" />
                            <div className="absolute right-24 bottom-0 w-12 h-6 bg-white rounded-full" />
                            <div className="absolute right-0 bottom-0 w-20 h-9 bg-white rounded-full" />
                        </div>

                        {/* CONTENT */}
                        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                            {/* LEFT SIDE */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                {/* 48 OFFER */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.15 }}
                                    viewport={{ once: true }}
                                    className="flex items-end gap-2"
                                >
                                    <span className="text-white text-5xl sm:text-6xl md:text-7xl font-black leading-none drop-shadow-sm">
                                        48
                                    </span>

                                    <div className="pb-1 sm:pb-2">
                                        <p className="text-white/90 text-[11px] sm:text-xs font-semibold leading-none">
                                            % OFF
                                        </p>
                                    </div>
                                </motion.div>

                                {/* TEXT */}
                                <motion.div
                                    initial={{ opacity: 0, x: 18 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    viewport={{ once: true }}
                                >
                                    <p className="text-white/90 text-[11px] sm:text-xs md:text-sm font-semibold mb-1">
                                        Get Special Offer
                                    </p>

                                    <h4
                                        className={`${dancing.className} text-[#0E6B68] text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight font-bold`}
                                    >
                                        Tours and Trip Packages, Globally
                                    </h4>
                                </motion.div>
                            </div>

                            {/* BUTTON */}
                            <motion.button
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ duration: 0.25 }}
                                className="bg-white text-[#123b3a] px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold shadow-[0_8px_20px_rgba(255,255,255,0.28)] hover:shadow-[0_12px_24px_rgba(255,255,255,0.36)] transition flex items-center gap-2"
                            >
                                Discover More
                                <FaArrowRight className="text-sm" />
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}