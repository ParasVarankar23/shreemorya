"use client";

/* eslint-disable react/prop-types */

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AppToaster from "@/components/layout/AppToaster";
import CookieConsent from "@/components/layout/CookieConsent";

// Dashboard components
import DashboardNavbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";

// Public website components
import PublicNavbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { AutoRefreshProvider } from "@/context/AutoRefreshContext";

const publicShellRoutes = new Set([
    "/",
    "/about",
    "/contact",
    "/forgot-password",
    "/login",
    "/offices",
    "/owner",
    "/privacy",
    "/routes",
    "/schedule",
    "/services",
    "/signup",
    "/terms",
    "/testimonials",
]);

const commonDashboardRoutes = new Set([
    "/profile",
    "/settings",
    "/notifications",
]);

function decodeJwtPayload(token) {
    try {
        const parts = String(token || "").split(".");
        if (parts.length !== 3) return null;

        const base64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            "="
        );

        const decoded =
            typeof window !== "undefined"
                ? window.atob(padded)
                : Buffer.from(padded, "base64").toString("binary");

        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

function normalizeRole(role) {
    const value = String(role || "").trim().toLowerCase();

    if (value === "admin") return "admin";
    if (value === "staff") return "staff";
    if (value === "user") return "user";
    if (value === "guest") return "guest";

    return "guest";
}

function getPortalMetaFromPath(pathname) {
    if (pathname?.startsWith("/admin")) {
        return { roleKey: "admin", roleLabel: "Admin" };
    }

    if (pathname?.startsWith("/staff")) {
        return { roleKey: "staff", roleLabel: "Staff" };
    }

    if (pathname?.startsWith("/user")) {
        return { roleKey: "user", roleLabel: "User" };
    }

    if (pathname?.startsWith("/guest")) {
        return { roleKey: "guest", roleLabel: "Guest" };
    }

    return null;
}

function getRoleLabel(roleKey) {
    if (roleKey === "admin") return "Admin";
    if (roleKey === "staff") return "Staff";
    if (roleKey === "user") return "User";
    return "Guest";
}

export default function ClientLayout({ children }) {
    const pathname = usePathname();

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [tokenRole, setTokenRole] = useState(null);
    const [tokenReady, setTokenReady] = useState(false);

    useEffect(() => {
        function resolveRoleFromToken() {
            try {
                const accessToken = localStorage.getItem("accessToken") || "";
                const payload = decodeJwtPayload(accessToken);
                const normalized = normalizeRole(payload?.role);

                setTokenRole(normalized);
            } catch {
                setTokenRole("guest");
            } finally {
                setTokenReady(true);
            }
        }

        resolveRoleFromToken();
    }, []);

    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileSidebarOpen]);

    const pathPortalMeta = useMemo(
        () => getPortalMetaFromPath(pathname),
        [pathname]
    );

    const isCommonDashboardRoute = commonDashboardRoutes.has(pathname || "");
    const showPublicShell = publicShellRoutes.has(pathname || "");

    const effectivePortalMeta = useMemo(() => {
        // 1) Direct role path-based routes
        if (pathPortalMeta) return pathPortalMeta;

        // 2) Common dashboard routes (/profile, /settings, /notifications)
        if (isCommonDashboardRoute && tokenRole) {
            return {
                roleKey: tokenRole,
                roleLabel: getRoleLabel(tokenRole),
            };
        }

        return null;
    }, [pathPortalMeta, isCommonDashboardRoute, tokenRole]);

    // Prevent dashboard flash for common routes until token role is ready
    if (isCommonDashboardRoute && !tokenReady) {
        return (
            <AutoRefreshProvider>
                <div className="min-h-screen bg-[#f7f7f7] text-gray-900">
                    <AppToaster />

                    <div className="flex min-h-screen items-center justify-center">
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
                            Loading dashboard...
                        </div>
                    </div>

                    <CookieConsent />
                </div>
            </AutoRefreshProvider>
        );
    }

    // DASHBOARD SHELL
    if (effectivePortalMeta) {
        return (
            <AutoRefreshProvider>
                <div className="min-h-screen bg-[#f7f7f7] text-gray-900">
                    <AppToaster />

                    <div className="flex min-h-screen">
                        <Sidebar
                            role={effectivePortalMeta.roleKey}
                            isMobileOpen={isMobileSidebarOpen}
                            onClose={() => setIsMobileSidebarOpen(false)}
                        />

                        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                            <DashboardNavbar
                                role={effectivePortalMeta.roleLabel}
                                onMenuClick={() => setIsMobileSidebarOpen(true)}
                            />

                            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                                {children}
                            </main>
                        </div>
                    </div>

                    <CookieConsent />
                </div>
            </AutoRefreshProvider>
        );
    }

    // NO SHELL (for special pages not in public shell or dashboard shell)
    if (!showPublicShell) {
        return (
            <AutoRefreshProvider>
                <div className="min-h-screen bg-[#f7f7f7] text-gray-900">
                    <AppToaster />
                    {children}
                    <CookieConsent />
                </div>
            </AutoRefreshProvider>
        );
    }

    // PUBLIC SHELL
    return (
        <AutoRefreshProvider>
            <div className="min-h-screen bg-[#f7f7f7] text-gray-900">
                <AppToaster />

                <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col bg-white shadow-sm">
                    {/* Public Navbar */}
                    <PublicNavbar />

                    {/* Public Page Content */}
                    <main className="min-w-0 flex-1 pt-[20px] sm:pt-[96px] lg:pt-[20px]">
                        {children}
                    </main>

                    {/* Public Footer */}
                    <Footer />
                </div>

                <CookieConsent />
            </div>
        </AutoRefreshProvider>
    );
}