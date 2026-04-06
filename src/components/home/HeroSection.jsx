"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    FaMapMarkerAlt,
    FaPlaneDeparture,
    FaCalendarAlt,
    FaArrowRight,
    FaBus,
    FaRoute,
} from "react-icons/fa";
import { GiCommercialAirplane } from "react-icons/gi";

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
            className="relative overflow-hidden bg-[#0d5b5a] pt-[84px] sm:pt-[92px] md:pt-[110px] lg:pt-[118px]"
        >
            {/* BACKGROUND IMAGE - UNSPLASH */}
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

            {/* EXTRA BG LAYER */}
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80"
                    alt="Mountain background"
                    fill
                    unoptimized
                    className="object-cover opacity-15 mix-blend-screen"
                />
            </div>

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d5b5a]/92 via-[#0d5b5a]/84 to-[#0d5b5a]/68" />

            {/* DECOR */}
            <div className="absolute top-20 left-4 sm:left-8 w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-[#f4b32c]/10 blur-3xl" />
            <div className="absolute bottom-24 right-4 sm:right-8 w-36 sm:w-52 h-36 sm:h-52 rounded-full bg-white/10 blur-3xl" />

            {/* FLOATING AIRPLANE */}
            <motion.div
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={{ opacity: 0.1, y: [0, -8, 0], x: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute top-24 right-[8%] xl:right-[12%] text-white text-4xl md:text-6xl z-10 hidden md:block"
            >
                <GiCommercialAirplane />
            </motion.div>

            {/* MAIN CONTAINER */}
            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14">
                <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center min-h-[calc(100vh-84px)] sm:min-h-[calc(100vh-92px)] lg:min-h-[calc(100vh-110px)] pb-20 sm:pb-24 md:pb-28 lg:pb-32">
                    {/* LEFT CONTENT */}
                    <div className="relative z-20 max-w-[760px]">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-xl rounded-full px-4 py-2 mb-4 sm:mb-5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#7ed321]" />
                            <p className="text-[#f4b32c] text-xs sm:text-sm md:text-base font-semibold tracking-wide">
                                Trusted Daily Route Service
                            </p>
                        </div>

                        <div ref={heroTitleRef}>
                            <h2 className="text-white text-[2rem] leading-[1] sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold drop-shadow-[0_8px_30px_rgba(0,0,0,0.22)]">
                                Morya Travels
                            </h2>
                        </div>

                        <p
                            ref={heroTextRef}
                            className="text-white/90 mt-4 sm:mt-5 max-w-xl xl:max-w-2xl text-sm sm:text-base md:text-lg xl:text-[20px] leading-7 md:leading-8 xl:leading-9"
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
                            <button className="bg-[#7ed321] text-[#123b3a] px-5 sm:px-6 lg:px-7 py-2.5 sm:py-3 rounded-full font-semibold hover:scale-105 transition shadow-xl text-sm sm:text-base">
                                Book Tickets
                            </button>

                            <button className="border border-white/20 bg-white/10 backdrop-blur-xl text-white px-5 sm:px-6 lg:px-7 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-white/15 transition text-sm sm:text-base">
                                View Routes
                            </button>
                        </div>

                        {/* COMPACT BOOKING FORM */}
                        <div
                            ref={bookingRef}
                            className="mt-6 sm:mt-7 md:mt-8 bg-white/95 backdrop-blur-2xl rounded-[22px] sm:rounded-[26px] shadow-2xl p-3 sm:p-4 max-w-5xl border border-white/50"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                <div className="bg-[#f7faf9] rounded-2xl px-4 py-3 min-h-[62px] flex flex-col justify-center">
                                    <label className="text-[11px] text-gray-500 block mb-1">Pickup</label>
                                    <div className="flex items-center gap-2 text-sm font-medium text-[#123b3a]">
                                        <FaMapMarkerAlt className="text-[#0d5b5a] shrink-0" />
                                        <span>Select Pickup</span>
                                    </div>
                                </div>

                                <div className="bg-[#f7faf9] rounded-2xl px-4 py-3 min-h-[62px] flex flex-col justify-center">
                                    <label className="text-[11px] text-gray-500 block mb-1">Destination</label>
                                    <div className="flex items-center gap-2 text-sm font-medium text-[#123b3a]">
                                        <FaPlaneDeparture className="text-[#0d5b5a] shrink-0" />
                                        <span>Select Destination</span>
                                    </div>
                                </div>

                                <div className="bg-[#f7faf9] rounded-2xl px-4 py-3 min-h-[62px] flex flex-col justify-center">
                                    <label className="text-[11px] text-gray-500 block mb-1">Travel Date</label>
                                    <div className="flex items-center gap-2 text-sm font-medium text-[#123b3a]">
                                        <FaCalendarAlt className="text-[#0d5b5a] shrink-0" />
                                        <span>Choose Date</span>
                                    </div>
                                </div>

                                <button className="bg-[#f4b32c] hover:bg-[#e7a91f] text-[#123b3a] rounded-2xl px-4 py-3 font-semibold flex items-center justify-center gap-2 transition shadow-md min-h-[62px] text-sm sm:text-base">
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
                            className="relative w-full max-w-[360px] sm:max-w-[500px] md:max-w-[620px] xl:max-w-[720px] h-[280px] sm:h-[380px] md:h-[470px] xl:h-[560px] transition-transform duration-300"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* MAIN BUS IMAGE - LOCAL IMAGE */}
                            <motion.div
                                whileHover={{ scale: 1.015 }}
                                transition={{ duration: 0.4 }}
                                className="absolute right-0 top-6 sm:top-8 md:top-10 w-[92%] h-[72%] sm:h-[75%] rounded-[28px] sm:rounded-[34px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.28)] border border-white/20"
                                style={{
                                    clipPath:
                                        "polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 14%)",
                                    transform: "translateZ(0px)",
                                }}
                            >
                                <Image
                                    src="/morya.png"
                                    alt="Morya Travels Bus"
                                    fill
                                    priority
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d5b5a]/20 via-transparent to-transparent" />
                            </motion.div>

                            {/* TOP ROUTE CARD */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: [0, -8, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute top-0 left-0 sm:left-2 md:left-4 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl w-[220px] sm:w-[270px] md:w-[320px] z-30"
                                style={{ transform: "translateZ(120px)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0d5b5a] text-white flex items-center justify-center shrink-0">
                                        <FaBus className="text-sm sm:text-base" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500">Daily Service Route</p>
                                        <h4 className="font-bold text-xs sm:text-sm md:text-base text-[#123b3a] leading-snug">
                                            Shrivardhan - Borli - Borivali
                                        </h4>
                                    </div>
                                </div>
                            </motion.div>

                            {/* BOTTOM ROUTE BADGE */}
                            <div
                                ref={busCardRef}
                                className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-0 sm:left-2 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl w-[200px] sm:w-[240px] md:w-[280px] z-30 border border-white/70"
                                style={{ transform: "translateZ(110px)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#f4b32c] text-white flex items-center justify-center shrink-0">
                                        <FaRoute className="text-sm sm:text-base" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500">Regular Route</p>
                                        <h4 className="font-bold text-xs sm:text-sm md:text-base text-[#123b3a] leading-snug">
                                            Borli - Mangaon - Virar
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            {/* GLOW */}
                            <div className="absolute inset-0 bg-white/10 rounded-[50px] blur-3xl -z-10" />
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM CURVE */}
            <div className="relative z-20 -mt-2">
                <svg
                    viewBox="0 0 1440 220"
                    className="w-full h-[70px] sm:h-[90px] md:h-[120px] lg:h-[150px] xl:h-[180px] fill-[#f8fbfa]"
                    preserveAspectRatio="none"
                >
                    <path d="M0,160 
                   C120,130 240,140 360,120 
                   C480,100 600,90 720,100
                   C840,110 960,140 1080,130
                   C1200,120 1320,90 1440,120
                   L1440,220 L0,220 Z" />
                </svg>
            </div>
        </section>
    );
}