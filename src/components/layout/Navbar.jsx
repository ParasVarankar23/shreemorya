"use client";

import { Playfair_Display } from "next/font/google";
import { FaBars, FaBusAlt, FaPhoneAlt, FaTimes } from "react-icons/fa";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
});

export default function Navbar({ mobileMenu, setMobileMenu, isScrolled }) {
    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
                ? "bg-[#0A4F4D]/96 shadow-2xl border-b border-white/10 backdrop-blur-xl"
                : "bg-[#0A4F4D]/80 backdrop-blur-md border-b border-white/5"
                }`}
        >
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                <div className="h-16 sm:h-[70px] md:h-[78px] flex items-center justify-between">
                    {/* LOGO */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#E8A317] flex items-center justify-center shadow-lg shrink-0">
                            <FaBusAlt className="text-[#16302B] text-base md:text-lg" />
                        </div>

                        <div>
                            <h1
                                className={`${playfair.className} text-white text-sm sm:text-lg md:text-xl xl:text-[30px] font-bold tracking-wide leading-tight`}
                            >
                                Morya Travels
                            </h1>
                            <p className="text-white/75 text-[10px] sm:text-[11px] md:text-xs">
                                Premium Bus Booking
                            </p>
                        </div>
                    </div>

                    {/* DESKTOP MENU */}
                    <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-white/90 text-sm xl:text-base font-medium">
                        <a href="/" className="hover:text-[#E8A317] transition duration-200">
                            Home
                        </a>
                        <a href="/routes" className="hover:text-[#E8A317] transition duration-200">
                            Routes
                        </a>
                        <a href="/services" className="hover:text-[#E8A317] transition duration-200">
                            Services
                        </a>
                        <a href="/testimonials" className="hover:text-[#E8A317] transition duration-200">
                            Testimonials
                        </a>
                        <a href="/contact" className="hover:text-[#E8A317] transition duration-200">
                            Contact
                        </a>
                    </nav>

                    {/* RIGHT SIDE */}
                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href="tel:+9188881 57744"
                            className="hidden xl:flex items-center gap-2 text-white/90 text-sm"
                        >
                            <FaPhoneAlt className="text-[#E8A317]" />
                            +91 88881 57744
                        </a>

                        <button className="bg-[#E8A317] text-white/90 px-4 md:px-6 py-2.5 md:py-3 rounded-full font-semibold hover:bg-[#D48F0C] hover:scale-105 transition shadow-lg">
                            Book Now
                        </button>
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button
                        className="lg:hidden text-white text-xl sm:text-2xl"
                        onClick={() => setMobileMenu(!mobileMenu)}
                        aria-label="Toggle Menu"
                    >
                        {mobileMenu ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* MOBILE MENU */}
                {mobileMenu && (
                    <div className="lg:hidden pb-4">
                        <div className="bg-white rounded-3xl p-4 space-y-3 shadow-2xl border border-[#F2E7C9]">
                            <a href="/" className="block text-[#16302B] font-medium hover:text-[#0E6B68] transition">
                                Home
                            </a>
                            <a href="/routes" className="block text-[#16302B] font-medium hover:text-[#0E6B68] transition">
                                Routes
                            </a>
                            <a href="/services" className="block text-[#16302B] font-medium hover:text-[#0E6B68] transition">
                                Services
                            </a>
                            <a href="/testimonials" className="block text-[#16302B] font-medium hover:text-[#0E6B68] transition">
                                Testimonials
                            </a>
                            <a href="/contact" className="block text-[#16302B] font-medium hover:text-[#0E6B68] transition">
                                Contact
                            </a>

                            <button className="w-full bg-[#E8A317] text-[#16302B] py-3 rounded-full font-bold mt-2 hover:bg-[#D48F0C] transition">
                                Book Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}