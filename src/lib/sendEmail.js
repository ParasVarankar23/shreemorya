import nodemailer from "nodemailer";

const APP_NAME = "Shree Morya Travels";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: process.env.SMTP_ALLOW_SELF_SIGNED !== "true",
    },
});

/**
 * Send booking confirmation email
 * This is a minimal implementation that can be extended with branding.
 */
export async function sendBookingConfirmationEmail({ booking, schedule, payment }) {
    if (!booking || !schedule) return;

    const to = booking.contactDetails?.email;
    if (!to) return;

    const subject = `Booking Confirmed - ${booking.bookingCode}`;

    const seats = (booking.passengers || [])
        .map((p) => p.seatNumber)
        .sort((a, b) => a - b)
        .join(", ");

    const travelDate = new Date(booking.travelDate || schedule.travelDate || new Date());
    const travelDateStr = travelDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const paymentStatus = booking.paymentStatus || payment?.paymentStatus || "PAID";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_NAME} - Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f9;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;background:#f4f7f9;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
          <tr>
            <td style="background:#0f766e;padding:24px 20px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;">🚌 ${APP_NAME}</div>
              <div style="font-size:14px;color:rgba(255,255,255,0.9);margin-top:6px;">Your booking is confirmed</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 20px 20px;">
              <div style="font-size:15px;color:#111827;line-height:1.8;">
                Hello <strong>${booking.contactDetails?.fullName || "Guest"}</strong>,
              </div>
              <div style="font-size:14px;color:#374151;line-height:1.8;margin-top:10px;">
                Your booking <strong>${booking.bookingCode}</strong> has been confirmed.
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="font-size:15px;font-weight:700;color:#111827;margin-bottom:8px;">Trip Details</div>
                    <div style="font-size:14px;color:#374151;line-height:1.7;">
                      <div><strong>Bus:</strong> ${schedule.busName || "-"} (${schedule.busNumber || "-"})</div>
                      <div><strong>Route:</strong> ${schedule.startPoint} → ${schedule.endPoint}</div>
                      <div><strong>Date:</strong> ${travelDateStr}</div>
                      <div><strong>Departure:</strong> ${schedule.startTime}</div>
                      <div><strong>Seats:</strong> ${seats || "-"}</div>
                      <div><strong>Passenger:</strong> ${booking.contactDetails?.fullName || "-"}</div>
                      <div><strong>Amount Paid:</strong> ₹${Number(booking.finalPayableAmount || 0).toFixed(2)}</div>
                      <div><strong>Payment Status:</strong> ${paymentStatus}</div>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="font-size:13px;color:#6b7280;line-height:1.7;margin-top:16px;">
                Please reach your boarding point at least 15 minutes before departure.
              </div>

              <div style="font-size:12px;color:#9ca3af;line-height:1.7;margin-top:20px;">
                This is an automated email from ${APP_NAME}. Please do not reply directly.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const mailOptions = {
        from: `"${APP_NAME}" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
}

export default {
    sendBookingConfirmationEmail,
};
