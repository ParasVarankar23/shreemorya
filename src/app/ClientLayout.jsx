"use client";

import FloatingButtons from "@/components/home/FloatingButtons";
import AppToaster from "@/components/layout/AppToaster";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Script from "next/script";
import { useEffect, useState } from "react";

export default function ClientLayout({ children }) {
    const [mobileMenu, setMobileMenu] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (mobileMenu) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenu]);

    return (
        <>
            <AppToaster />
            {/* Google Identity Services Script */}
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
            />

            <Navbar
                mobileMenu={mobileMenu}
                setMobileMenu={setMobileMenu}
                isScrolled={isScrolled}
            />

            <FloatingButtons />

            <main className="pt-[20px] sm:pt-[96px] lg:pt-[20px]">
                {children}
            </main>

            <Footer />
        </>
    );
}