"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import {
    FaArrowRight,
    FaBus,
    FaBusAlt,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaRoute,
    FaPercent,
} from "react-icons/fa";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
});

export default function HeroSection({
    refs,
    handleHeroMouseMove,
    resetHeroTilt,
}) {
    const {
        heroTitleRef,
        heroTextRef,
        heroButtonsRef,
        bookingRef,
        rightVisualRef,
        busCardRef,
        heroTiltRef,
    } = refs;

    return (
        <section
            id="home"
            className="relative overflow-hidden bg-[#0E6B68] pt-[78px] sm:pt-[86px] md:pt-[96px] lg:pt-[104px]"
        >
            {/* BACKGROUND IMAGE */}
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80"
                    alt="Travel background"
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                />
            </div>

            {/* MAIN OVERLAY - SOFTER */}
            <div className="absolute inset-0 bg-[#0E6B68]/68" />

            {/* PREMIUM GRADIENT - RIGHT SIDE MORE VISIBLE */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A4F4D]/88 via-[#0E6B68]/58 to-transparent" />

            {/* SOFT GLOW DECOR */}
            <div className="absolute bottom-20 right-8 sm:right-14 w-40 sm:w-56 h-40 sm:h-56 rounded-full bg-white/8 blur-3xl z-[1]" />

            {/* FLOATING BUS ICON */}
            <motion.div
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={{ opacity: 0.12, y: [0, -6, 0], x: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-24 left-[40%] lg:left-[42%] text-white text-4xl md:text-5xl z-20 hidden md:block"
            >
                <FaBusAlt />
            </motion.div>

            {/* MAIN CONTAINER */}
            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14">
                <div className="grid lg:grid-cols-2 gap-8 xl:gap-14 items-center min-h-[calc(84vh-78px)] sm:min-h-[calc(86vh-86px)] md:min-h-[calc(88vh-96px)] lg:min-h-[calc(90vh-104px)] pb-12 sm:pb-14 md:pb-16 lg:pb-18">

                    {/* LEFT CONTENT */}
                    <div className="relative z-20 max-w-[760px]">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-xl rounded-full px-4 py-2 mb-4 sm:mb-5 shadow-lg">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD77A]" />
                            <p className="text-[#FFE4A3] text-xs sm:text-sm md:text-base font-semibold tracking-wide">
                                Trusted Daily Route Service
                            </p>
                        </div>

                        <div ref={heroTitleRef}>
                            <h2
                                className={`${playfair.className} text-white text-[2.3rem] leading-[0.92] sm:text-5xl md:text-6xl lg:text-[74px] xl:text-[86px] font-black tracking-tight drop-shadow-[0_10px_32px_rgba(0,0,0,0.25)]`}
                            >
                                Morya Travels
                            </h2>
                        </div>

                        <p
                            ref={heroTextRef}
                            className="text-white/95 mt-4 sm:mt-5 max-w-xl xl:max-w-2xl text-sm sm:text-base md:text-lg xl:text-[20px] leading-7 md:leading-8 xl:leading-9"
                        >
                            Regular service provider for comfortable, safe and reliable bus travel.
                            Book your seats easily for daily routes with Morya Travels and enjoy a
                            smooth journey with trusted service and timely travel.
                        </p>

                        {/* BUTTONS */}
                        <div
                            ref={heroButtonsRef}
                            className="mt-6 sm:mt-7 flex flex-wrap gap-3 sm:gap-4"
                        >
                            <button className="bg-[#f5ad1b] text-[#16302B] px-5 sm:px-6 lg:px-7 py-2.5 sm:py-3 rounded-full font-bold hover:bg-[#e39b0a] hover:scale-105 transition shadow-xl text-sm sm:text-base">
                                Book Tickets
                            </button>

                            <button className="border border-white/20 bg-white/10 backdrop-blur-xl text-white px-5 sm:px-6 lg:px-7 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-white/15 transition text-sm sm:text-base">
                                View Routes
                            </button>
                        </div>

                        {/* BOOKING FORM */}
                        <div
                            ref={bookingRef}
                            className="mt-6 sm:mt-7 md:mt-8 bg-white/96 backdrop-blur-2xl rounded-[22px] sm:rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.18)] p-3 sm:p-4 max-w-5xl border border-white/60"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                <div className="bg-[#FFF8E7] rounded-2xl px-4 py-3 min-h-[68px] flex flex-col justify-center">
                                    <label className="text-[11px] text-[#7A6D57] block mb-1">Pickup</label>
                                    <div className="flex items-center gap-2 text-sm font-medium text-[#16302B]">
                                        <FaMapMarkerAlt className="text-[#0E6B68] shrink-0" />
                                        <span>Select Pickup</span>
                                    </div>
                                </div>

                                <div className="bg-[#FFF8E7] rounded-2xl px-4 py-3 min-h-[68px] flex flex-col justify-center">
                                    <label className="text-[11px] text-[#7A6D57] block mb-1">Destination</label>
                                    <div className="flex items-center gap-2 text-sm font-medium text-[#16302B]">
                                        <FaRoute className="text-[#0E6B68] shrink-0" />
                                        <span>Select Destination</span>
                                    </div>
                                </div>

                                <div className="bg-[#FFF8E7] rounded-2xl px-4 py-3 min-h-[68px] flex flex-col justify-center">
                                    <label className="text-[11px] text-[#7A6D57] block mb-1">Travel Date</label>
                                    <div className="flex items-center gap-2 text-sm font-medium text-[#16302B]">
                                        <FaCalendarAlt className="text-[#0E6B68] shrink-0" />
                                        <span>Choose Date</span>
                                    </div>
                                </div>

                                <button className="bg-[#f5ad1b] hover:bg-[#e39b0a] text-[#16302B] rounded-2xl px-4 py-3 font-bold flex items-center justify-center gap-2 transition shadow-md min-h-[68px] text-sm sm:text-base">
                                    Search
                                    <FaArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT VISUAL */}
                    <div
                        ref={rightVisualRef}
                        className="relative flex justify-center lg:justify-end mt-2 lg:mt-0"
                    >
                        <div
                            ref={heroTiltRef}
                            onMouseMove={handleHeroMouseMove}
                            onMouseLeave={resetHeroTilt}
                            className="relative w-full max-w-[340px] sm:max-w-[470px] md:max-w-[540px] xl:max-w-[600px] h-[280px] sm:h-[350px] md:h-[420px] xl:h-[480px] transition-transform duration-300"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* PREMIUM DISCOUNT BADGE - STATIC */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="absolute left-[2%] top-[48%] z-30 hidden md:block"
                                style={{ transform: "translateZ(90px)" }}
                            >
                                <div className="bg-white/95 backdrop-blur-md rounded-[28px] px-4 py-3 shadow-[0_20px_45px_rgba(0,0,0,0.14)] border border-white/70 min-w-[170px]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-[#f5ad1b] text-[#16302B] flex items-center justify-center shrink-0">
                                            <FaPercent className="text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs text-[#7A6D57] leading-none mb-1">
                                                Limited Offer
                                            </p>
                                            <h4 className="text-[#16302B] font-extrabold text-xl sm:text-2xl leading-none">
                                                60% OFF
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* TOP ROUTE CARD - MOVED LEFT */}
                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="absolute top-[5%] left-[1%] bg-white/92 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-[0_20px_45px_rgba(0,0,0,0.14)] w-[210px] sm:w-[240px] md:w-[270px] z-30 border border-white/60"
                                style={{ transform: "translateZ(80px)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0E6B68] text-white flex items-center justify-center shrink-0">
                                        <FaBus className="text-sm sm:text-base" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-[#7A6D57]">Daily Service Route</p>
                                        <h4 className="font-bold text-xs sm:text-sm md:text-base text-[#16302B] leading-snug">
                                            Shrivardhan - Borli - Borivali
                                        </h4>
                                    </div>
                                </div>
                            </motion.div>

                            {/* MAIN HERO PNG - NO WHITE BG */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.4 }}
                                className="absolute right-[1%] bottom-0 w-[72%] h-[100%] z-20"
                                style={{ transform: "translateZ(30px)" }}
                            >
                                <Image
                                    src="/hero.png"
                                    alt="Morya Travels Hero"
                                    fill
                                    priority
                                    className="object-contain object-bottom scale-[1.1] contrast-125 saturate-125 brightness-105 drop-shadow-[0_28px_45px_rgba(0,0,0,0.24)]"
                                />
                            </motion.div>

                            {/* BOTTOM ROUTE CARD */}
                            <div
                                ref={busCardRef}
                                className="absolute bottom-[2%] left-[0%] bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-[0_20px_45px_rgba(0,0,0,0.14)] w-[210px] sm:w-[250px] md:w-[300px] z-30 border border-white/70"
                                style={{ transform: "translateZ(70px)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#f5ad1b] text-[#16302B] flex items-center justify-center shrink-0">
                                        <FaRoute className="text-sm sm:text-base" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-[#7A6D57]">Regular Route</p>
                                        <h4 className="font-bold text-xs sm:text-sm md:text-base text-[#16302B] leading-snug">
                                            Borli - Mangaon - Virar
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            {/* SOFT SHADOW UNDER IMAGE */}
                            <div className="absolute right-[16%] bottom-[6%] w-[42%] h-[14%] bg-black/18 rounded-full blur-2xl z-10" />
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM CURVE */}
            <div className="relative z-20 -mt-1">
                <svg
                    viewBox="0 0 1440 180"
                    className="w-full h-[42px] sm:h-[56px] md:h-[72px] lg:h-[88px] xl:h-[105px] fill-[#F8FBFA]"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,120 
                        C120,100 240,110 360,96 
                        C480,84 600,80 720,86
                        C840,94 960,114 1080,106
                        C1200,98 1320,80 1440,94
                        L1440,180 L0,180 Z"
                    />
                </svg>
            </div>
        </section>
    );
}