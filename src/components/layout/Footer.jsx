"use client";

import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { GiPalmTree } from "react-icons/gi";

export default function Footer() {
    return (
        <footer className="bg-[#0b4c4b] text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-[#f4b32c] flex items-center justify-center">
                                <GiPalmTree className="text-white text-xl" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold">Morya Tours</h4>
                                <p className="text-white/70 text-sm">Travel With Comfort</p>
                            </div>
                        </div>
                        <p className="text-white/70 mt-4 text-sm leading-7">
                            Premium bus booking, tour packages, and reliable transport for memorable journeys.
                        </p>

                        <div className="flex gap-3 mt-5">
                            {[FaFacebookF, FaInstagram, FaTwitter, FaYoutube].map((Icon, i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#f4b32c] hover:text-[#123b3a] flex items-center justify-center transition cursor-pointer"
                                >
                                    <Icon />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-4">Destinations</h4>
                        <ul className="space-y-3 text-white/70 text-sm">
                            <li>Goa Tour</li>
                            <li>Kashmir Package</li>
                            <li>Manali Tour</li>
                            <li>Kerala Package</li>
                            <li>Rajasthan Trip</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-3 text-white/70 text-sm">
                            <li>About Us</li>
                            <li>Tour Packages</li>
                            <li>Bus Booking</li>
                            <li>Contact Us</li>
                            <li>Privacy Policy</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-4">Contact</h4>
                        <ul className="space-y-3 text-white/70 text-sm">
                            <li>Masur / Satara, Maharashtra</li>
                            <li>+91 93099 40782</li>
                            <li>moryatours@gmail.com</li>
                            <li>Mon - Sun: 24/7 Support</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/60 text-sm">
                    <p>© 2026 Morya Tours & Travels. All Rights Reserved.</p>
                    <p>Designed for Premium Travel Experience</p>
                </div>
            </div>
        </footer>
    );
}