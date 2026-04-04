"use client";

import React from "react";
import { motion } from "framer-motion";

const pricingPlans = [
    {
        title: "Basic Travel",
        price: "₹499",
        features: ["Regular Seat", "Basic Support", "Comfort Travel"],
    },
    {
        title: "Standard Travel",
        price: "₹899",
        features: ["Priority Seat", "Quick Support", "Smooth Journey"],
    },
    {
        title: "Premium Travel",
        price: "₹1499",
        features: ["Best Seat", "Premium Support", "Top Experience"],
    },
];

function PricingSection() {
    return (
        <section
            id="pricing"
            className="bg-[#EAF7F7] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16"
        >
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-sm font-semibold text-[#F4A61D] sm:text-base">
                        Price For Travel The World
                    </p>
                    <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                        Affordable Travel Packages
                    </h2>
                </div>

                <div className="grid gap-6 py-8 md:grid-cols-2 lg:grid-cols-3 lg:py-10">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={plan.title}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="rounded-[2rem] bg-white px-6 py-8 text-center shadow-lg"
                        >
                            <h3 className="text-xl font-bold text-slate-900">{plan.title}</h3>
                            <p className="py-4 text-4xl font-black text-[#0D5B5B]">{plan.price}</p>

                            <div className="flex flex-col gap-3">
                                {plan.features.map((feature, idx) => (
                                    <p key={idx} className="text-sm text-slate-600 sm:text-base">
                                        {feature}
                                    </p>
                                ))}
                            </div>

                            <button className="mt-6 rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-[#0D5B5B] transition duration-300 hover:bg-lime-300">
                                Book Now
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PricingSection;