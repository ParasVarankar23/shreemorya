"use client";

function toStr(v) {
    return String(v || "");
}

function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-GB");
}

function getSeatRows(total) {
    const seatMaps = {
        21: [
            { left: [20, 21], right: null, isFront: true },
            { left: 1, right: [2, 3] },
            { left: 6, right: [5, 4] },
            { left: 7, right: [8, 9] },
            { left: 12, right: [11, 10] },
            { left: 13, right: [14, 15] },
            { bottom: [19, 18, 17, 16], onlyBottom: true },
        ],
        32: [
            { left: 32, right: null },
            { left: null, right: [1, 2] },
            { left: [6, 5], right: [4, 3] },
            { left: [7, 8], right: [9, 10] },
            { left: [14, 13], right: [12, 11] },
            { left: [15, 16], right: [17, 18] },
            { left: [22, 21], right: [20, 19] },
            { left: [23, 24], right: [25, 26] },
            { bottom: [31, 30, 29, 28, 27], onlyBottom: true },
        ],
        35: [
            { left: null, right: [1, 2] },
            { left: [6, 5], right: [4, 3] },
            { left: [7, 8], right: [9, 10] },
            { left: [14, 13], right: [12, 11] },
            { left: [15, 16], right: [17, 18] },
            { left: [22, 21], right: [20, 19] },
            { left: [23, 24], right: [25, 26] },
            { left: [30, 29], right: [28, 27] },
            { bottom: [31, 32, 33, 34, 35], onlyBottom: true },
        ],
        39: [
            { left: null, right: [1, 2] },
            { left: [6, 5], right: [4, 3] },
            { left: [7, 8], right: [9, 10] },
            { left: [14, 13], right: [12, 11] },
            { left: [15, 16], right: [17, 18] },
            { left: [22, 21], right: [20, 19] },
            { left: [23, 24], right: [25, 26] },
            { left: [30, 29], right: [28, 27] },
            { left: [31, 32], right: [33, 34] },
            { bottom: [39, 38, 37, 36, 35], onlyBottom: true },
        ],
    };

    return seatMaps[total] || seatMaps[39];
}

function buildBookedMap(bookings = []) {
    const map = {};

    bookings.forEach((booking) => {
        const seats = Array.isArray(booking?.seats) ? booking.seats : [];

        seats.forEach((seatNo) => {
            map[toStr(seatNo)] = {
                customerName: booking?.customerName || "",
                customerPhone: booking?.customerPhone || "",
                bookingCode: booking?.bookingCode || "",
                pickupName: booking?.pickupName || "",
                pickupMarathi: booking?.pickupMarathi || "",
                pickupTime: booking?.pickupTime || "",
                dropName: booking?.dropName || "",
                dropMarathi: booking?.dropMarathi || "",
                dropTime: booking?.dropTime || "",
                status:
                    booking?.bookingStatus === "CANCELLED"
                        ? "blocked"
                        : booking?.seatStatus || "booked",
            };
        });
    });

    return map;
}

function seatCellHtml(seatNo, bookedMap) {
    if (!seatNo) return `<div class="seat-space"></div>`;

    const id = toStr(seatNo);
    const booking = bookedMap[id];
    const isBlocked = booking?.status === "blocked";
    const isBooked = !!booking && !isBlocked;

    let cls = "seat";
    if (isBooked) cls += " booked";
    if (isBlocked) cls += " blocked";

    const passenger = booking?.customerName || "";
    const phone = booking?.customerPhone || "";

    return `
    <div class="${cls}">
      <div class="seat-no">${id}</div>
      ${isBooked || isBlocked
            ? `<div class="seat-meta">
              <div class="seat-passenger">${passenger || "Reserved"}</div>
              <div class="seat-phone">${phone || ""}</div>
            </div>`
            : ""
        }
    </div>
  `;
}

function rowHtml(row, bookedMap) {
    if (row.onlyBottom && Array.isArray(row.bottom)) {
        return `
      <div class="bottom-row">
        ${row.bottom.map((seat) => seatCellHtml(seat, bookedMap)).join("")}
      </div>
    `;
    }

    if (row.isFront) {
        return `
      <div class="front-row">
        <div class="left-group">${Array.isArray(row.left) ? row.left.map((seat) => seatCellHtml(seat, bookedMap)).join("") : seatCellHtml(row.left, bookedMap)}</div>
      </div>
    `;
    }

    const leftHtml = Array.isArray(row.left)
        ? row.left.map((seat) => seatCellHtml(seat, bookedMap)).join("")
        : seatCellHtml(row.left, bookedMap);

    const rightHtml = Array.isArray(row.right)
        ? row.right.map((seat) => seatCellHtml(seat, bookedMap)).join("")
        : seatCellHtml(row.right, bookedMap);

    return `
    <div class="seat-row">
      <div class="left-group">${leftHtml}</div>
      <div class="aisle"></div>
      <div class="right-group">${rightHtml}</div>
    </div>
  `;
}

export function buildSeatTemplateHtml({
    bus,
    date,
    bookings = [],
    seatLayout = "39",
    brandName = "ShreeMorya",
}) {
    const totalSeats = Number(String(seatLayout || bus?.seatLayout || 39)) || 39;
    const rows = getSeatRows(totalSeats);
    const bookedMap = buildBookedMap(bookings);

    const pickupName = bus?.pickupName || bus?.from || "-";
    const pickupMarathi = bus?.pickupMarathi || "";
    const pickupTime = bus?.startTime || bus?.pickupTime || "--:--";

    const dropName = bus?.dropName || bus?.to || "-";
    const dropMarathi = bus?.dropMarathi || "";
    const dropTime = bus?.endTime || bus?.dropTime || "--:--";

    const bookingRows = bookings
        .map((b, idx) => {
            return `
        <tr>
          <td>${idx + 1}</td>
          <td>${(b?.seats || []).join(", ")}</td>
          <td>${b?.bookingCode || "-"}</td>
          <td>${b?.customerName || "-"}</td>
          <td>${b?.customerPhone || "-"}</td>
          <td>${b?.pickupName || "-"}</td>
          <td>${b?.dropName || "-"}</td>
          <td>${b?.paymentMethod || "-"}</td>
        </tr>
      `;
        })
        .join("");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${brandName} Seat Template</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
    }
    .page {
      width: 1180px;
      margin: 0 auto;
      background: #ffffff;
      padding: 28px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
    }
    .brand {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.32em;
      color: #f97316;
      margin-bottom: 10px;
    }
    .title {
      font-size: 34px;
      font-weight: 800;
      margin: 0;
      line-height: 1.2;
    }
    .subtitle {
      margin-top: 10px;
      color: #64748b;
      font-size: 18px;
      font-weight: 600;
    }
    .badge {
      background: #fff7ed;
      color: #ea580c;
      border: 1px solid #fed7aa;
      border-radius: 999px;
      padding: 12px 18px;
      font-weight: 700;
      font-size: 16px;
    }

    .top-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 22px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 22px;
      padding: 16px;
      background: #ffffff;
    }
    .card-label {
      font-size: 12px;
      letter-spacing: 0.18em;
      font-weight: 800;
      color: #64748b;
      margin-bottom: 8px;
    }
    .card-value {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.3;
    }
    .card-sub {
      margin-top: 6px;
      color: #64748b;
      font-size: 14px;
      font-weight: 600;
    }

    .main-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 22px;
      margin-top: 22px;
    }

    .panel {
      border: 1px solid #e2e8f0;
      border-radius: 26px;
      padding: 18px;
      background: #ffffff;
    }
    .panel-title {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .panel-sub {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 16px;
      font-weight: 600;
    }

    .seat-board {
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 16px;
      background: #f8fafc;
    }

    .seat-row {
      display: grid;
      grid-template-columns: 1fr 60px 1fr;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .front-row {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 14px;
    }
    .left-group, .right-group, .bottom-row {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .right-group {
      justify-content: flex-end;
    }
    .bottom-row {
      justify-content: center;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    .aisle {
      height: 20px;
    }

    .seat {
      width: 88px;
      min-height: 82px;
      border-radius: 18px;
      border: 1.5px solid #cbd5e1;
      background: #ffffff;
      padding: 8px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);
    }
    .seat.booked {
      background: #fee2e2;
      border-color: #fca5a5;
    }
    .seat.blocked {
      background: #d1fae5;
      border-color: #86efac;
    }
    .seat-no {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .seat-meta {
      font-size: 10px;
      line-height: 1.35;
      color: #334155;
    }
    .seat-passenger {
      font-weight: 700;
    }
    .seat-phone {
      color: #64748b;
      margin-top: 2px;
    }
    .seat-space {
      width: 88px;
      height: 82px;
    }

    .legend {
      display: flex;
      gap: 18px;
      flex-wrap: wrap;
      margin-top: 18px;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .legend-box {
      width: 16px;
      height: 16px;
      border-radius: 5px;
      border: 1px solid #cbd5e1;
      background: #fff;
    }
    .legend-booked {
      background: #fee2e2;
      border-color: #fca5a5;
    }
    .legend-blocked {
      background: #d1fae5;
      border-color: #86efac;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f8fafc;
      color: #334155;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 0.08em;
    }

    @media print {
      body {
        background: #fff;
      }
      .page {
        width: 100%;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="brand">${brandName}</div>
        <h1 class="title">${bus?.busNumber || "-"} — ${bus?.routeName || "-"}</h1>
        <div class="subtitle">
          ${pickupName} ${pickupMarathi ? `(${pickupMarathi})` : ""} ${pickupTime ? `• ${pickupTime}` : ""}
          &nbsp;→&nbsp;
          ${dropName} ${dropMarathi ? `(${dropMarathi})` : ""} ${dropTime ? `• ${dropTime}` : ""}
        </div>
      </div>

      <div class="badge">Date: ${formatDate(date)}</div>
    </div>

    <div class="top-grid">
      <div class="card">
        <div class="card-label">BUS NUMBER</div>
        <div class="card-value">${bus?.busNumber || "-"}</div>
      </div>
      <div class="card">
        <div class="card-label">SEAT LAYOUT</div>
        <div class="card-value">${totalSeats} Seats</div>
      </div>
      <div class="card">
        <div class="card-label">PICKUP</div>
        <div class="card-value">${pickupName}</div>
        <div class="card-sub">${pickupMarathi || "-"} • ${pickupTime || "--:--"}</div>
      </div>
      <div class="card">
        <div class="card-label">DROP</div>
        <div class="card-value">${dropName}</div>
        <div class="card-sub">${dropMarathi || "-"} • ${dropTime || "--:--"}</div>
      </div>
    </div>

    <div class="main-grid">
      <div class="panel">
        <div class="panel-title">Seat Layout Preview</div>
        <div class="panel-sub">Booked seats show passenger name and phone number</div>

        <div class="seat-board">
          ${rows.map((row) => rowHtml(row, bookedMap)).join("")}
        </div>

        <div class="legend">
          <div class="legend-item"><span class="legend-box"></span> Available</div>
          <div class="legend-item"><span class="legend-box legend-booked"></span> Booked</div>
          <div class="legend-item"><span class="legend-box legend-blocked"></span> Cancelled / Blocked</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Booking Register</div>
        <div class="panel-sub">All bookings for selected bus and date</div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Seat</th>
              <th>Code</th>
              <th>Passenger</th>
              <th>Phone</th>
              <th>Pickup</th>
              <th>Drop</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            ${bookingRows ||
        `<tr><td colspan="8" style="text-align:center; color:#64748b;">No bookings found</td></tr>`
        }
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}