"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { Playfair_Display, Poppins } from "next/font/google";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800"],
});

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const newsData = [
    {
        title: "Top 10 International Destinations to Visit in 2026",
        image:
            "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80",
        author: "By Morya Travels",
        day: "01",
        month: "DECEMBER",
    },
    {
        title: "A Complete Travel Guide to Exploring Europe Comfortably",
        image:
            "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80",
        author: "By Morya Travels",
        day: "01",
        month: "DECEMBER",
    },
    {
        title: "Hidden Paradise: 15 Underrated Places You Must Visit",
        image:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        author: "By Morya Travels",
        day: "01",
        month: "DECEMBER",
    },
];

export default function NewsSection() {
    return (
        <section
            id="news"
            className={`relative py-20 md:py-24 overflow-hidden bg-[#0E6B68] ${poppins.className}`}
        >
            {/* BACKGROUND PATTERN */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:28px_28px]" />
            </div>

            {/* EXTRA DECORATIVE ICON STYLE PATTERN */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
                <div className="absolute top-10 left-10 w-24 h-24 border border-white rounded-full" />
                <div className="absolute top-32 right-20 w-20 h-20 border border-white rounded-full" />
                <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-white rounded-full" />
                <div className="absolute bottom-16 right-1/3 w-28 h-28 border border-white rounded-full" />
            </div>

            {/* GLOW BLOBS */}
            <div className="absolute -top-16 left-0 w-72 h-72 bg-[#f5ad1b]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#7ed321]/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10 md:mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 22 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65 }}
                        viewport={{ once: true }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                            <span className={playfair.className}>Explore</span>{" "}
                            <span className="text-[#f5ad1b]">Latest News</span>
                        </h2>

                        <p className="text-white/75 text-sm md:text-base leading-7 mt-4 max-w-xl">
                            Stay updated with the latest travel stories, destination guides,
                            route insights, and premium journey experiences from Morya
                            Travels.
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, x: 18 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.65, delay: 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-[#8fd400] hover:bg-[#7ec000] text-[#123b3a] px-6 py-3 rounded-full font-bold shadow-[0_12px_30px_rgba(143,212,0,0.25)] transition w-fit flex items-center gap-2"
                    >
                        See More Articles
                        <FaArrowRight className="text-sm" />
                    </motion.button>
                </div>

                {/* NEWS CARDS */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
                    {newsData.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65, delay: index * 0.12 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6 }}
                            className="group relative rounded-[24px] md:rounded-[28px] overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.22)] min-h-[420px] bg-white/5"
                        >
                            {/* IMAGE */}
                            <div className="absolute inset-0">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    unoptimized
                                    className="object-cover group-hover:scale-105 transition duration-700"
                                />
                            </div>

                            {/* DARK OVERLAY */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />

                            {/* DATE BADGE */}
                            <div className="absolute top-4 right-4 z-20 bg-white rounded-[14px] px-3 py-2 shadow-lg min-w-[64px] text-center">
                                <p className="text-[#0E6B68] text-2xl font-extrabold leading-none">
                                    {item.day}
                                </p>
                                <p className="text-[#0E6B68] text-[10px] font-semibold uppercase tracking-wide mt-1 leading-none">
                                    {item.month}
                                </p>
                            </div>

                            {/* CONTENT */}
                            <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6">
                                <p className="text-[#f5ad1b] text-xs sm:text-sm font-medium mb-3">
                                    {item.author}
                                </p>

                                <h3 className="text-white text-xl md:text-2xl font-semibold leading-8 md:leading-9 pr-4">
                                    {item.title}
                                </h3>

                                <motion.button
                                    whileHover={{ x: 4 }}
                                    className="mt-5 inline-flex items-center gap-2 text-[#8fd400] font-semibold"
                                >
                                    Read More
                                    <FaArrowRight className="text-sm" />
                                </motion.button>
                            </div>

                            {/* BORDER GLOW */}
                            <div className="absolute inset-0 rounded-[24px] md:rounded-[28px] border border-white/10 group-hover:border-white/20 transition pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}