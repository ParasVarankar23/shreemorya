"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    FaArrowRight,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaClock,
} from "react-icons/fa";
import { Playfair_Display, Dancing_Script, Poppins } from "next/font/google";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
});

const dancing = Dancing_Script({
    subsets: ["latin"],
    weight: ["700"],
});

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const premiumBlogs = [
    {
        title: "Top Scenic Routes for Your Next Comfortable Journey",
        description:
            "Explore some of the most beautiful and relaxing routes with Morya Travels. Enjoy safe, smooth, and comfortable travel for your daily or family journey.",
        image:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
        category: "Travel Guide",
        date: "12 April 2026",
        location: "Maharashtra Routes",
        readTime: "5 min read",
    },
    {
        title: "Why Daily Travelers Prefer Premium Bus Booking",
        description:
            "Discover why passengers choose secure booking, reliable timings, and comfortable buses for daily travel and regular routes with Morya Travels.",
        image:
            "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1400&q=80",
        category: "Booking Tips",
        date: "10 April 2026",
        location: "Borli - Virar",
        readTime: "4 min read",
    },
    {
        title: "Safe, Comfortable & On-Time: The New Travel Standard",
        description:
            "Modern bus travel is about comfort, safety, and trust. See how premium service and better route planning improve every trip experience.",
        image:
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80",
        category: "Travel Experience",
        date: "08 April 2026",
        location: "Konkan Region",
        readTime: "6 min read",
    },
];

export default function BlogsSection() {
    return (
        <section
            id="blogs"
            className={`relative overflow-hidden bg-white py-10 md:py-20 lg:py-20 ${poppins.className}`}
        >
            {/* Soft premium background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f8fbfa] to-[#fefaf1]" />
            <div className="absolute top-12 left-0 w-72 h-72 bg-[#0E6B68]/6 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-0 w-72 h-72 bg-[#f5ad1b]/10 rounded-full blur-3xl" />

            {/* Light decorative top accent */}
            <div className="absolute top-0 inset-x-0 h-24 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0E6B68]/5 via-[#f5ad1b]/4 to-transparent" />

                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    <div className="w-20 sm:w-28 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#0E6B68]/40 to-[#0E6B68]/10" />
                    <div className="w-3 h-3 rounded-full bg-[#f5ad1b] shadow-[0_0_18px_rgba(245,173,27,0.45)]" />
                    <div className="w-20 sm:w-28 h-[2px] rounded-full bg-gradient-to-l from-transparent via-[#f5ad1b]/40 to-[#f5ad1b]/10" />
                </div>
            </div>

            {/* Light background script text */}
            <div className="pointer-events-none absolute left-1/2 top-[24%] -translate-x-1/2 hidden xl:block z-0">
                <h2
                    className={`${dancing.className} text-[120px] leading-none font-bold tracking-wide bg-gradient-to-b from-[#0E6B68] to-[#f5ad1b] bg-clip-text text-transparent opacity-[0.06] whitespace-nowrap`}
                >
                    Travel Stories
                </h2>
            </div>

            <div className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65 }}
                    viewport={{ once: true }}
                    className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 lg:mb-14"
                >
                    <div>
                        <p className="text-[#f5ad1b] font-semibold tracking-[0.18em] uppercase text-xs sm:text-sm">
                            Explore Latest Blogs
                        </p>

                        <h2 className="mt-3 text-4xl md:text-5xl lg:text-6xl font-bold text-[#111827] leading-tight">
                            <span className={playfair.className}>Travel Stories</span>{" "}
                            <span
                                className={`${dancing.className} text-[#0E6B68] text-4xl md:text-5xl lg:text-6xl xl:text-7xl inline-block`}
                            >
                                & Blogs
                            </span>
                        </h2>

                        <p className="text-gray-600 max-w-2xl mt-5 text-base md:text-lg leading-8">
                            Discover route updates, travel tips, journey stories, and premium
                            travel insights for a better experience with Shree Morya Travels.
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-[#0E6B68] hover:bg-[#0b5956] text-white px-6 py-3.5 rounded-full font-semibold shadow-xl w-fit flex items-center gap-2 transition"
                    >
                        View All
                        <FaArrowRight />
                    </motion.button>
                </motion.div>

                {/* PREMIUM BLOG CARDS */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {premiumBlogs.map((blog, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65, delay: index * 0.12 }}
                            viewport={{ once: true }}
                            className="group rounded-[30px] bg-white border border-[#e8efee] overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_24px_70px_rgba(0,0,0,0.12)] transition-all duration-500"
                        >
                            {/* IMAGE */}
                            <div className="relative h-[280px] sm:h-[320px] overflow-hidden">
                                <Image
                                    src={blog.image}
                                    alt={blog.title}
                                    fill
                                    unoptimized
                                    className="object-cover group-hover:scale-105 transition duration-700"
                                />

                                {/* OVERLAY */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0E6B68]/40 via-transparent to-transparent" />

                                {/* BADGE */}
                                <div className="absolute top-5 left-5">
                                    <span className="bg-white/90 backdrop-blur-md text-[#123b3a] text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                                        {blog.category}
                                    </span>
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="p-6 sm:p-7">
                                {/* META */}
                                <div className="flex flex-wrap items-center gap-4 text-[#6b7b76] text-xs sm:text-sm mb-4">
                                    <span className="flex items-center gap-2">
                                        <FaCalendarAlt className="text-[#f5ad1b]" />
                                        {blog.date}
                                    </span>

                                    <span className="flex items-center gap-2">
                                        <FaClock className="text-[#0E6B68]" />
                                        {blog.readTime}
                                    </span>
                                </div>

                                <h3
                                    className={`${playfair.className} text-[#111827] text-2xl sm:text-3xl font-bold leading-8 sm:leading-10`}
                                >
                                    {blog.title}
                                </h3>

                                <p className="text-gray-600 mt-4 text-sm sm:text-base leading-7">
                                    {blog.description}
                                </p>

                                <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
                                    <span className="flex items-center gap-2 text-[#6b7b76] text-sm">
                                        <FaMapMarkerAlt className="text-[#f5ad1b]" />
                                        {blog.location}
                                    </span>

                                    <motion.button
                                        whileHover={{ x: 4 }}
                                        className="text-[#0E6B68] font-semibold flex items-center gap-2"
                                    >
                                        Read Blog
                                        <FaArrowRight />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* PREMIUM CTA BANNER */}
                <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="mt-12 lg:mt-16"
                >
                    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0E6B68] to-[#0b5956] shadow-[0_18px_50px_rgba(14,107,104,0.22)] px-5 sm:px-7 md:px-8 py-6 sm:py-7">
                        {/* Soft glow */}
                        <div className="absolute -top-8 left-16 w-40 h-20 bg-white/10 blur-2xl rounded-full" />
                        <div className="absolute -top-6 right-20 w-32 h-16 bg-[#f5ad1b]/20 blur-2xl rounded-full" />

                        {/* CONTENT */}
                        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                <div className="flex items-end gap-2">
                                    <span className="text-white text-5xl sm:text-6xl md:text-7xl font-black leading-none drop-shadow-sm">
                                        24
                                    </span>

                                    <div className="py-1">
                                        <p className="text-white/90 text-[11px] sm:text-xs font-semibold leading-none">
                                            % OFF
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-white/90 text-[11px] sm:text-xs md:text-sm font-semibold mb-1">
                                        Get Special Travel Offers
                                    </p>

                                    <h4
                                        className={`${dancing.className} text-[#f5ad1b] text-2xl sm:text-3xl md:text-4xl leading-tight font-bold`}
                                    >
                                        New Routes & Travel Stories, Weekly
                                    </h4>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ duration: 0.25 }}
                                className="bg-white text-[#123b3a] px-5 sm:px-6 py-3 rounded-full font-semibold shadow-[0_8px_20px_rgba(255,255,255,0.18)] hover:shadow-[0_12px_24px_rgba(255,255,255,0.26)] transition flex items-center gap-2"
                            >
                                Discover More
                                <FaArrowRight className="text-sm" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}