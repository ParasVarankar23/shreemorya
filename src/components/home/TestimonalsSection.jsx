"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaQuoteLeft,
    FaStar,
    FaCheckCircle,
    FaArrowLeft,
    FaArrowRight,
} from "react-icons/fa";

const testimonials = [
    {
        name: "Siddhi Patil",
        message:
            "Morya Travels provides a very smooth and comfortable journey. The booking process was simple, and the service was reliable and on time.",
    },
    {
        name: "Sanvi Varankar",
        message:
            "Very good daily route service. Seat booking was easy, the bus was clean, and the overall travel experience was safe and comfortable.",
    },
    {
        name: "Rohini Gaikar",
        message:
            "I had a great travel experience with Morya Travels. The online booking was easy, and the staff was helpful throughout the journey.",
    },
    {
        name: "Jai Khot",
        message:
            "The route details were clear, the seat selection was simple, and payment was secure. I really liked the overall booking experience.",
    },
    {
        name: "Riddhi Rikame",
        message:
            "Pickup was on time, and the journey was smooth. Morya Travels is a very good option for regular and family travel.",
    },
    {
        name: "Mayuresh Narvankar",
        message:
            "Very trustworthy service for regular routes. The bus was comfortable, and the travel process from booking to boarding was easy.",
    },
    {
        name: "Tushar Adav",
        message:
            "The online booking system is user-friendly and fast. Route selection and seat booking were very easy. Highly recommended service.",
    },
    {
        name: "Sarthak Pilankar",
        message:
            "Excellent service for regular travel. Comfortable seating, proper timing, and a clean bus made the trip enjoyable and stress-free.",
    },
    {
        name: "Satish Raut",
        message:
            "Ticket booking was quick, and I received confirmation immediately. Morya Travels is dependable and perfect for daily route travel.",
    },
    {
        name: "Runal Satnak",
        message:
            "Very smooth and professional travel service. Booking, payment, and route details were clear, and the journey felt safe and premium.",
    },
];

export default function TestimonialSection() {
    const [cardsPerView, setCardsPerView] = useState(3);
    const [currentGroup, setCurrentGroup] = useState(0);

    // RESPONSIVE CARDS PER VIEW
    useEffect(() => {
        const updateCardsPerView = () => {
            if (window.innerWidth < 640) {
                setCardsPerView(1); // mobile
            } else if (window.innerWidth < 1024) {
                setCardsPerView(2); // tablet
            } else {
                setCardsPerView(3); // desktop
            }
        };

        updateCardsPerView();
        window.addEventListener("resize", updateCardsPerView);

        return () => window.removeEventListener("resize", updateCardsPerView);
    }, []);

    // TOTAL GROUPS
    const totalGroups = useMemo(() => {
        return Math.ceil(testimonials.length / cardsPerView);
    }, [cardsPerView]);

    // RESET GROUP IF SCREEN CHANGES
    useEffect(() => {
        if (currentGroup > totalGroups - 1) {
            setCurrentGroup(0);
        }
    }, [cardsPerView, totalGroups, currentGroup]);

    const startIndex = currentGroup * cardsPerView;
    const visibleTestimonials = testimonials.slice(
        startIndex,
        startIndex + cardsPerView
    );

    const handlePrev = () => {
        setCurrentGroup((prev) => (prev === 0 ? totalGroups - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentGroup((prev) => (prev === totalGroups - 1 ? 0 : prev + 1));
    };

    return (
        <section
            id="testimonial"
            className="relative py-16 md:py-20 lg:py-24 bg-white overflow-hidden"
        >
            {/* DECOR */}
            <div className="absolute top-10 left-0 w-48 h-48 bg-[#0d5b5a]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-0 w-56 h-56 bg-[#f4b32c]/8 rounded-full blur-3xl" />

            <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14">
                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 lg:mb-14">
                    <div>
                        <p className="text-[#f4b32c] font-semibold tracking-wide text-sm sm:text-base">
                            What Our Customers Say
                        </p>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-[#123b3a]">
                            Trusted by Happy Travelers
                        </h3>
                        <p className="text-gray-600 max-w-3xl mt-4 text-sm sm:text-base md:text-lg leading-7">
                            Real feedback from customers who trust Morya Travels for safe,
                            comfortable, and reliable journeys.
                        </p>
                    </div>

                    {/* ARROWS */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrev}
                            className="w-12 h-12 rounded-full border border-[#dfe9e7] bg-white text-[#123b3a] flex items-center justify-center shadow-sm hover:bg-[#0d5b5a] hover:text-white transition"
                            aria-label="Previous testimonials"
                        >
                            <FaArrowLeft />
                        </button>

                        <button
                            onClick={handleNext}
                            className="w-12 h-12 rounded-full bg-[#0d5b5a] text-white flex items-center justify-center shadow-lg hover:bg-[#094847] transition"
                            aria-label="Next testimonials"
                        >
                            <FaArrowRight />
                        </button>
                    </div>
                </div>

                {/* TOP STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 lg:mb-10">
                    <div className="bg-[#f8fbfa] border border-[#e8efee] rounded-[24px] p-5 text-center shadow-sm">
                        <h4 className="text-2xl md:text-3xl font-bold text-[#123b3a]">10+</h4>
                        <p className="text-gray-500 text-sm mt-1">Happy Customers</p>
                    </div>
                    <div className="bg-[#f8fbfa] border border-[#e8efee] rounded-[24px] p-5 text-center shadow-sm">
                        <h4 className="text-2xl md:text-3xl font-bold text-[#123b3a]">4.9★</h4>
                        <p className="text-gray-500 text-sm mt-1">Average Rating</p>
                    </div>
                    <div className="bg-[#f8fbfa] border border-[#e8efee] rounded-[24px] p-5 text-center shadow-sm">
                        <h4 className="text-2xl md:text-3xl font-bold text-[#123b3a]">Safe</h4>
                        <p className="text-gray-500 text-sm mt-1">Trusted Service</p>
                    </div>
                    <div className="bg-[#f8fbfa] border border-[#e8efee] rounded-[24px] p-5 text-center shadow-sm">
                        <h4 className="text-2xl md:text-3xl font-bold text-[#123b3a]">Daily</h4>
                        <p className="text-gray-500 text-sm mt-1">Regular Routes</p>
                    </div>
                </div>

                {/* CAROUSEL - ONLY VISIBLE CARDS */}
                <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentGroup}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.45 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                        >
                            {visibleTestimonials.map((item, index) => (
                                <motion.div
                                    key={`${item.name}-${index}`}
                                    initial={{ opacity: 0, y: 25 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: index * 0.08 }}
                                    className="bg-[#f8fbfa] rounded-[26px] lg:rounded-[30px] p-6 lg:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.05)] border border-[#e8efee] hover:shadow-[0_22px_50px_rgba(0,0,0,0.08)] transition-all duration-300 h-full"
                                >
                                    {/* TOP */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#0d5b5a] text-white flex items-center justify-center shadow-lg">
                                            <FaQuoteLeft className="text-lg" />
                                        </div>

                                        <div className="flex gap-1 text-[#f4b32c] text-sm">
                                            <FaStar />
                                            <FaStar />
                                            <FaStar />
                                            <FaStar />
                                            <FaStar />
                                        </div>
                                    </div>

                                    {/* MESSAGE */}
                                    <p className="text-gray-700 mt-5 text-sm sm:text-base leading-7 min-h-[170px]">
                                        {item.message}
                                    </p>

                                    {/* FOOTER */}
                                    <div className="mt-6 pt-5 border-t border-[#e5eeec] flex items-center justify-between gap-3">
                                        <div>
                                            <h4 className="font-bold text-lg text-[#123b3a]">{item.name}</h4>
                                            <p className="text-gray-500 text-sm">Verified Traveler</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-[#0d5b5a] text-sm font-semibold bg-white px-3 py-2 rounded-full border border-[#dfe9e7] whitespace-nowrap">
                                            <FaCheckCircle className="text-[#7ed321]" />
                                            Verified
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* DOTS */}
                <div className="flex justify-center items-center gap-2 mt-8">
                    {Array.from({ length: totalGroups }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentGroup(index)}
                            className={`transition-all duration-300 rounded-full ${currentGroup === index
                                    ? "w-8 h-3 bg-[#0d5b5a]"
                                    : "w-3 h-3 bg-[#d7e5e3]"
                                }`}
                            aria-label={`Go to testimonial group ${index + 1}`}
                        />
                    ))}
                </div>

                {/* BOTTOM CTA */}
                <div className="mt-12 lg:mt-16 bg-gradient-to-r from-[#0d5b5a] to-[#136b69] rounded-[28px] lg:rounded-[34px] p-6 sm:p-8 lg:p-10 text-white shadow-2xl">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                        <div>
                            <p className="text-[#f4b32c] font-semibold text-sm sm:text-base">
                                Trusted By Daily Travelers
                            </p>
                            <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2">
                                Join hundreds of happy Morya Travels passengers
                            </h4>
                            <p className="text-white/85 mt-3 text-sm sm:text-base leading-7 max-w-2xl">
                                Comfortable rides, reliable routes, secure booking, and smooth
                                journeys — trusted by travelers for daily and regular bus service.
                            </p>
                        </div>

                        <button className="bg-[#f4b32c] hover:bg-[#e7a91f] text-[#123b3a] px-6 sm:px-8 py-3 rounded-full font-semibold transition shadow-lg whitespace-nowrap">
                            Book Your Seat
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}