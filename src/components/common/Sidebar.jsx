"use client";

/* eslint-disable react/prop-types */

import {
    BadgePercent,
    Bell,
    Bus,
    BusFront,
    CalendarDays,
    ChevronRight,
    LogIn,
    ReceiptText,
    Settings,
    ShieldCheck,
    Ticket,
    UserCircle2,
    UserCog,
    UserPlus,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const roleLinks = {
    admin: [
        { href: "/admin/staff", label: "Staff Access", icon: UserCog },
        { href: "/admin/bus", label: "Buses", icon: BusFront },
        { href: "/admin/schedule", label: "Schedule", icon: CalendarDays },
        { href: "/admin/booking", label: "Booking", icon: Ticket },
        { href: "/admin/vouchers", label: "Vouchers", icon: BadgePercent },
        { href: "/admin/payment", label: "Payment History", icon: ReceiptText },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/settings", label: "Settings", icon: Settings },
    ],

    staff: [
        { href: "/staff-portal/bus", label: "View Bus", icon: BusFront },
        { href: "/staff-portal/schedule", label: "Schedule", icon: CalendarDays },
        { href: "/staff-portal/booking", label: "View Booking", icon: Ticket },
        {
            href: "/staff-portal/payment",
            label: "View Payment History",
            icon: ReceiptText,
        },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/settings", label: "Settings", icon: Settings },
    ],

    user: [
        { href: "/user/booking", label: "My Booking", icon: Ticket },
        { href: "/user/payment", label: "Payment History", icon: ReceiptText },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/profile", label: "Profile", icon: UserCircle2 },
        { href: "/settings", label: "Settings", icon: Settings },
    ],

    guest: [
        { href: "/routes", label: "View Routes", icon: BusFront },
        { href: "/book-now", label: "Book Ticket", icon: Ticket },
        { href: "/login", label: "Login", icon: LogIn },
        { href: "/register", label: "Register", icon: UserPlus },
    ],
};

function decodeJwtPayload(token) {
    try {
        const parts = String(token || "").split(".");
        if (parts.length !== 3) return null;

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

        const json = atob(padded);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function isTokenExpired(token) {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
}

function normalizeRole(role) {
    const r = String(role || "").toLowerCase().trim();
    if (r === "admin") return "admin";
    if (r === "staff") return "staff";
    if (r === "user") return "user";
    if (r === "guest") return "guest";
    return "guest";
}

function formatRole(role) {
    const normalized = normalizeRole(role);
    if (normalized === "admin") return "Admin";
    if (normalized === "staff") return "Staff";
    if (normalized === "user") return "User";
    return "Guest";
}

function getRoleDescription(role) {
    const normalized = normalizeRole(role);
    if (normalized === "admin") return "Dashboard management access";
    if (normalized === "staff") return "Operational access";
    if (normalized === "user") return "Customer account access";
    return "Public booking access";
}

function SidebarContent({ role, pathname, onClose }) {
    const links = roleLinks[role] || roleLinks.guest;

    const matching = links.filter((item) => {
        if (pathname === item.href) return true;
        if (item.href !== "/" && pathname.startsWith(item.href + "/")) return true;
        return false;
    });

    const mostSpecificHref = matching.length
        ? matching.reduce((a, b) => (b.href.length > a.href.length ? b : a)).href
        : null;

    return (
        <div className="flex h-full flex-col bg-gradient-to-b from-[#0B5D5A] via-[#0D6663] to-[#0E6F6B] text-white">
            {/* Header */}
            <div className="border-b border-white/10 px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F4B31A] text-[#12312F] shadow-[0_10px_30px_rgba(244,179,26,0.35)]">
                            <Bus size={22} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold text-white">
                                Morya Travels
                            </h2>
                            <p className="truncate text-xs text-white/70">
                                Premium Bus Booking
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition-all duration-200 hover:border-[#F4B31A]/40 hover:bg-[#F4B31A]/10 hover:text-[#F4B31A] lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Role Badge */}
            <div className="px-4 pt-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                    <div className="inline-flex items-center gap-2 rounded-xl bg-[#F4B31A]/15 px-3 py-2 text-xs font-semibold text-[#FFE08A] ring-1 ring-[#F4B31A]/20">
                        <ShieldCheck size={14} />
                        {formatRole(role)} Access
                    </div>

                    <p className="mt-2 text-xs text-white/70">{getRoleDescription(role)}</p>
                </div>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <div className="mb-3 px-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                        Main Navigation
                    </p>
                </div>

                <nav className="space-y-1.5">
                    {links.map((item) => {
                        const Icon = item.icon;
                        const active = mostSpecificHref === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-300 ${active
                                        ? "bg-[#F4B31A]/12 text-[#FFE08A] ring-1 ring-[#F4B31A]/25 shadow-[0_8px_24px_rgba(244,179,26,0.08)]"
                                        : "text-white/85 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                {active && (
                                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#F4B31A]" />
                                )}

                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${active
                                            ? "bg-[#F4B31A]/18 text-[#F4B31A] ring-1 ring-[#F4B31A]/25"
                                            : "bg-white/10 text-white/80 group-hover:bg-[#F4B31A]/15 group-hover:text-[#FFE08A]"
                                        }`}
                                >
                                    <Icon size={18} />
                                </div>

                                <span className="truncate">{item.label}</span>

                                <ChevronRight
                                    size={16}
                                    className={`ml-auto transition-all duration-300 ${active
                                            ? "text-[#F4B31A]"
                                            : "text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5"
                                        }`}
                                />
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-xs text-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                    <p className="font-semibold text-white">© 2026 Morya Travels</p>
                    <p className="mt-1">Travel dashboard management system</p>
                </div>
            </div>
        </div>
    );
}

export default function Sidebar({
    role = "",
    isMobileOpen = false,
    onClose = () => { },
}) {
    const pathname = usePathname();
    const [resolvedRole, setResolvedRole] = useState("guest");
    const [isLoadingRole, setIsLoadingRole] = useState(true);

    const normalizedPropRole = useMemo(() => normalizeRole(role), [role]);

    useEffect(() => {
        let mounted = true;

        async function refreshAccessToken() {
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) return null;

                const res = await fetch("/api/auth/refresh", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refreshToken }),
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok || !data?.accessToken) return null;

                localStorage.setItem("accessToken", data.accessToken);
                return data.accessToken;
            } catch {
                return null;
            }
        }

        async function resolveRoleFromToken() {
            try {
                // 1) if parent role is valid, use it first
                if (normalizedPropRole && normalizedPropRole !== "guest") {
                    if (mounted) {
                        setResolvedRole(normalizedPropRole);
                        setIsLoadingRole(false);
                    }
                    return;
                }

                let accessToken = localStorage.getItem("accessToken") || "";

                // 2) if no access token => guest
                if (!accessToken) {
                    if (mounted) {
                        setResolvedRole("guest");
                        setIsLoadingRole(false);
                    }
                    return;
                }

                // 3) if expired => refresh using refreshToken
                if (isTokenExpired(accessToken)) {
                    const newAccessToken = await refreshAccessToken();

                    if (!newAccessToken) {
                        if (mounted) {
                            setResolvedRole("guest");
                            setIsLoadingRole(false);
                        }
                        return;
                    }

                    accessToken = newAccessToken;
                }

                // 4) resolve role from backend profile endpoint
                const profileRes = await fetch("/api/auth/profile", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    cache: "no-store",
                });

                if (!profileRes.ok) {
                    if (mounted) {
                        setResolvedRole("guest");
                        setIsLoadingRole(false);
                    }
                    return;
                }

                const profileData = await profileRes.json().catch(() => ({}));
                const roleFromProfile =
                    profileData?.user?.role || profileData?.data?.user?.role || "guest";

                if (mounted) {
                    setResolvedRole(normalizeRole(roleFromProfile));
                    setIsLoadingRole(false);
                }
            } catch {
                if (mounted) {
                    setResolvedRole("guest");
                    setIsLoadingRole(false);
                }
            }
        }

        resolveRoleFromToken();

        return () => {
            mounted = false;
        };
    }, [normalizedPropRole]);

    const finalRole = isLoadingRole ? "guest" : resolvedRole;

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-[#0B5D5A] lg:flex lg:flex-col">
                <SidebarContent
                    role={finalRole}
                    pathname={pathname}
                    onClose={() => { }}
                />
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-[70] bg-slate-950/55 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-[80] flex w-[86%] max-w-[320px] flex-col border-r border-white/10 bg-[#0B5D5A] shadow-2xl transition-transform duration-300 lg:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <SidebarContent
                    role={finalRole}
                    pathname={pathname}
                    onClose={onClose}
                />
            </aside>
        </>
    );
}