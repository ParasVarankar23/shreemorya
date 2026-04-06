"use client";

import { FaPhoneAlt, FaBars, FaTimes } from "react-icons/fa";
import { GiPalmTree } from "react-icons/gi";

export default function Navbar({ mobileMenu, setMobileMenu, isScrolled }) {
    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
                    ? "bg-[#0d5b5a]/95 shadow-2xl border-b border-white/10 backdrop-blur-xl"
                    : "bg-[#0d5b5a]/88 backdrop-blur-md border-b border-white/5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 md:h-[78px] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#f4b32c] flex items-center justify-center shadow-lg shrink-0">
                            <GiPalmTree className="text-white text-lg md:text-xl" />
                        </div>
                        <div>
                            <h1 className="text-white text-base sm:text-lg md:text-xl font-bold tracking-wide leading-tight">
                                Morya Tours & Travels
                            </h1>
                            <p className="text-white/70 text-[10px] sm:text-[11px] md:text-xs">
                                Premium Bus & Tour Booking
                            </p>
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center gap-7 text-white/90 text-sm font-medium">
                        <a href="#home" className="hover:text-[#f4b32c] transition">Home</a>
                        <a href="#packages" className="hover:text-[#f4b32c] transition">Packages</a>
                        <a href="#testimonial" className="hover:text-[#f4b32c] transition">Testimonials</a>
                        <a href="#contact" className="hover:text-[#f4b32c] transition">Contact</a>
                        <a href="#blogs" className="hover:text-[#f4b32c] transition">Blogs</a>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href="tel:+919309940782"
                            className="hidden xl:flex items-center gap-2 text-white/90 text-sm"
                        >
                            <FaPhoneAlt className="text-[#f4b32c]" />
                            +91 93099 40782
                        </a>
                        <button className="bg-[#f4b32c] text-[#123b3a] px-4 md:px-5 py-2.5 rounded-full font-semibold hover:scale-105 transition shadow-lg">
                            Book Now
                        </button>
                    </div>

                    <button
                        className="lg:hidden text-white text-xl"
                        onClick={() => setMobileMenu(!mobileMenu)}
                    >
                        {mobileMenu ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {mobileMenu && (
                    <div className="lg:hidden pb-4">
                        <div className="bg-white rounded-3xl p-4 space-y-3 shadow-2xl">
                            <a href="#home" className="block text-[#123b3a] font-medium">Home</a>
                            <a href="#packages" className="block text-[#123b3a] font-medium">Packages</a>
                            <a href="#testimonial" className="block text-[#123b3a] font-medium">Testimonials</a>
                            <a href="#contact" className="block text-[#123b3a] font-medium">Contact</a>
                            <a href="#blogs" className="block text-[#123b3a] font-medium">Blogs</a>
                            <button className="w-full bg-[#f4b32c] text-[#123b3a] py-3 rounded-full font-semibold mt-2">
                                Book Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}