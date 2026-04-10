"use client";

import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

export default function FloatingButtons() {
    return (
        <div className="fixed bottom-5 right-5 z-[90] flex flex-col gap-3">
            <a
                href="https://wa.me/9188881 57744"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition"
            >
                <FaWhatsapp className="text-xl md:text-2xl" />
            </a>

            <a
                href="tel:+9188881 57744"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f4b32c] text-[#123b3a] flex items-center justify-center shadow-2xl hover:scale-110 transition"
            >
                <FaPhoneAlt />
            </a>
        </div>
    );
}