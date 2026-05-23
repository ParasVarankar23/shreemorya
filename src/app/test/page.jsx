"use client";

import React, { useState } from "react";

import PrintSeatTemplateModal from "@/components/admin/booking/PrintSeatTemplateModal";

export default function Page() {

    const [open, setOpen] = useState(true);

    /* =========================================================
       CHANGE LAYOUT HERE
       21 / 32 / 35 / 39
    ========================================================= */
    const [layout, setLayout] = useState(39);

    const selectedBus = {
        busNumber: "MH-06-7777",
        routeName: "Panvel To Borli",
    };

    const date = "23/05/2026";

    return (
        <div
            style={{
                padding: 30,
            }}
        >

            {/* =====================================================
                BUTTONS
            ===================================================== */}
            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 20,
                    flexWrap: "wrap",
                }}
            >

                <button
                    onClick={() => {
                        setLayout(21);
                        setOpen(true);
                    }}
                    style={btnStyle}
                >
                    21 Seat
                </button>

                <button
                    onClick={() => {
                        setLayout(32);
                        setOpen(true);
                    }}
                    style={btnStyle}
                >
                    32 Seat
                </button>

                <button
                    onClick={() => {
                        setLayout(35);
                        setOpen(true);
                    }}
                    style={btnStyle}
                >
                    35 Seat
                </button>

                <button
                    onClick={() => {
                        setLayout(39);
                        setOpen(true);
                    }}
                    style={btnStyle}
                >
                    39 Seat
                </button>

            </div>

            {/* =====================================================
                CURRENT LAYOUT
            ===================================================== */}
            <div
                style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#8b1e1e",
                    marginBottom: 20,
                }}
            >
                Current Layout : {layout}
            </div>

            {/* =====================================================
                MODAL
            ===================================================== */}
            <PrintSeatTemplateModal
                open={open}
                onClose={() => setOpen(false)}
                selectedBus={selectedBus}
                date={date}
                layout={layout}
                seatMap={{

                    "1": {
                        name: "Paras",
                        phone: "9876543210",
                        pickup: "Panvel",
                        drop: "Borli"
                    },

                    "2": {
                        name: "Rohit",
                        phone: "9999999999",
                        pickup: "Panvel",
                        drop: "Shrivardhan"
                    },

                    "3": {
                        name: "Sanket",
                        phone: "8888888888",
                        pickup: "Pen",
                        drop: "Borli"
                    },

                    "4": {
                        name: "Amit",
                        phone: "7777777777",
                        pickup: "Panvel",
                        drop: "Dighi"
                    },

                    "5": {
                        name: "Pratik",
                        phone: "6666666666",
                        pickup: "Mangaon",
                        drop: "Borli"
                    },

                    "6": {
                        name: "Kunal",
                        phone: "9999991234",
                        pickup: "Panvel",
                        drop: "Shrivardhan"
                    },

                    "7": {
                        name: "Ramesh",
                        phone: "8888811111",
                        pickup: "Pen",
                        drop: "Borli"
                    },

                    "8": {
                        name: "Suresh",
                        phone: "7777711111",
                        pickup: "Nagothane",
                        drop: "Dighi"
                    },

                    "9": {
                        name: "Mahesh",
                        phone: "6666611111",
                        pickup: "Panvel",
                        drop: "Borli"
                    }

                }}
            />

        </div>
    );
}

/* =========================================================
   BUTTON STYLE
========================================================= */
const btnStyle = {
    padding: "12px 18px",
    border: "none",
    borderRadius: 8,
    background: "#8b1e1e",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
};