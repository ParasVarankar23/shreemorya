"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FaBusAlt, FaRoute, FaArrowRight, FaUsers } from "react-icons/fa";

export default function ExperienceSection() {
    const customerImages = [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    ];

    return (
        <section className="relative py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
            {/* TOP SOFT WAVE */}
            <div className="absolute top-0 left-0 w-full z-0">
                <svg
                    viewBox="0 0 1440 120"
                    className="w-full h-10 sm:h-14 md:h-16 fill-[#f8fbfa]"
                    preserveAspectRatio="none"
                >
                    <path d="M0,32L80,42.7C160,53,320,75,480,80C640,85,800,75,960,58.7C1120,43,1280,21,1360,10.7L1440,0L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
                </svg>
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                <div className="grid lg:grid-cols-[1fr_1.05fr] gap-10 xl:gap-14 items-center">
                    {/* ================= LEFT VISUAL ================= */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative flex justify-center order-2 lg:order-1"
                    >
                        <div className="relative w-full max-w-[620px] h-[320px] sm:h-[400px] md:h-[470px]">
                            {/* TOP SMALL FLOAT IMAGE */}
                            <motion.div
                                initial={{ opacity: 0, y: -10, rotate: -6 }}
                                whileInView={{ opacity: 1, y: 0, rotate: -6 }}
                                transition={{ duration: 0.7, delay: 0.15 }}
                                viewport={{ once: true }}
                                className="absolute top-0 left-1/2 -translate-x-1/2 z-30"
                            >
                                <div className="relative w-[110px] sm:w-[130px] md:w-[150px] h-[75px] sm:h-[90px] md:h-[105px] rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white">
                                    <Image
                                        src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80"
                                        alt="Travel visual"
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                </div>
                            </motion.div>

                            {/* LEFT IMAGE */}
                            <div className="absolute left-0 bottom-8 sm:bottom-10 w-[36%] h-[58%] rounded-[28px] overflow-hidden shadow-2xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
                                    alt="Road trip"
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>

                            {/* CENTER CIRCLE IMAGE */}
                            <div className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 w-[42%] aspect-square rounded-full overflow-hidden border-[10px] border-white shadow-[0_20px_45px_rgba(0,0,0,0.18)] z-20">
                                <Image
                                    src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80"
                                    alt="Traveler"
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>

                            {/* RIGHT IMAGE */}
                            <div className="absolute right-0 bottom-2 sm:bottom-4 w-[36%] h-[64%] rounded-[28px] overflow-hidden shadow-2xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80"
                                    alt="Lake destination"
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>

                            {/* SOFT GLOW */}
                            <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-[46%] aspect-square rounded-full bg-[#0E6B68]/10 blur-3xl -z-10" />
                        </div>
                    </motion.div>

                    {/* ================= RIGHT CONTENT ================= */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative order-1 lg:order-2"
                    >
                        {/* DESKTOP EXPERIENCE BADGE */}
                        <div className="hidden xl:flex absolute right-0 top-10 flex-col items-center">
                            <span
                                className="text-5xl font-extrabold leading-none text-[#f5ad1b]"
                                style={{ WebkitTextStroke: "1px #0E6B68" }}
                            >
                                10+
                            </span>
                            <span className="mt-2 text-[#0E6B68] font-bold text-sm [writing-mode:vertical-rl] rotate-180">
                                Years of Experience
                            </span>
                        </div>

                        <div className="xl:pr-20">
                            <p className="text-[#f5ad1b] font-semibold text-sm sm:text-base mb-3">
                                Trusted Travel Experience
                            </p>

                            <h2 className="text-[#0E6B68] text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold leading-[1.08]">
                                We Recommend{" "}
                                <span className="text-[#f5ad1b]">Beautiful</span>
                                <br />
                                Destinations Every Month
                            </h2>

                            <p className="text-[#5b6d68] mt-5 text-sm sm:text-base md:text-lg leading-7 md:leading-8 max-w-3xl">
                                Morya Tours & Travels brings you safe, comfortable, and reliable
                                journeys with trusted daily routes, smooth booking, and memorable
                                travel experiences for families, groups, and regular passengers.
                            </p>

                            {/* INFO CARDS */}
                            <div className="mt-8 space-y-4">
                                <motion.div
                                    whileHover={{ y: -3 }}
                                    className="bg-white border border-[#e7efee] rounded-[28px] p-4 sm:p-5 shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[#0E6B68]/10 text-[#0E6B68] flex items-center justify-center shrink-0">
                                            <FaBusAlt className="text-2xl" />
                                        </div>
                                        <div>
                                            <h4 className="text-[#0E6B68] font-bold text-lg sm:text-xl">
                                                Trusted Daily Bus Service
                                            </h4>
                                            <p className="text-[#6b7b76] text-sm sm:text-base leading-6 mt-1">
                                                Safe and reliable routes for regular travel with smooth
                                                booking, comfortable seating, and dependable service.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -3 }}
                                    className="bg-white border border-[#e7efee] rounded-[28px] p-4 sm:p-5 shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[#f5ad1b]/10 text-[#f5ad1b] flex items-center justify-center shrink-0">
                                            <FaRoute className="text-2xl" />
                                        </div>
                                        <div>
                                            <h4 className="text-[#0E6B68] font-bold text-lg sm:text-xl">
                                                Route Planning & Comfort
                                            </h4>
                                            <p className="text-[#6b7b76] text-sm sm:text-base leading-6 mt-1">
                                                Smooth travel on routes like Shrivardhan, Borli, Borivali,
                                                Mangaon, and Virar with comfort and timely service.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* BUTTON + CUSTOMER */}
                            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
                                <button className="inline-flex items-center justify-center gap-2 bg-[#7ed321] hover:bg-[#73c51d] text-[#123b3a] px-7 py-3 rounded-full font-semibold shadow-lg transition w-full sm:w-auto">
                                    Discover More
                                    <FaArrowRight />
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-3">
                                        {customerImages.map((img, i) => (
                                            <div
                                                key={i}
                                                className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md"
                                            >
                                                <Image
                                                    src={img}
                                                    alt={`Customer ${i + 1}`}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FaUsers className="text-[#f5ad1b]" />
                                        <div>
                                            <p className="text-[#0E6B68] font-bold text-lg leading-none">2k+</p>
                                            <p className="text-[#6b7b76] text-xs uppercase tracking-wide">
                                                Happy Travelers
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MOBILE / TABLET EXPERIENCE BADGE */}
                            <div className="xl:hidden mt-8">
                                <div className="inline-flex items-center gap-3 bg-[#f8fbfa] border border-[#e7efee] rounded-full px-5 py-3 shadow-md">
                                    <span
                                        className="text-3xl font-extrabold text-[#f5ad1b]"
                                        style={{ WebkitTextStroke: "1px #0E6B68" }}
                                    >
                                        10+
                                    </span>
                                    <span className="text-[#0E6B68] font-semibold text-sm sm:text-base">
                                        Years of Experience
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}