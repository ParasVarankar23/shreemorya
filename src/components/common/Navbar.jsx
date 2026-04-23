"use client";

/* eslint-disable react/prop-types */

import { showAppToast } from "@/lib/toast";
import {
    Bell,
    ChevronDown,
    LogOut,
    Menu,
    Search,
    Settings,
    User,
    X
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function DashboardNavbar({
    role = "User",
    onMenuClick = () => { },
}) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const [fullName, setFullName] = useState("");
    const [profileImage, setProfileImage] = useState("");

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoutCountdown, setLogoutCountdown] = useState(8);

    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [notifCount, setNotifCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    const [recentNotifs, setRecentNotifs] = useState([]);

    const profileMenuRef = useRef(null);
    const notifMenuRef = useRef(null);

    const getAccessToken = () => {
        try {
            return localStorage.getItem("accessToken") || "";
        } catch {
            return "";
        }
    };

    const getRefreshToken = () => {
        try {
            return localStorage.getItem("refreshToken") || "";
        } catch {
            return "";
        }
    };

    const setAccessToken = (token) => {
        try {
            localStorage.setItem("accessToken", token);
        } catch {
            // ignore
        }
    };

    const getStoredUser = () => {
        try {
            const rawUser = localStorage.getItem("user");

            if (!rawUser) return null;

            return JSON.parse(rawUser);
        } catch {
            return null;
        }
    };

    async function refreshAccessToken() {
        try {
            const refreshToken = getRefreshToken();

            if (!refreshToken) return null;

            const res = await fetch("/api/auth/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.accessToken) {
                return null;
            }

            setAccessToken(data.accessToken);
            return data.accessToken;
        } catch {
            return null;
        }
    }

    async function fetchWithAutoRefresh(url, options = {}) {
        let token = getAccessToken();

        const doFetch = async (accessToken) => {
            const headers = new Headers(options.headers || undefined);

            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
            }

            return fetch(url, {
                ...options,
                headers,
            });
        };

        let res = await doFetch(token);

        if (res.status === 401) {
            const newToken = await refreshAccessToken();

            if (newToken) {
                res = await doFetch(newToken);
            }
        }

        return res;
    }

    const handleSearch = (q) => {
        const s = String(q || "").trim().toLowerCase();
        if (!s) return;

        if (s.includes("booking")) {
            if (role && (String(role).toLowerCase() === "admin" || String(role).toLowerCase() === "owner")) {
                try { router.push("/admin/booking"); } catch { window.location.href = "/admin/booking"; }
            } else {
                try { router.push("/user/booking"); } catch { window.location.href = "/user/booking"; }
            }
            return;
        }

        if (s.includes("profile")) {
            try { router.push("/profile"); } catch { window.location.href = "/profile"; }
            return;
        }

        if (s.includes("notification") || s.includes("notifications")) {
            try { router.push("/notifications"); } catch { window.location.href = "/notifications"; }
            return;
        }

        if (s.includes("payment") || s.includes("payments") || s.includes("pay")) {
            const rl = String(role || "").toLowerCase();
            if (rl === "admin" || rl === "owner") {
                try { router.push("/admin/payment"); } catch { window.location.href = "/admin/payment"; }
            } else if (rl === "staff") {
                try { router.push("/staff-portal/payment"); } catch { window.location.href = "/staff-portal/payment"; }
            } else {
                try { router.push("/user/payment"); } catch { window.location.href = "/user/payment"; }
            }
            return;
        }

        if (s.includes("staff") || s.includes("staffs") || s.includes("team")) {
            try { router.push("/admin/staff"); } catch { window.location.href = "/admin/staff"; }
            return;
        }

        if (s.includes("setting") || s.includes("settings")) {
            try { router.push("/settings"); } catch { window.location.href = "/settings"; }
            return;
        }

        if (s.includes("forgot") || s.includes("forgot-password") || s.includes("reset password")) {
            try { router.push("/forgot-password"); } catch { window.location.href = "/forgot-password"; }
            return;
        }

        showAppToast("info", "No matching page found for your search");
    };

    useEffect(() => {
        let active = true;

        const storedUser = getStoredUser();

        if (storedUser) {
            setFullName(String(storedUser.fullName || storedUser.name || "").trim());
            setProfileImage(String(storedUser.profileImage || storedUser.photoUrl || "").trim());
        }

        async function loadProfile() {
            try {
                const res = await fetchWithAutoRefresh("/api/auth/profile", {
                    method: "GET",
                    cache: "no-store",
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) return;

                const p = data?.user || data?.profile || {};

                if (active) {
                    setFullName(String(p.fullName || p.name || storedUser?.fullName || storedUser?.name || "").trim());
                    setProfileImage(String(p.profileImage || p.photoUrl || storedUser?.profileImage || storedUser?.photoUrl || "").trim());
                }
            } catch {
                // ignore
            }
        }

        loadProfile();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!showLogoutModal) return undefined;

        setLogoutCountdown(8);

        const intervalId = setInterval(() => {
            setLogoutCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    void performLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [showLogoutModal]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)
            ) {
                setShowProfileMenu(false);
            }

            if (
                notifMenuRef.current &&
                !notifMenuRef.current.contains(event.target)
            ) {
                setNotifOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        let mounted = true;

        async function loadCount() {
            try {
                const res = await fetchWithAutoRefresh("/api/auth/notifications", {
                    method: "GET",
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok || !mounted) return;

                const list = data.notifications || [];
                const unread = list.filter((n) => !n.read).length;
                setNotifCount(unread);
            } catch {
                // ignore
            }
        }

        loadCount();
        const id = setInterval(loadCount, 30000);

        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, []);

    async function loadRecent() {
        try {
            const res = await fetchWithAutoRefresh("/api/auth/notifications", {
                method: "GET",
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) return;

            const list = data.notifications || [];
            setRecentNotifs(list.slice(0, 5));
        } catch {
            // ignore
        }
    }

    async function toggleNotifications() {
        const next = !notifOpen;
        setNotifOpen(next);

        if (next) {
            await loadRecent();
        }
    }

    async function markAsRead(notification) {
        try {
            const res = await fetchWithAutoRefresh("/api/auth/notifications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: notification.id,
                    read: true,
                }),
            });

            if (!res.ok) return;

            setRecentNotifs((prev) =>
                prev.map((x) =>
                    x.id === notification.id ? { ...x, read: true } : x
                )
            );

            if (!notification.read) {
                setNotifCount((c) => Math.max(0, c - 1));
            }
        } catch {
            // ignore
        }
    }

    async function performLogout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });

            try {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            } catch { }

            try {
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("refreshToken");
            } catch { }

            try {
                document.cookie =
                    "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                document.cookie =
                    "refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            } catch { }

            showAppToast("success", "Logged out successfully.");
        } catch {
            try {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            } catch { }

            showAppToast(
                "warning",
                "Logged out locally. Server logout may have failed."
            );
        } finally {
            setShowLogoutModal(false);
            setShowProfileMenu(false);
            setNotifOpen(false);

            try {
                router.replace("/login");
            } catch { }

            try {
                if (typeof window !== "undefined") {
                    window.location.replace("/login");
                }
            } catch {
                try {
                    window.location.href = "/login";
                } catch { }
            }
        }
    }

    function handleLogout() {
        setShowProfileMenu(false);
        setShowLogoutModal(true);
    }

    function handleViewProfile() {
        setShowProfileMenu(false);
        router.push("/profile");
    }

    function handleSettings() {
        setShowProfileMenu(false);
        router.push("/settings");
    }

    function formatNotifDate(date) {
        if (!date) return "";
        const d = new Date(date);

        return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    return (
        <>
            {/* LOGOUT MODAL */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-5 shadow-2xl sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#F4B31A]">
                                    Morya Travels
                                </p>
                                <h3 className="mt-1 text-lg font-bold text-[#12312F]">
                                    Confirm Logout
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    You will be logged out automatically in{" "}
                                    {logoutCountdown > 0
                                        ? `${logoutCountdown} seconds`
                                        : "..."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#0B5D5A]/30 hover:text-[#0B5D5A]"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F4B31A]/15">
                            <div
                                className="h-full rounded-full bg-[#F4B31A] transition-all duration-1000"
                                style={{ width: `${(logoutCountdown / 8) * 100}%` }}
                            />
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                Stay Logged In
                            </button>

                            <button
                                type="button"
                                onClick={() => void performLogout()}
                                className="rounded-2xl bg-[#F4B31A] px-4 py-2.5 text-sm font-semibold text-[#12312F] shadow-md shadow-[#F4B31A]/25 transition hover:bg-[#FFD166]"
                            >
                                Logout Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVBAR */}
            <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-[#0B5D5A] via-[#0D6663] to-[#0E6F6B] shadow-lg backdrop-blur-sm">
                <div className="px-3 py-3 sm:px-5 lg:px-6">
                    <div className="flex flex-col gap-3">
                        {/* TOP ROW */}
                        <div className="flex items-center justify-between gap-3">
                            {/* LEFT */}
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={onMenuClick}
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-sm transition hover:border-[#F4B31A]/40 hover:text-[#F4B31A] lg:hidden"
                                    aria-label="Open sidebar"
                                >
                                    <Menu size={18} />
                                </button>

                                <div className="min-w-0">
                                    <p className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F4B31A] sm:block">
                                        Morya Travels
                                    </p>

                                    <p className="truncate text-sm font-medium text-white/80 sm:mt-1 sm:text-base">
                                        Welcome back,{" "}
                                        <span className="font-semibold text-white">
                                            {fullName || "User"}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* CENTER */}
                            <div className="flex flex-1 items-center justify-center">
                                <div className="hidden w-full max-w-[640px] xl:block">
                                    <div className="mx-auto flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 transition focus-within:border-[#F4B31A]/50 focus-within:bg-white/15 focus-within:ring-4 focus-within:ring-[#F4B31A]/10">
                                        <input
                                            type="text"
                                            placeholder="Search pages (e.g. booking, payments, profile, settings)"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleSearch(searchQuery);
                                                }
                                            }}
                                            className="w-full min-w-[220px] bg-transparent text-sm text-white placeholder:text-white/60 outline-none xl:min-w-[280px]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleSearch(searchQuery)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded bg-transparent text-white/70 transition hover:text-[#F4B31A]"
                                            aria-label="Search"
                                        >
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                {/* Notification Bell */}
                                <div className="relative" ref={notifMenuRef}>
                                    <button
                                        type="button"
                                        onClick={toggleNotifications}
                                        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-sm transition hover:border-[#F4B31A]/40 hover:text-[#F4B31A]"
                                    >
                                        <Bell size={18} />
                                        {notifCount > 0 && (
                                            <span className="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#F4B31A] px-1 text-[11px] font-bold text-[#12312F]">
                                                {notifCount > 9 ? "9+" : notifCount}
                                            </span>
                                        )}
                                    </button>

                                    {notifOpen && (
                                        <div className="absolute right-0 z-50 mt-3 w-[320px] overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
                                            <div className="border-b border-slate-100 px-4 py-3">
                                                <p className="text-sm font-bold text-[#12312F]">
                                                    Notifications
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Recent updates from Morya Travels
                                                </p>
                                            </div>

                                            <div className="max-h-[360px] overflow-y-auto">
                                                {recentNotifs.length === 0 ? (
                                                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                                                        No notifications found
                                                    </div>
                                                ) : (
                                                    recentNotifs.map((notification) => (
                                                        <button
                                                            key={notification.id}
                                                            type="button"
                                                            onClick={() => markAsRead(notification)}
                                                            className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${!notification.read ? "bg-[#F4B31A]/5" : "bg-white"
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-semibold text-slate-800">
                                                                        {notification.title}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                        {notification.message}
                                                                    </p>
                                                                    <p className="mt-2 text-[11px] text-slate-400">
                                                                        {formatNotifDate(notification.createdAt)}
                                                                    </p>
                                                                </div>

                                                                {!notification.read && (
                                                                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#F4B31A]" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>

                                            <div className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setNotifOpen(false);
                                                        router.push("/notifications");
                                                    }}
                                                    className="w-full rounded-2xl bg-[#0B5D5A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0D6663]"
                                                >
                                                    View All Notifications
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={profileMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setShowProfileMenu((prev) => !prev)}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2 py-2 shadow-sm transition hover:border-[#F4B31A]/40 sm:gap-3 sm:px-3"
                                    >
                                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F4B31A] text-[#12312F] shadow-md shadow-[#F4B31A]/25 sm:h-11 sm:w-11">
                                            {profileImage ? (
                                                <Image
                                                    src={profileImage}
                                                    alt={fullName || "Profile"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <User size={18} className="text-[#12312F] sm:hidden" />
                                            )}

                                            {!profileImage && (
                                                <span className="hidden sm:flex">
                                                    <User size={20} className="text-[#12312F]" />
                                                </span>
                                            )}
                                        </div>

                                        <div className="hidden min-w-0 text-left md:block">
                                            <p className="max-w-[120px] truncate text-sm font-semibold text-white lg:max-w-[160px]">
                                                {fullName || "Dashboard User"}
                                            </p>
                                            <p className="text-xs text-white/70">{role}</p>
                                        </div>

                                        <ChevronDown
                                            size={16}
                                            className={`hidden text-white/70 transition md:block ${showProfileMenu ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {showProfileMenu && (
                                        <div className="absolute right-0 z-50 mt-3 w-[220px] rounded-2xl border border-white/10 bg-white p-2 shadow-2xl">
                                            <button
                                                type="button"
                                                onClick={handleViewProfile}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A]"
                                            >
                                                <User size={16} />
                                                View Profile
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleSettings}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A]"
                                            >
                                                <Settings size={16} />
                                                Settings
                                            </button>

                                            <div className="my-2 border-t border-slate-100" />

                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile / Tablet Search */}
                        <div className="block xl:hidden">
                            <div className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 transition focus-within:border-[#F4B31A]/50 focus-within:bg-white/15 focus-within:ring-4 focus-within:ring-[#F4B31A]/10">
                                <Search size={16} className="shrink-0 text-white/60" />
                                <input
                                    type="text"
                                    placeholder="Search pages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSearch(searchQuery);
                                        }
                                    }}
                                    className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}