"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    FaFacebookF,
    FaInstagram,
    FaYoutube,
    FaWhatsapp,
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaSearch,
} from "react-icons/fa";
import { GiPalmTree } from "react-icons/gi";
import { Playfair_Display, Dancing_Script, Poppins } from "next/font/google";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800"],
});

const dancing = Dancing_Script({
    subsets: ["latin"],
    weight: ["700"],
});

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const instaImages = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=500&q=80",
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`relative overflow-hidden ${poppins.className}`}>
            {/* ========================= */}
            {/* TOP INSTAGRAM STRIP */}
            {/* ========================= */}
            <section className="relative bg-[#f9f5e8] py-10 md:py-20 border-t border-[#0E6B68]/10">
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                    <div className="text-center mb-6">
                        <h3 className="text-[#0E6B68] text-xl sm:text-2xl md:text-3xl font-bold">
                            Follow <span className="text-[#f5ad1b]">Instagram</span>
                        </h3>
                    </div>

                    {/* INSTAGRAM IMAGES */}
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                        {instaImages.map((img, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5, scale: 1.04 }}
                                className="relative w-[72px] h-[72px] sm:w-[86px] sm:h-[86px] rounded-[18px] overflow-hidden shadow-lg"
                            >
                                <Image
                                    src={img}
                                    alt={`Instagram ${index + 1}`}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* MORYA LOGO IMAGE - CENTERED */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="flex justify-center w-full mt-8"
                    >
                        <div className="relative w-[180px] sm:w-[220px] md:w-[250px] h-[80px] sm:h-[95px] md:h-[110px] mx-auto rounded-2xl bg-white shadow-lg border border-[#e8efee] p-2">
                            <Image
                                src="/bus.png"
                                alt="Morya Travels Logo"
                                fill
                                priority
                                className="object-contain p-2"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ========================= */}
            {/* SUBSCRIBE BANNER */}
            {/* ========================= */}
            <section className="relative bg-[#f5ad1b] py-6 sm:py-7 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#f5ad1b] via-[#f7b72d] to-[#f5ad1b]" />
                <div className="absolute -top-8 left-10 w-40 h-20 bg-white/10 blur-2xl rounded-full" />
                <div className="absolute -top-8 right-16 w-40 h-20 bg-white/10 blur-2xl rounded-full" />

                <div className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="text-center lg:text-left">
                            <h2
                                className={`${dancing.className} text-white text-4xl sm:text-5xl md:text-6xl leading-none drop-shadow-sm`}
                            >
                                Subscribe Now!
                            </h2>
                            <p className="text-[#123b3a] mt-2 text-sm sm:text-base font-medium">
                                Sign up to get the latest travel updates, routes & offers.
                            </p>
                        </div>

                        <div className="w-full max-w-[520px]">
                            <div className="bg-white rounded-full p-2 shadow-[0_14px_35px_rgba(0,0,0,0.14)] flex items-center gap-2">
                                <input
                                    type="email"
                                    placeholder="Email address..."
                                    className="flex-1 bg-transparent px-4 py-2.5 outline-none text-[#123b3a] placeholder:text-[#6b7b76] text-sm sm:text-base"
                                />
                                <button className="w-12 h-12 rounded-full bg-[#0A4F4D]/96 text-white flex items-center justify-center hover:scale-105 transition">
                                    <FaSearch />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================= */}
            {/* MAIN FOOTER */}
            {/* ========================= */}
            <section className="relative bg-[#0A4F4D]/96 text-white py-5 md:py-10 overflow-hidden">
                {/* BACKGROUND DECOR */}
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                    <div className="absolute bottom-0 left-0 w-full h-[280px] bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-[220px]">
                        <div className="absolute bottom-0 left-0 w-[35%] h-[160px] bg-[#083f3d] rounded-tr-[100px]" />
                        <div className="absolute bottom-0 left-[20%] w-[40%] h-[180px] bg-[#0b504d] rounded-t-[120px]" />
                        <div className="absolute bottom-0 right-0 w-[45%] h-[170px] bg-[#0a4744] rounded-tl-[120px]" />
                    </div>
                </div>

                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0E6B68] via-white/20 to-[#0E6B68]" />

                <div className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-10 xl:gap-14">
                        {/* BRAND */}
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#f5ad1b] flex items-center justify-center shadow-lg">
                                    <GiPalmTree className="text-white text-xl" />
                                </div>

                                <div>
                                    <h4 className={`${playfair.className} text-2xl sm:text-3xl font-bold`}>
                                        Morya Tours
                                    </h4>
                                    <p className="text-white/75 text-sm">Travel With Comfort</p>
                                </div>
                            </div>

                            <p className="text-white/75 mt-5 text-sm leading-7 max-w-sm">
                                Premium bus booking, tour packages, and reliable transport for
                                memorable journeys across beautiful routes and destinations.
                            </p>

                            {/* SOCIAL ICONS */}
                            <div className="flex gap-3 mt-6">
                                {[
                                    { icon: FaWhatsapp, href: "https://wa.me/918888157744" },
                                    { icon: FaFacebookF, href: "#" },
                                    { icon: FaInstagram, href: "#" },
                                    { icon: FaYoutube, href: "#" },
                                ].map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <a
                                            key={i}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-11 h-11 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/15 hover:border-white/20 flex items-center justify-center transition"
                                        >
                                            <Icon />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {/* DESTINATIONS */}
                        <div>
                            <h4 className="text-xl font-bold mb-5">Destinations</h4>
                            <ul className="space-y-3 text-white/75 text-sm">
                                <li className="hover:text-white transition cursor-pointer">Goa Tour</li>
                                <li className="hover:text-white transition cursor-pointer">Kashmir Package</li>
                                <li className="hover:text-white transition cursor-pointer">Manali Tour</li>
                                <li className="hover:text-white transition cursor-pointer">Kerala Package</li>
                                <li className="hover:text-white transition cursor-pointer">Rajasthan Trip</li>
                            </ul>
                        </div>

                        {/* QUICK LINKS */}
                        <div>
                            <h4 className="text-xl font-bold mb-5">Quick Links</h4>
                            <ul className="space-y-3 text-white/75 text-sm">
                                <li className="hover:text-white transition cursor-pointer">About Us</li>
                                <li className="hover:text-white transition cursor-pointer">Tour Packages</li>
                                <li className="hover:text-white transition cursor-pointer">Bus Booking</li>
                                <li className="hover:text-white transition cursor-pointer">Contact Us</li>
                                <li className="hover:text-white transition cursor-pointer">Privacy Policy</li>
                            </ul>
                        </div>

                        {/* CONTACT */}
                        <div>
                            <h4 className="text-xl font-bold mb-5">Contact</h4>

                            <div className="space-y-4 text-white/75 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                                        <FaPhoneAlt className="text-[#f5ad1b]" />
                                    </div>
                                    <div>
                                        <p className="text-[#f5ad1b] font-semibold text-base">
                                            +91 88881 57744
                                        </p>
                                        <p>24/7 Support Available</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                                        <FaEnvelope className="text-[#f5ad1b]" />
                                    </div>
                                    <div>
                                        <p>moryatours@gmail.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                                        <FaMapMarkerAlt className="text-[#f5ad1b]" />
                                    </div>
                                    <div>
                                        <p>Shrivardhan - Borli - Borivali - Virar</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM INSTAGRAM MINI STRIP */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                            <h5 className="text-lg font-semibold text-white">
                                Follow <span className="text-[#f5ad1b]">Instagram</span>
                            </h5>

                            <div className="flex flex-wrap gap-3">
                                {instaImages.slice(0, 8).map((img, index) => (
                                    <div
                                        key={index}
                                        className="relative w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] rounded-[16px] overflow-hidden"
                                    >
                                        <Image
                                            src={img}
                                            alt={`Footer Instagram ${index + 1}`}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* COPYRIGHT */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-white/60 text-sm">
                        <p>© {currentYear} Morya Tours & Travels. All Rights Reserved.</p>
                        <p>Designed for Premium Travel Experience</p>
                    </div>
                </div>
            </section>
        </footer>
    );
}