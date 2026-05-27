"use client";

import { getSeatRows } from "@/components/SeatLayout";

/* =========================================================
   SAFE HTML
========================================================= */
function safeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* =========================================================
   BUILD PRINT TEMPLATE
========================================================= */
export function buildSeatTemplate({
  selectedBus = {},
  date = "",
  seatMap = {},
  layout = 39,
}) {

  const rows = getSeatRows(Number(layout || 39));

  /* =========================================================
     SINGLE SEAT
  ========================================================= */
  const renderSeat = (seatNo) => {

    const data = seatMap[String(seatNo)] || {};

    return `
        <div class="seat-box">

            <div class="seat-top">

                <div class="seat-no">
                    ${safeHtml(seatNo)}
                </div>

                <div class="ticket">
                    ${safeHtml(data.ticket || "")}
                </div>

            </div>

            <div class="line">
                <span class="label">नाव :</span>
                <span class="value">
                    ${safeHtml(data.name || "")}
                </span>
            </div>

            <div class="line">
                <span class="label">मोबाईल :</span>
                <span class="value">
                    ${safeHtml(data.phone || "")}
                </span>
            </div>

            <div class="line">
                <span class="label">पिकअप :</span>
                <span class="value">
                    ${safeHtml(data.pickup || "")}
                </span>
            </div>

            <div class="line">
                <span class="label">ड्रॉप :</span>
                <span class="value">
                    ${safeHtml(data.drop || "")}
                </span>
            </div>

        </div>
        `;
  };

  /* =========================================================
     ROWS
  ========================================================= */
  const renderRow = (row) => {

    /* BOTTOM ROW */
    if (row.onlyBottom && row.bottom) {

      return `
            <div class="bottom-row">

                ${row.bottom.map((seat) => `
                    <div class="seat-wrap">
                        ${renderSeat(seat)}
                    </div>
                `).join("")}

            </div>
            `;
    }

    return `
        <div class="seat-row">

            <!-- LEFT -->
            <div class="left">

                ${Array.isArray(row.left)
        ? row.left.map((seat) => `
                            <div class="seat-wrap">
                                ${renderSeat(seat)}
                            </div>
                        `).join("")
        : row.left
          ? `
                                <div class="seat-wrap">
                                    ${renderSeat(row.left)}
                                </div>
                            `
          : ""
      }

            </div>

            <!-- CENTER -->
            <div class="center-gap">

                ${row.center
        ? renderSeat(row.center)
        : ""
      }

            </div>

            <!-- RIGHT -->
            <div class="right">

                ${Array.isArray(row.right)
        ? row.right.map((seat) => `
                            <div class="seat-wrap">
                                ${renderSeat(seat)}
                            </div>
                        `).join("")
        : row.right
          ? `
                                <div class="seat-wrap">
                                    ${renderSeat(row.right)}
                                </div>
                            `
          : ""
      }

            </div>

        </div>
        `;
  };

  const layoutHtml = rows.map(renderRow).join("");

  /* =========================================================
     FINAL HTML
  ========================================================= */
  return `
<!DOCTYPE html>
<html>

<head>

<meta charset="utf-8" />

<title>
श्री मोरया टुर्स अँड ट्रॅव्हल्स
</title>

<style>

*{
    box-sizing:border-box;
}

body{
    margin:0;
    padding:6mm;
    background:#fffaf5;
    font-family:"Nirmala UI","Mangal",sans-serif;
    color:#8b1e1e;
}

/* HEADER */
.header{
    border:2px solid #8b1e1e;
    padding:8px;
    margin-bottom:8px;
}

.company{
    text-align:center;
    font-size:34px;
    font-weight:900;
    margin-bottom:6px;
}

.top-line{
    display:flex;
    justify-content:space-between;
    font-size:14px;
    font-weight:700;
}

/* LAYOUT */
.layout{
    display:flex;
    flex-direction:column;
    gap:0;
}

/* ROW */
.seat-row{
    display:grid;
    grid-template-columns:1fr 90px 1fr;
    align-items:flex-start;
    margin-bottom:0;
}

.left{
    display:flex;
    gap:0;
}

.right{
    display:flex;
    justify-content:flex-end;
    gap:0;
}

.center-gap{
    display:flex;
    justify-content:center;
}

/* BOTTOM */
.bottom-row{
    display:flex;
    justify-content:center;
    gap:0;
    margin-top:0;
}

/* SEAT */
.seat-wrap{
    width:52mm;
}

.seat-box{
    border:1.5px solid #8b1e1e;
    min-height:43mm;
    padding:2mm;
    background:#fffaf5;
}

/* TOP */
.seat-top{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:3px;
}

/* NUMBER */
.seat-no{
    width:24px;
    height:24px;
    border-radius:50%;
    border:1.5px solid #8b1e1e;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:12px;
    font-weight:800;
}

/* TICKET */
.ticket{
    font-size:11px;
    font-weight:700;
}

/* LINES */
.line{
    margin-bottom:4px;
    font-size:12px;
    line-height:1.3;
}

.label{
    font-weight:800;
}

.value{
    font-weight:500;
}

@media print{

    body{
        padding:4mm;
    }

}

</style>

</head>

<body>

<!-- HEADER -->
<div class="header">

    <div class="company">
        श्री मोरया टुर्स अँड ट्रॅव्हल्स
    </div>

    <div class="top-line">

        <div>
            तारीख :
            ${safeHtml(date)}
        </div>

        <div>
            बस :
            ${safeHtml(selectedBus?.busNumber || "")}
        </div>

        <div>
            मार्ग :
            ${safeHtml(selectedBus?.routeName || "")}
        </div>

    </div>

</div>

<!-- LAYOUT -->
<div class="layout">

    ${layoutHtml}

</div>

</body>
</html>
`;
}

/* =========================================================
   COMPONENT
========================================================= */
export default function PrintSeatTemplateModal({
  open = false,
  onClose = () => { },
  selectedBus = {},
  date = "",
  // optional: either pass a pre-built seatMap or pass bookings array
  seatMap = {},
  bookings = null,
  // optional seatLayout prop name used by parent
  seatLayout = null,
  layout = 39,
}) {

  if (!open) return null;

  /* =========================================================
     PRINT
  ========================================================= */
  const handlePrint = () => {

    try {

      // compute seatMap from bookings if provided
      let useSeatMap = seatMap || {};
      if (Array.isArray(bookings) && bookings.length > 0) {
        useSeatMap = {};
        bookings.forEach((b) => {
          // try to read seats from b.seats or b.seatItems
          const items = Array.isArray(b.seatItems)
            ? b.seatItems
            : Array.isArray(b.seats)
              ? b.seats.map((s) => ({ seatNo: s, ticketNo: `${b.bookingCode || "BOOK"}-${s}`, name: b.customerName || "" }))
              : [];

          items.forEach((it) => {
            const seatNo = String(it.seatNo || it.seat || "");
            if (!seatNo) return;
            useSeatMap[seatNo] = {
              ticket: it.ticketNo || it.ticket || "",
              name: it.name || it.passengerName || "",
              phone: b.customerPhone || b.customerMobile || "",
              pickup: b.pickup || "",
              drop: b.drop || "",
            };
          });
        });
      }

      const html = buildSeatTemplate({
        selectedBus,
        date,
        seatMap: useSeatMap,
        layout: Number(seatLayout || layout || 39),
      });

      const printWindow = window.open(
        "",
        "_blank",
        "width=1200,height=900"
      );

      if (!printWindow) {
        alert("Allow Popup");
        return;
      }

      printWindow.document.open();

      printWindow.document.write(html);

      printWindow.document.close();

      // leave the generated template open in the new tab for preview
      printWindow.focus();

    } catch (err) {

      console.error(err);

      alert("Print Failed");
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 700,
          background: "#fff",
          borderRadius: 12,
          padding: 20,
        }}
      >

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >

          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#8b1e1e",
            }}
          >
            श्री मोरया
          </div>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            ✕
          </button>

        </div>

        {/* INFO */}
        <div
          style={{
            marginBottom: 16,
            color: "#444",
            fontSize: 14,
          }}
        >
          Print Marathi seat paper layout
        </div>

        {/* BUTTON */}
        <button
          onClick={handlePrint}
          style={{
            background: "#8b1e1e",
            color: "#fff",
            border: "none",
            padding: "12px 18px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Print Template
        </button>

      </div>

    </div>
  );
}