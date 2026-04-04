"use client";

import React from "react";
import Link from "next/link";
import {
  FaBus,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Destination", href: "#destination" },
  { name: "Pricing", href: "#pricing" },
  { name: "Services", href: "#services" },
  { name: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[#0D5B5B] text-white"
    >
      {/* Top Footer */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-8 lg:py-16">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg">
              <FaBus className="text-lg" />
            </div>

            <div>
              <h3 className="text-xl font-bold sm:text-2xl">Morya Travels</h3>
              <p className="text-xs text-white/80 sm:text-sm">
                Safe • Fast • Trusted
              </p>
            </div>
          </div>

          <p className="py-5 text-sm leading-7 text-white/80 sm:text-base">
            Premium and trusted travel booking experience for daily routes,
            seasonal bookings, and smooth pickup & drop service with
            <span className="font-semibold text-[#FFD166]"> Morya Travels</span>.
          </p>

          <Link
            href="#booking"
            className="inline-flex items-center gap-2 rounded-full bg-[#F4A61D] px-5 py-3 text-sm font-bold text-white transition duration-300 hover:bg-[#E69512]"
          >
            Book Your Seat
            <FaArrowRight className="text-xs" />
          </Link>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-bold sm:text-xl">Quick Links</h4>

          <ul className="flex flex-col gap-3 py-5 text-sm text-white/80 sm:text-base">
            {navLinks.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="transition duration-300 hover:text-[#FFD166]"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support / Contact */}
        <div>
          <h4 className="text-lg font-bold sm:text-xl">Contact & Support</h4>

          <div className="flex flex-col gap-4 py-5 text-sm text-white/80 sm:text-base">
            <div className="flex items-start gap-3">
              <FaPhoneAlt className="mt-1 text-[#FFD166]" />
              <div>
                <p className="font-medium text-white">Phone</p>
                <p>+91 93099 40782</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaWhatsapp className="mt-1 text-[#FFD166]" />
              <div>
                <p className="font-medium text-white">WhatsApp</p>
                <p>Quick Booking Support</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="mt-1 text-[#FFD166]" />
              <div>
                <p className="font-medium text-white">Service Area</p>
                <p>Satara • Pune • Panvel • Mumbai</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaEnvelope className="mt-1 text-[#FFD166]" />
              <div>
                <p className="font-medium text-white">Email</p>
                <p>support@moryatravels.in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social + Newsletter */}
        <div>
          <h4 className="text-lg font-bold sm:text-xl">Follow Us</h4>

          <div className="flex gap-3 py-5">
            <Link
              href="https://facebook.com"
              target="_blank"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition duration-300 hover:bg-white/20"
            >
              <FaFacebookF />
            </Link>

            <Link
              href="https://instagram.com"
              target="_blank"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition duration-300 hover:bg-white/20"
            >
              <FaInstagram />
            </Link>

            <Link
              href="https://wa.me/919309940782"
              target="_blank"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition duration-300 hover:bg-white/20"
            >
              <FaWhatsapp />
            </Link>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-4">
            <p className="text-sm font-semibold text-white sm:text-base">
              Need quick booking help?
            </p>
            <p className="py-2 text-xs leading-6 text-white/80 sm:text-sm">
              Contact us on WhatsApp for fast seat booking and travel updates.
            </p>

            <Link
              href="https://wa.me/919309940782"
              target="_blank"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#FFD166] transition duration-300 hover:text-white"
            >
              Chat on WhatsApp
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-white/70 sm:px-6 sm:text-sm md:flex-row lg:px-8">
          <p>© 2026 Morya Travels. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="#" className="transition duration-300 hover:text-[#FFD166]">
              Privacy Policy
            </Link>
            <Link href="#" className="transition duration-300 hover:text-[#FFD166]">
              Terms & Conditions
            </Link>
            <Link href="#" className="transition duration-300 hover:text-[#FFD166]">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}