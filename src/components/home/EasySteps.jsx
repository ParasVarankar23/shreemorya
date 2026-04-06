"use client";

import { motion } from "framer-motion";
import {
    FaMapMarkerAlt,
    FaRoute,
    FaCalendarAlt,
    FaSearch,
    FaChair,
    FaUserAlt,
    FaPhoneAlt,
    FaCreditCard,
    FaCheckCircle,
    FaArrowRight,
} from "react-icons/fa";

const bookingSteps = [
    {
        id: "01",
        title: "Select Pickup & Drop",
        desc: "Choose your boarding point and destination route for your daily or tour journey.",
        icon: FaMapMarkerAlt,
        color: "bg-[#0d5b5a]",
    },
    {
        id: "02",
        title: "Choose Date & Search",
        desc: "Pick your travel date and search available buses, routes, and departure timings.",
        icon: FaCalendarAlt,
        color: "bg-[#f4b32c]",
    },
    {
        id: "03",
        title: "Select Your Seat",
        desc: "View the live seat layout and choose your preferred available seat easily.",
        icon: FaChair,
        color: "bg-[#0d5b5a]",
    },
    {
        id: "04",
        title: "Enter Name & Phone",
        desc: "Fill in passenger details like full name and mobile number for ticket confirmation.",
        icon: FaUserAlt,
        color: "bg-[#f4b32c]",
    },
    {
        id: "05",
        title: "Pay Online Securely",
        desc: "Complete your booking with safe online payment using UPI, cards, or net banking.",
        icon: FaCreditCard,
        color: "bg-[#0d5b5a]",
    },
    {
        id: "06",
        title: "Get Ticket Confirmation",
        desc: "Receive instant booking confirmation and travel details on your phone.",
        icon: FaCheckCircle,
        color: "bg-[#7ed321]",
    },
];

export default function EasySteps() {
    return (
        <section className="relative py-16 md:py-20 lg:py-24 bg-[#f8fbfa] overflow-hidden">
            {/* TOP DECOR */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#eef8f6] to-transparent pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-[#0d5b5a]/6 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-[#f4b32c]/8 blur-3xl" />

            <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14">
                {/* HEADER */}
                <div className="text-center mb-12 lg:mb-16">
                    <p className="text-[#f4b32c] font-semibold tracking-wide text-sm sm:text-base">
                        Easy Steps For Booking
                    </p>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-[#123b3a]">
                        Book Your Journey Easily
                    </h3>
                    <p className="text-gray-600 max-w-3xl mx-auto mt-4 text-sm sm:text-base md:text-lg leading-7">
                        Book your bus ticket in just a few simple steps with Morya Travels.
                        Easy route selection, seat booking, passenger details, and secure payment.
                    </p>
                </div>

                {/* QUICK FLOW BAR */}
                <div className="hidden xl:flex items-center justify-center gap-3 mb-12 flex-wrap">
                    {[
                        "Select Pickup",
                        "Select Drop",
                        "Choose Date",
                        "Search Bus",
                        "Select Seat",
                        "Enter Details",
                        "Online Payment",
                    ].map((item, index, arr) => (
                        <div key={index} className="flex items-center gap-3">
                            <span className="px-4 py-2 rounded-full bg-white border border-[#dfe9e7] text-[#123b3a] text-sm font-semibold shadow-sm">
                                {item}
                            </span>
                            {index !== arr.length - 1 && (
                                <FaArrowRight className="text-[#0d5b5a]/50 text-sm" />
                            )}
                        </div>
                    ))}
                </div>

                {/* STEPS GRID */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {bookingSteps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.08 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -6 }}
                                className="group relative bg-white rounded-[26px] lg:rounded-[30px] p-6 lg:p-7 shadow-[0_18px_40px_rgba(0,0,0,0.06)] border border-[#e8efee] hover:shadow-[0_22px_50px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden"
                            >
                                {/* CORNER GLOW */}
                                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#0d5b5a]/5 blur-2xl group-hover:bg-[#f4b32c]/10 transition" />

                                {/* STEP NUMBER */}
                                <div className="flex items-start justify-between gap-4">
                                    <div
                                        className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl ${step.color} text-white flex items-center justify-center shadow-lg`}
                                    >
                                        <Icon className="text-2xl lg:text-[26px]" />
                                    </div>

                                    <span className="text-sm font-bold text-[#f4b32c] bg-[#fff8e8] px-3 py-1.5 rounded-full">
                                        Step {step.id}
                                    </span>
                                </div>

                                {/* TITLE */}
                                <h4 className="text-xl lg:text-2xl font-bold mt-5 text-[#123b3a] leading-tight">
                                    {step.title}
                                </h4>

                                {/* DESCRIPTION */}
                                <p className="text-gray-600 text-sm sm:text-base mt-3 leading-7">
                                    {step.desc}
                                </p>

                                {/* MINI VISUAL STRIP */}
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {step.id === "01" && (
                                        <>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#edf7f6] text-[#0d5b5a]">
                                                Select Pickup
                                            </span>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#edf7f6] text-[#0d5b5a]">
                                                Select Drop
                                            </span>
                                        </>
                                    )}

                                    {step.id === "02" && (
                                        <>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#fff8e8] text-[#a86d00]">
                                                Choose Date
                                            </span>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#fff8e8] text-[#a86d00]">
                                                Search Bus
                                            </span>
                                        </>
                                    )}

                                    {step.id === "03" && (
                                        <>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#edf7f6] text-[#0d5b5a]">
                                                Window Seat
                                            </span>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#edf7f6] text-[#0d5b5a]">
                                                Sleeper / Seater
                                            </span>
                                        </>
                                    )}

                                    {step.id === "04" && (
                                        <>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#fff8e8] text-[#a86d00]">
                                                Full Name
                                            </span>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#fff8e8] text-[#a86d00]">
                                                Phone Number
                                            </span>
                                        </>
                                    )}

                                    {step.id === "05" && (
                                        <>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#edf7f6] text-[#0d5b5a]">
                                                UPI
                                            </span>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#edf7f6] text-[#0d5b5a]">
                                                Card
                                            </span>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#edf7f6] text-[#0d5b5a]">
                                                Net Banking
                                            </span>
                                        </>
                                    )}

                                    {step.id === "06" && (
                                        <>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#eefbe1] text-[#4d7d00]">
                                                Ticket Confirmed
                                            </span>
                                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#eefbe1] text-[#4d7d00]">
                                                WhatsApp / SMS
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* BOTTOM BAR */}
                                <div className="mt-6 h-1.5 w-full rounded-full bg-[#edf3f2] overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${step.id === "01"
                                                ? "w-[18%] bg-[#0d5b5a]"
                                                : step.id === "02"
                                                    ? "w-[36%] bg-[#f4b32c]"
                                                    : step.id === "03"
                                                        ? "w-[54%] bg-[#0d5b5a]"
                                                        : step.id === "04"
                                                            ? "w-[72%] bg-[#f4b32c]"
                                                            : step.id === "05"
                                                                ? "w-[88%] bg-[#0d5b5a]"
                                                                : "w-full bg-[#7ed321]"
                                            }`}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* BOTTOM CTA */}
                <div className="mt-12 lg:mt-16 bg-white rounded-[28px] lg:rounded-[34px] border border-[#e8efee] shadow-[0_18px_50px_rgba(0,0,0,0.06)] p-5 sm:p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                        <div>
                            <p className="text-[#f4b32c] font-semibold text-sm sm:text-base">
                                Fast & Easy Booking
                            </p>
                            <h4 className="text-2xl md:text-3xl font-bold text-[#123b3a] mt-1">
                                Complete your ticket booking in minutes
                            </h4>
                            <p className="text-gray-600 mt-2 text-sm sm:text-base leading-7 max-w-2xl">
                                Select your route, choose your seat, enter passenger details,
                                and make secure online payment for instant ticket confirmation.
                            </p>
                        </div>

                        <button className="bg-[#0d5b5a] hover:bg-[#094847] text-white px-6 sm:px-8 py-3 rounded-full font-semibold transition shadow-lg">
                            Start Booking
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}