"use client";

import { showAppToast } from "@/lib/toast";
import { Playfair_Display } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBars, FaBusAlt, FaPhoneAlt, FaTimes } from "react-icons/fa";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
});

export default function PublicNavbar({ mobileMenu, setMobileMenu, isScrolled }) {
    const pathname = usePathname();
    const router = useRouter();

    const [googleReady, setGoogleReady] = useState(false);
    const [internalMobileMenu, setInternalMobileMenu] = useState(false);

    const isMobileMenuOpen =
        typeof mobileMenu === "boolean" ? mobileMenu : internalMobileMenu;

    const updateMobileMenu = (nextState) => {
        const resolvedState =
            typeof nextState === "function"
                ? nextState(isMobileMenuOpen)
                : nextState;

        if (typeof setMobileMenu === "function") {
            setMobileMenu(resolvedState);
            return;
        }

        setInternalMobileMenu(resolvedState);
    };

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Routes", href: "/routes" },
        { name: "Services", href: "/services" },
        { name: "Testimonials", href: "/testimonials" },
        { name: "Contact", href: "/contact" },
    ];

    const getRoleRedirectPath = (user) => {
        const role = String(user?.role || "").toLowerCase();

        if (role === "admin") return "/admin";
        if (role === "staff") return "/staff";
        return "/user";
    };

    // =========================
    // INIT GOOGLE LOGIN
    // =========================
    useEffect(() => {
        const interval = setInterval(() => {
            if (window.google?.accounts?.id) {
                setGoogleReady(true);
                clearInterval(interval);
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);

    // =========================
    // HANDLE GOOGLE LOGIN SUCCESS
    // =========================
    const handleGoogleCredential = async (response) => {
        try {
            const credential = response?.credential;

            if (!credential) {
                throw new Error("Google credential not received");
            }

            const apiResponse = await fetch("/api/auth/google-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ credential }),
            });

            const data = await apiResponse.json();

            if (!apiResponse.ok || !data.success) {
                throw new Error(data.message || "Google login failed");
            }

            const { accessToken, refreshToken, user } = data.data;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("user", JSON.stringify(user));

            const redirectPath = getRoleRedirectPath(user);
            router.push(redirectPath);
            showAppToast("success", "Logged in with Google successfully");
        } catch (error) {
            console.error("Google login error:", error);
            showAppToast("error", error.message || "Failed to login with Google");
        }
    };

    // =========================
    // START GOOGLE LOGIN
    // =========================
    const startGoogleLogin = () => {
        try {
            if (!window.google?.accounts?.id) {
                showAppToast(
                    "error",
                    "Google login is not ready yet. Please try again."
                );
                return;
            }

            if (window.__gsiPromptInProgress) {
                showAppToast(
                    "error",
                    "Google sign-in is already in progress. Please close it or try again in a moment."
                );
                return;
            }

            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                callback: handleGoogleCredential,
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            // Shows Google account chooser / one tap prompt
            window.__gsiPromptInProgress = true;
            window.google.accounts.id.prompt((notification) => {
                window.__gsiPromptInProgress = false;

                // If prompt not shown or skipped (e.g. FedCM blocked), fallback to normal login
                if (
                    notification.isNotDisplayed?.() ||
                    notification.isSkippedMoment?.()
                ) {
                    const errorMessage =
                        "Google sign-in is blocked or cancelled in your browser. Redirecting to normal login.";
                    showAppToast("error", errorMessage);
                    router.push("/login");
                }
            });
        } catch (error) {
            console.error("Start Google login error:", error);
            showAppToast("error", "Problem starting Google login. Opening login page.");
            router.push("/login");
        }
    };

    // =========================
    // BOOK NOW CLICK
    // =========================
    const handleBookNow = () => {
        try {
            const storedUser = localStorage.getItem("user");
            const accessToken = localStorage.getItem("accessToken");

            if (storedUser && accessToken) {
                const user = JSON.parse(storedUser);
                const redirectPath = getRoleRedirectPath(user);
                router.push(redirectPath);
                return;
            }

            // Not logged in -> start Google login directly
            if (googleReady) {
                startGoogleLogin();
            } else {
                router.push("/login");
            }
        } catch (error) {
            console.error("Book Now error:", error);
            router.push("/login");
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
                ? "bg-[#0A4F4D]/96 shadow-2xl border-b border-white/10 backdrop-blur-xl"
                : "bg-[#0A4F4D]/96 backdrop-blur-md border-b border-white/5"
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
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;

                            return (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className={`relative group pb-2 transition duration-300 ${isActive ? "text-[#E8A317]" : "hover:text-[#E8A317]"
                                        }`}
                                >
                                    {link.name}

                                    <span
                                        className={`absolute left-0 -bottom-0.5 h-[2.5px] rounded-full bg-[#E8A317] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                                            }`}
                                    />
                                </a>
                            );
                        })}
                    </nav>

                    {/* RIGHT SIDE */}
                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href="tel:+918888157744"
                            className="hidden xl:flex items-center gap-2 text-white/90 text-sm"
                        >
                            <FaPhoneAlt className="text-[#E8A317]" />
                            +91 88881 57744
                        </a>

                        <button
                            onClick={handleBookNow}
                            className="bg-[#E8A317] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full font-semibold hover:bg-[#D48F0C] hover:scale-105 transition shadow-lg"
                        >
                            Book Now
                        </button>
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button
                        className="lg:hidden text-white text-xl sm:text-2xl"
                        onClick={() => updateMobileMenu(!isMobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* MOBILE MENU */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden pb-4">
                        <div className="bg-white rounded-3xl p-4 space-y-3 shadow-2xl border border-[#F2E7C9]">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;

                                return (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => updateMobileMenu(false)}
                                        className={`block font-medium transition relative w-fit ${isActive
                                            ? "text-[#0E6B68] after:w-full"
                                            : "text-[#16302B] hover:text-[#0E6B68] after:w-0 hover:after:w-full"
                                            } after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-[#E8A317] after:rounded-full after:transition-all after:duration-300`}
                                    >
                                        {link.name}
                                    </a>
                                );
                            })}

                            <button
                                onClick={() => {
                                    updateMobileMenu(false);
                                    handleBookNow();
                                }}
                                className="w-full bg-[#E8A317] text-[#16302B] py-3 rounded-full font-bold mt-2 hover:bg-[#D48F0C] transition"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}