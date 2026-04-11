"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { Playfair_Display, Poppins } from "next/font/google";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
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
            className={`relative overflow-hidden bg-white py-10 md:py-20 ${poppins.className}`}
        >
            {/* Soft premium background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f8fbfa] to-[#fefaf1]" />
            <div className="absolute top-12 right-12 w-40 h-40 bg-[#0E6B68]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-56 h-56 bg-[#f5ad1b]/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-12 md:mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 22 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65 }}
                        viewport={{ once: true }}
                        className="max-w-3xl"
                    >
                        <p className="text-[#f5ad1b] font-semibold tracking-wide text-sm md:text-base">
                            Latest Updates
                        </p>

                        <h2
                            className={`${playfair.className} text-4xl md:text-5xl lg:text-6xl font-bold text-[#111827] mt-3 leading-tight`}
                        >
                            Explore <span className="text-[#0E6B68]">Latest News</span>
                        </h2>

                        <p className="text-gray-600 text-base md:text-lg leading-8 mt-5 max-w-2xl">
                            Stay updated with the latest travel stories, destination guides,
                            route insights, and premium journey experiences from Shree Morya
                            Travels.
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, x: 18 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.65, delay: 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-[#0E6B68] hover:bg-[#0b5956] text-white px-6 py-3.5 rounded-full font-semibold shadow-xl transition w-fit flex items-center gap-2"
                    >
                        See More Articles
                        <FaArrowRight className="text-sm" />
                    </motion.button>
                </div>

                {/* NEWS CARDS */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7 lg:gap-8">
                    {newsData.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65, delay: index * 0.12 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6 }}
                            className="group relative rounded-[28px] overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.08)] min-h-[430px] bg-white border border-[#eef3f2]"
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

                            {/* Premium overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1111]/85 via-[#0b1111]/35 to-transparent" />

                            {/* DATE BADGE */}
                            <div className="absolute top-5 right-5 z-20 bg-white rounded-2xl px-3.5 py-3 shadow-xl min-w-[72px] text-center border border-[#eef3f2]">
                                <p className="text-[#0E6B68] text-2xl font-extrabold leading-none">
                                    {item.day}
                                </p>
                                <p className="text-[#0E6B68] text-[10px] font-semibold uppercase tracking-wide mt-1 leading-none">
                                    {item.month}
                                </p>
                            </div>

                            {/* CONTENT */}
                            <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-7">
                                <p className="text-[#f5ad1b] text-sm font-medium mb-3">
                                    {item.author}
                                </p>

                                <h3
                                    className={`${playfair.className} text-white text-2xl md:text-3xl font-bold leading-8 md:leading-10 pr-4`}
                                >
                                    {item.title}
                                </h3>

                                <motion.button
                                    whileHover={{ x: 4 }}
                                    className="mt-6 inline-flex items-center gap-2 text-white bg-[#0E6B68]/90 hover:bg-[#0E6B68] px-5 py-2.5 rounded-full font-semibold transition"
                                >
                                    Read More
                                    <FaArrowRight className="text-sm" />
                                </motion.button>
                            </div>

                            {/* Border glow */}
                            <div className="absolute inset-0 rounded-[28px] border border-white/10 group-hover:border-white/20 transition pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}