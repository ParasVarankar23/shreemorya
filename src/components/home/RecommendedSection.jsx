"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaPlane, FaMapMarkedAlt } from "react-icons/fa";

function RecommendedSection() {
    return (
        <section className="bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, x: -25 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="grid gap-4 sm:grid-cols-2"
                >
                    <div className="relative h-[180px] overflow-hidden rounded-[2rem] sm:h-[220px]">
                        <Image
                            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
                            alt="Beach Destination"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="relative h-[180px] overflow-hidden rounded-[2rem] sm:h-[220px]">
                        <Image
                            src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop"
                            alt="Travel Destination"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="relative h-[180px] overflow-hidden rounded-[2rem] sm:h-[220px] sm:col-span-2">
                        <Image
                            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop"
                            alt="Mountain Destination"
                            fill
                            className="object-cover"
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 25 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col gap-4"
                >
                    <p className="text-sm font-semibold text-[#F4A61D] sm:text-base">
                        We Recommend Beautiful Destinations Every Month
                    </p>

                    <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
                        Best Travel Experience With Morya Travels
                    </h2>

                    <p className="text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                        Choose from beautiful routes and premium travel experiences with
                        smooth booking and safe journey support.
                    </p>

                    <div className="grid gap-4 py-4">
                        <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-4">
                            <div className="flex items-center gap-3 text-[#0D5B5B]">
                                <FaPlane />
                                <p className="font-semibold">Fast and Smooth Route Planning</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-4">
                            <div className="flex items-center gap-3 text-[#0D5B5B]">
                                <FaMapMarkedAlt />
                                <p className="font-semibold">Trusted Destination Service</p>
                            </div>
                        </div>
                    </div>

                    <button className="w-fit rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-[#0D5B5B] transition duration-300 hover:bg-lime-300">
                        Reserve Now
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

export default RecommendedSection;