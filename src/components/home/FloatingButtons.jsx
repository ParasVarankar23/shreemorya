"use client";

import { FaWhatsapp } from "react-icons/fa";
import { PhoneCall, MessageCircleMore } from "lucide-react";
import { motion } from "framer-motion";

export default function FloatingButtons() {
    return (
        <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[999] flex flex-col gap-3">
            {/* CHATBOT BUTTON */}
            <motion.a
                href="/contact"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                className="group relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_12px_35px_rgba(0,0,0,0.16)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_16px_45px_rgba(0,0,0,0.22)]"
                aria-label="Open Chat Support"
            >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0E6B68]/10 to-[#0E6B68]/5 opacity-0 group-hover:opacity-100 transition" />
                <MessageCircleMore className="relative z-10 w-6 h-6 md:w-7 md:h-7 text-[#0E6B68]" />
            </motion.a>

            {/* WHATSAPP BUTTON */}
            <motion.a
                href="https://wa.me/918888157744"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                className="group relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#25D366] text-white shadow-[0_14px_35px_rgba(37,211,102,0.35)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_18px_45px_rgba(37,211,102,0.45)]"
                aria-label="Chat on WhatsApp"
            >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-black/10 opacity-0 group-hover:opacity-100 transition" />
                <FaWhatsapp className="relative z-10 text-[24px] md:text-[28px]" />
            </motion.a>

            {/* CALL BUTTON */}
            <motion.a
                href="tel:+918888157744"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                className="group relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#f4b32c] text-[#123b3a] shadow-[0_14px_35px_rgba(244,179,44,0.35)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_18px_45px_rgba(244,179,44,0.45)]"
                aria-label="Call Now"
            >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-black/5 opacity-0 group-hover:opacity-100 transition" />
                <PhoneCall className="relative z-10 w-6 h-6 md:w-7 md:h-7" />
            </motion.a>
        </div>
    );
}