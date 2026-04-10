"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaQuoteRight,
    FaStar,
    FaArrowLeft,
    FaArrowRight,
} from "react-icons/fa";
import { Playfair_Display, Dancing_Script } from "next/font/google";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
});

const dancing = Dancing_Script({
    subsets: ["latin"],
    weight: ["700"],
});

const testimonials = [
    {
        name: "Kevin Martin",
        role: "Daily Traveler",
        image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        message:
            "Morya Travels gives a smooth and comfortable travel experience. The booking process is very easy, the routes are reliable, and the service is always on time.",
    },
    {
        name: "Sophia Wilson",
        role: "Regular Passenger",
        image:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
        message:
            "Very professional service and safe journey every time. Seat booking is simple, staff is helpful, and the bus quality feels premium and comfortable.",
    },
    {
        name: "Aarav Mehta",
        role: "Verified Customer",
        image:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
        message:
            "I really liked the clean buses, proper timing, and easy route selection. Morya Travels is one of the best choices for regular and family travel.",
    },
];

export default function TestimonialSection() {
    const [activeIndex, setActiveIndex] = useState(0);

    const active = testimonials[activeIndex];

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };

    return (
        <section
            id="testimonial"
            className="relative py-20 md:py-24 lg:py-28 bg-[#f8fbfa] overflow-hidden"
        >
            {/* DECOR BLOBS */}
            <div className="absolute top-16 left-0 w-72 h-72 bg-[#0E6B68]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-0 w-72 h-72 bg-[#f5ad1b]/10 rounded-full blur-3xl" />

            {/* BIG BACKGROUND TEXT */}
            <div className="pointer-events-none absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 hidden lg:block z-0">
                <h2
                    className={`${dancing.className} text-[130px] xl:text-[170px] leading-none font-bold tracking-wide bg-gradient-to-b from-[#0E6B68] to-[#f5ad1b] bg-clip-text text-transparent opacity-[0.18] whitespace-nowrap`}
                >
                    TESTIMONIAL
                </h2>
            </div>

            <div className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 lg:mb-16"
                >
                    <p className="text-[#f5ad1b] font-semibold tracking-[0.18em] uppercase text-xs sm:text-sm">
                        Our Client Says
                    </p>

                    <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#123b3a] leading-tight">
                        <span className={playfair.className}>Trusted</span>{" "}
                        <span
                            className={`${dancing.className} text-[#0E6B68] text-4xl md:text-5xl lg:text-6xl xl:text-7xl inline-block`}
                        >
                            Testimonials
                        </span>
                    </h2>

                    <p className="text-[#5f6f6a] max-w-2xl mx-auto mt-4 text-sm md:text-base leading-7">
                        Real reviews from passengers who trust Morya Travels for safe,
                        comfortable, and reliable daily journeys.
                    </p>
                </motion.div>

                {/* MAIN CONTENT */}
                <div className="grid lg:grid-cols-[1.05fr_1.2fr] gap-10 xl:gap-16 items-center">
                    {/* LEFT IMAGE SIDE */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="relative flex items-center gap-4 md:gap-6"
                    >
                        {/* MAIN IMAGE */}
                        <div className="relative">
                            <div className="absolute inset-0 translate-x-4 translate-y-4 bg-[#f5ad1b]/18 rounded-[28px] blur-sm" />

                            <div className="relative w-[240px] h-[320px] sm:w-[280px] sm:h-[360px] md:w-[320px] md:h-[400px] rounded-[26px] md:rounded-[30px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.14)] border border-white">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={active.image}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.45 }}
                                        className="absolute inset-0"
                                    >
                                        <Image
                                            src={active.image}
                                            alt={active.name}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* SIDE THUMBNAILS */}
                        <div className="flex flex-col gap-4 sm:gap-5">
                            {testimonials.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-lg ${activeIndex === index
                                            ? "border-[#f5ad1b] scale-105 ring-4 ring-[#f5ad1b]/20"
                                            : "border-white/80 hover:scale-105"
                                        }`}
                                    aria-label={`Show testimonial of ${item.name}`}
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* RIGHT CONTENT SIDE */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -18 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* TOP NAME */}
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3
                                            className={`${dancing.className} text-[#0E6B68] text-3xl sm:text-4xl md:text-5xl leading-none`}
                                        >
                                            {active.name}
                                        </h3>
                                        <p className="text-[#f5ad1b] font-semibold text-sm sm:text-base mt-2">
                                            {active.role}
                                        </p>
                                    </div>

                                    <FaQuoteRight className="text-[#123b3a]/20 text-4xl sm:text-5xl md:text-6xl shrink-0" />
                                </div>

                                {/* MESSAGE */}
                                <p className="mt-8 text-[#4f625d] text-base sm:text-lg md:text-xl leading-8 md:leading-9 max-w-2xl">
                                    {active.message}
                                </p>

                                {/* STARS */}
                                <div className="flex items-center gap-1 text-[#f5ad1b] text-lg mt-8">
                                    <FaStar />
                                    <FaStar />
                                    <FaStar />
                                    <FaStar />
                                    <FaStar />
                                </div>

                                {/* ARROWS */}
                                <div className="flex items-center gap-3 mt-8">
                                    <button
                                        onClick={handlePrev}
                                        className="w-12 h-12 rounded-full bg-[#f5ad1b] text-white flex items-center justify-center shadow-[0_10px_25px_rgba(245,173,27,0.28)] hover:scale-105 transition"
                                        aria-label="Previous testimonial"
                                    >
                                        <FaArrowLeft />
                                    </button>

                                    <button
                                        onClick={handleNext}
                                        className="w-12 h-12 rounded-full bg-[#f5ad1b] text-white flex items-center justify-center shadow-[0_10px_25px_rgba(245,173,27,0.28)] hover:scale-105 transition"
                                        aria-label="Next testimonial"
                                    >
                                        <FaArrowRight />
                                    </button>
                                </div>

                                {/* DOTS */}
                                <div className="flex items-center gap-2 mt-8">
                                    {testimonials.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveIndex(index)}
                                            className={`rounded-full transition-all duration-300 ${activeIndex === index
                                                    ? "w-8 h-3 bg-[#0E6B68]"
                                                    : "w-3 h-3 bg-[#d8e8e5]"
                                                }`}
                                            aria-label={`Go to testimonial ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}