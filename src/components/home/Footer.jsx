"use client";

import React from "react";
import Link from "next/link";
import { FaBus, FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";

function Footer() {
    return (
        <footer
            id="contact"
            className="bg-[#0D5B5B] px-4 py-10 text-white sm:px-6 sm:py-12 lg:px-8 lg:py-14"
        >
            <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                            <FaBus />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold">Morya Travels</h3>
                            <p className="text-sm text-white/80">Safe • Fast • Trusted</p>
                        </div>
                    </div>

                    <p className="py-4 text-sm leading-7 text-white/80">
                        Premium and trusted travel booking experience with Morya Travels for
                        daily and seasonal routes.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-bold">Quick Links</h4>
                    <div className="flex flex-col gap-3 py-4 text-sm text-white/80">
                        <Link href="#home">Home</Link>
                        <Link href="#destination">Destination</Link>
                        <Link href="#pricing">Pricing</Link>
                        <Link href="#services">Services</Link>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-bold">Support</h4>
                    <div className="flex flex-col gap-3 py-4 text-sm text-white/80">
                        <p>Booking Help</p>
                        <p>Route Inquiry</p>
                        <p>WhatsApp Support</p>
                        <p>Customer Service</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-bold">Follow Us</h4>
                    <div className="flex gap-3 py-4">
                        {[FaFacebookF, FaInstagram, FaWhatsapp].map((Icon, index) => (
                            <button
                                key={index}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 transition duration-300 hover:bg-white/20"
                            >
                                <Icon />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="py-6 text-center text-sm text-white/70">
                © 2026 Morya Travels. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;