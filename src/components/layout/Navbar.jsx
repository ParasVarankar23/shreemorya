import React from 'react'
import Link from 'next/link';
export default function Navbar() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <Link href="#home" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/30">
                        <FaBus className="text-lg" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white md:text-xl">Morya Travels</h1>
                        <p className="text-xs text-slate-300">Safe • Fast • Trusted</p>
                    </div>
                </Link>

                <nav className="hidden items-center gap-8 lg:flex">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-slate-200 transition hover:text-teal-400"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        href="https://wa.me/919309940782"
                        className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 md:inline-flex"
                    >
                        Contact Us
                    </Link>
                    <Link
                        href="#booking"
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-600"
                    >
                        Book Now <FaArrowRight className="text-xs" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
