"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, MapPin, Search, X } from "lucide-react";

export default function StopSearchDropdown({
    label,
    placeholder = "Select stop",
    value,
    onChange,
    options = [],
    loading = false,
    excludeValue = "",
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [open]);

    const filteredOptions = useMemo(() => {
        const q = search.trim().toLowerCase();

        return options.filter((item) => {
            if (!item) return false;

            const itemValue = item?.value ?? item?._id ?? item?.id ?? item?.name ?? "";
            const itemLabel = item?.label ?? item?.name ?? "";

            if (excludeValue && itemValue === excludeValue) return false;
            if (!q) return true;

            return itemLabel.toLowerCase().includes(q);
        });
    }, [options, search, excludeValue]);

    const displayText = value?.label || "";

    return (
        <div ref={wrapperRef} className="relative w-full">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex h-14 w-full items-center justify-between rounded-[22px] border border-slate-300 bg-white px-4 text-left outline-none transition-all duration-200 hover:border-[#0B5D5A]/40 focus:border-[#0B5D5A] focus:ring-4 focus:ring-[#0B5D5A]/10"
            >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                    <span
                        className={`block min-w-0 flex-1 truncate text-base font-medium ${displayText ? "text-slate-800" : "text-slate-400"
                            }`}
                    >
                        {displayText || placeholder}
                    </span>
                </div>

                <ChevronDown
                    className={`ml-2 h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_36px_rgba(15,23,42,0.12)]">
                    {/* Search box */}
                    <div className="border-b border-slate-100 p-3">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={`Search ${label} point`}
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#0B5D5A] focus:bg-white focus:ring-4 focus:ring-[#0B5D5A]/10"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="max-h-64 overflow-y-auto p-2">
                        {loading ? (
                            <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading stops...
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-slate-500">
                                No stops found
                            </div>
                        ) : (
                            filteredOptions.map((item, index) => {
                                const itemValue =
                                    item?.value ?? item?._id ?? item?.id ?? item?.name ?? "";
                                const itemLabel = item?.label ?? item?.name ?? "";
                                const isSelected = value?.value === itemValue;

                                return (
                                    <button
                                        key={`${itemValue}-${index}`}
                                        type="button"
                                        onClick={() => {
                                            onChange({
                                                value: itemValue,
                                                label: itemLabel,
                                            });
                                            setSearch("");
                                            setOpen(false);
                                        }}
                                        className={`flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left transition-all duration-150 ${isSelected
                                                ? "bg-[#0B5D5A]/10 text-[#0B5D5A]"
                                                : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                    >
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        <span className="truncate text-sm font-medium">
                                            {itemLabel}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}