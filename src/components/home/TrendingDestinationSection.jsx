"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaUsers, FaStar } from "react-icons/fa";

const destinationImages = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop",
];

function TrendingDestinationSection() {
    return (
        <section
            id="destination"
            className="bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16"
        >
            <div className="mx-auto max-w-7xl rounded-[2rem] bg-white">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, x: -25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col gap-4"
                    >
                        <p className="text-sm font-semibold text-[#F4A61D] sm:text-base">
                            Trendy Destination
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
                            Discover Beautiful Routes with Morya Travels
                        </h2>

                        <p className="text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                            Explore premium destinations, comfortable routes and safe travel
                            experience with trusted service and easy bookings.
                        </p>

                        <div className="grid gap-4 py-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-4">
                                <div className="flex items-center gap-3 text-[#0D5B5B]">
                                    <FaMapMarkerAlt />
                                    <p className="font-semibold">Best Pickup Points</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-4">
                                <div className="flex items-center gap-3 text-[#0D5B5B]">
                                    <FaUsers />
                                    <p className="font-semibold">Comfort Seating</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-4">
                                <div className="flex items-center gap-3 text-[#0D5B5B]">
                                    <FaStar />
                                    <p className="font-semibold">Top Rated Travel</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-4">
                                <div className="flex items-center gap-3 text-[#0D5B5B]">
                                    <FaMapMarkerAlt />
                                    <p className="font-semibold">Trusted Daily Routes</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid gap-4"
                    >
                        <div className="relative h-[280px] overflow-hidden rounded-[2rem] sm:h-[340px] lg:h-[420px]">
                            <Image
                                src={destinationImages[0]}
                                alt="Main Destination"
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {destinationImages.slice(1).map((img, index) => (
                                <div
                                    key={index}
                                    className="relative h-[140px] overflow-hidden rounded-[1.5rem] sm:h-[180px]"
                                >
                                    <Image
                                        src={img}
                                        alt={`Destination ${index + 2}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default TrendingDestinationSection;