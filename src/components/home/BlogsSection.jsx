"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { blogs } from "./homeData";

export default function BlogsSection() {
    return (
        <section id="blogs" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                    <div>
                        <p className="text-[#f4b32c] font-semibold">Explore Latest News</p>
                        <h3 className="text-3xl md:text-4xl font-bold text-[#123b3a] mt-2">
                            Travel Stories & Blogs
                        </h3>
                    </div>
                    <button className="bg-[#f4b32c] text-[#123b3a] px-5 py-2.5 rounded-full font-semibold w-fit">
                        View All
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {blogs.map((blog, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.12 }}
                            viewport={{ once: true }}
                            className="rounded-[28px] overflow-hidden border border-[#e8efee] shadow-xl bg-white"
                        >
                            <div className="relative h-56">
                                <Image
                                    src={blog.image}
                                    alt={blog.title}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-5">
                                <h4 className="text-xl font-semibold leading-8 text-[#123b3a]">
                                    {blog.title}
                                </h4>
                                <button className="mt-4 text-[#f4b32c] font-semibold">
                                    Read More →
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}