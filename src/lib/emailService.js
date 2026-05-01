import nodemailer from "nodemailer";

const APP_NAME = "Morya Travels";
const APP_FULL_NAME = "Shree Morya Travels";
const SUPPORT_PHONE = "+91 88881 57744";
const SUPPORT_EMAIL = process.env.SMTP_EMAIL || "";
const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://shreemorya.vercel.app";
const LOGIN_URL = `${APP_URL.replace(/\/$/, "")}/login`;

const BRAND = {
    teal: "#0B5D5A",
    tealDark: "#0A4F4D",
    tealDeep: "#083E3C",
    amber: "#F4B31A",
    amberSoft: "#FFF5D9",
    ink: "#0F172A",
    text: "#334155",
    muted: "#64748B",
    border: "#D7ECEA",
    surface: "#F8FCFC",
    white: "#FFFFFF",
};

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

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatCurrency(amount) {
    const value = Number(amount || 0);
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
}

function safeText(value, fallback = "-") {
    const text = String(value ?? "").trim();
    return text || fallback;
}

function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return safeText(value);
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function infoRow(label, value, highlight = false) {
    return `
        <tr>
            <td style="padding:8px 0; width:40%; color:${BRAND.muted}; font-size:14px; line-height:1.6; font-weight:700; vertical-align:top;">${escapeHtml(label)}</td>
            <td style="padding:8px 0; color:${highlight ? BRAND.teal : BRAND.text}; font-size:14px; line-height:1.6; font-weight:${highlight ? 800 : 600}; vertical-align:top;">${escapeHtml(value)}</td>
        </tr>
    `;
}

function card(title, bodyHtml) {
    return `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px;">
            <tr>
                <td style="background:${BRAND.white}; border:1px solid ${BRAND.border}; border-radius:18px; padding:22px;">
                    <div style="font-size:18px; font-weight:800; color:${BRAND.ink}; margin-bottom:14px;">${escapeHtml(title)}</div>
                    ${bodyHtml}
                </td>
            </tr>
        </table>
    `;
}

function alertBox(message, tone = "info") {
    const colors = {
        info: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
        success: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
        warning: { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412" },
        danger: { bg: "#FEF2F2", border: "#FECACA", text: "#B91C1C" },
    };
    const color = colors[tone] || colors.info;

    return `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px;">
            <tr>
                <td style="background:${color.bg}; border:1px solid ${color.border}; border-left:4px solid ${BRAND.teal}; border-radius:16px; padding:18px; color:${color.text}; font-size:14px; line-height:1.8; font-weight:600;">
                    ${message}
                </td>
            </tr>
        </table>
    `;
}

function otpBlock(otp) {
    return `
        <div style="text-align:center; background:${BRAND.surface}; border:1px solid ${BRAND.border}; border-radius:18px; padding:24px;">
            <div style="font-size:13px; color:${BRAND.muted}; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:12px;">Security Code</div>
            <div style="display:inline-block; background:${BRAND.white}; border:1px dashed ${BRAND.amber}; border-radius:16px; padding:16px 24px; color:${BRAND.teal}; font-size:34px; font-weight:900; letter-spacing:6px;">${escapeHtml(otp)}</div>
            <div style="font-size:13px; color:${BRAND.muted}; margin-top:12px; line-height:1.6;">This code is valid for 10 minutes.</div>
        </div>
    `;
}

function moneyTag(amount) {
    return `
        <span style="display:inline-block; background:${BRAND.amberSoft}; color:${BRAND.teal}; border:1px solid #F4D58D; border-radius:999px; padding:6px 12px; font-weight:800; font-size:13px;">${escapeHtml(formatCurrency(amount))}</span>
    `;
}

function formatStopWithTime(name, time, marathi = "") {
    const stopName = safeText(name);
    const stopTime = safeText(time, "");
    const marathiName = safeText(marathi, "");
    const displayName =
        marathiName && marathiName !== stopName ? `${stopName} (${marathiName})` : stopName;
    return stopTime ? `${displayName} (${stopTime})` : displayName;
}

function createEmailTemplate({
    preheader,
    title,
    subtitle,
    badgeText,
    introTitle,
    introText,
    bodyHtml,
    buttonText,
    buttonUrl,
    footerNote,
}) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background:${BRAND.surface}; font-family:Arial, Helvetica, sans-serif; color:${BRAND.text};">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${escapeHtml(
        preheader || subtitle || title
    )}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.surface}; padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px; background:${BRAND.white}; border:1px solid ${BRAND.border}; border-radius:24px; overflow:hidden; box-shadow:0 16px 40px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.teal} 0%, ${BRAND.tealDark} 70%, ${BRAND.tealDeep} 100%); padding:34px 28px; text-align:center;">
              <div style="display:inline-block; background:${BRAND.amber}; color:${BRAND.tealDeep}; font-size:12px; font-weight:900; letter-spacing:0.18em; text-transform:uppercase; border-radius:999px; padding:7px 14px;">${escapeHtml(
        badgeText || APP_NAME
    )}</div>
              <div style="margin-top:16px; font-size:30px; font-weight:900; color:${BRAND.white}; line-height:1.2;">${escapeHtml(
        APP_FULL_NAME
    )}</div>
              <div style="margin-top:8px; font-size:15px; color:rgba(255,255,255,0.9); line-height:1.7;">${escapeHtml(
        subtitle || "Premium bus booking"
    )}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 28px 28px;">
              <div style="font-size:18px; line-height:1.8; color:${BRAND.ink}; font-weight:700;">${escapeHtml(
        introTitle || "Hello,"
    )}</div>
              <div style="font-size:15px; line-height:1.9; color:${BRAND.text}; margin-top:12px;">${escapeHtml(
        introText || ""
    )}</div>
              <div style="margin-top:24px;">${bodyHtml || ""}</div>

              ${buttonText && buttonUrl
            ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(
                buttonUrl
            )}" target="_blank" style="display:inline-block; background:${BRAND.teal}; color:${BRAND.white}; text-decoration:none; font-size:16px; font-weight:800; padding:14px 30px; border-radius:14px; box-shadow:0 10px 24px rgba(11,93,90,0.2);">${escapeHtml(
                buttonText
            )}</a>
                  </td>
                </tr>
              </table>
              `
            : ""
        }

              <div style="margin-top:18px; text-align:center; font-size:13px; line-height:1.8; color:${BRAND.muted};">
                <a href="${escapeHtml(
            buttonUrl || LOGIN_URL
        )}" target="_blank" style="color:${BRAND.teal}; text-decoration:none; font-weight:700;">${escapeHtml(
            buttonUrl || LOGIN_URL
        )}</a>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
                <tr>
                  <td style="background:${BRAND.surface}; border:1px solid ${BRAND.border}; border-radius:18px; padding:18px;">
                    <div style="font-size:15px; font-weight:800; color:${BRAND.ink};">Need help?</div>
                    <div style="font-size:14px; color:${BRAND.muted}; margin-top:6px; line-height:1.7;">Customer Support</div>
                    <div style="font-size:18px; font-weight:900; color:${BRAND.teal}; margin-top:8px;">${escapeHtml(
            SUPPORT_PHONE
        )}</div>
                    ${SUPPORT_EMAIL
            ? `<div style="font-size:13px; color:${BRAND.muted}; margin-top:6px;">${escapeHtml(
                SUPPORT_EMAIL
            )}</div>`
            : ""
        }
                  </td>
                </tr>
              </table>

              <div style="margin-top:24px; font-size:14px; line-height:1.8; color:${BRAND.text};">Warm regards,<br /><strong>${escapeHtml(
            APP_FULL_NAME
        )} Team</strong></div>

              <div style="height:1px; background:${BRAND.border}; margin:24px 0 16px;"></div>
              <div style="font-size:12px; color:${BRAND.muted}; line-height:1.8; text-align:center;">${escapeHtml(
            footerNote ||
            `This is an automated email from ${APP_FULL_NAME}. Please do not reply directly.`
        )}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
}

async function sendMail(mailOptions) {
    return transporter.sendMail(mailOptions);
}

async function sendTemplateMail({ to, subject, html, attachments = [] }) {
    if (!to) {
        throw new Error("Recipient email is required");
    }

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASS) {
        throw new Error("SMTP email credentials are not configured");
    }

    return sendMail({
        from: `"${APP_FULL_NAME}" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        html,
        attachments,
    });
}

export async function sendWelcomePasswordEmail({
    to,
    fullName,
    email,
    phoneNumber,
    password,
}) {
    const html = createEmailTemplate({
        preheader: "Your account is ready",
        title: "Welcome to Morya Travels",
        subtitle: "Your passenger account has been created",
        badgeText: "NEW ACCOUNT",
        introTitle: `Hello ${safeText(fullName, "Passenger")},`,
        introText: `Your account has been created successfully with ${APP_FULL_NAME}. You can now log in using your email or phone number.`,
        bodyHtml: card(
            "Login Details",
            `
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    ${infoRow("Email", safeText(email))}
                    ${infoRow("Phone Number", safeText(phoneNumber))}
                    ${infoRow("Login With", "Email or Phone Number")}
                    ${infoRow("Temporary Password", safeText(password), true)}
                </table>
                <div style="margin-top:18px;">${otpBlock(password)}</div>
            `
        ),
        buttonText: "Login Now",
        buttonUrl: LOGIN_URL,
        footerNote: "Change your temporary password after the first login.",
    });

    return sendTemplateMail({
        to,
        subject: `Welcome to ${APP_FULL_NAME} - Login Details`,
        html,
    });
}

export async function sendPasswordResetOtpEmail({ to, fullName, otp }) {
    const html = createEmailTemplate({
        preheader: "Password reset OTP",
        title: "Reset Your Password",
        subtitle: "Secure verification for your Morya Travels account",
        badgeText: "SECURITY",
        introTitle: `Hello ${safeText(fullName, "Passenger")},`,
        introText: `We received a password reset request for your ${APP_FULL_NAME} account. Use the OTP below to continue.`,
        bodyHtml: `
            ${otpBlock(otp)}
            ${alertBox("Never share this OTP with anyone. If you did not request this reset, you can ignore this email.", "warning")}
        `,
        buttonText: "Go to Login",
        buttonUrl: LOGIN_URL,
        footerNote: "This OTP expires in 10 minutes.",
    });

    return sendTemplateMail({
        to,
        subject: `Password Reset OTP - ${APP_FULL_NAME}`,
        html,
    });
}

export async function sendPasswordResetSuccessEmail({ to, fullName }) {
    const html = createEmailTemplate({
        preheader: "Password updated successfully",
        title: "Password Reset Successful",
        subtitle: "Your account password has been changed",
        badgeText: "UPDATED",
        introTitle: `Hello ${safeText(fullName, "Passenger")},`,
        introText: `Your password has been updated successfully for your ${APP_FULL_NAME} account.`,
        bodyHtml: `
            ${alertBox("Password reset completed successfully. If you did not make this change, please contact support immediately.", "success")}
        `,
        buttonText: "Login Now",
        buttonUrl: LOGIN_URL,
        footerNote: "You can now log in using your new password.",
    });

    return sendTemplateMail({
        to,
        subject: `Password Reset Successful - ${APP_FULL_NAME}`,
        html,
    });
}

export async function sendSignupEmail(email, name, generatedPassword) {
    return sendWelcomePasswordEmail({
        to: email,
        fullName: name,
        email,
        phoneNumber: "",
        password: generatedPassword,
    });
}

export async function sendForgotPasswordEmail(email, otp) {
    return sendPasswordResetOtpEmail({
        to: email,
        fullName: "Passenger",
        otp,
    });
}

export async function sendLoginNotificationEmail({
    to,
    fullName,
    loginTime,
    loginMethod = "Password",
    ipAddress = "",
}) {
    const html = createEmailTemplate({
        preheader: "Login notification",
        title: "Login Successful",
        subtitle: "Your account was just accessed",
        badgeText: "LOGIN",
        introTitle: `Hello ${safeText(fullName, "Passenger")},`,
        introText: `This is a confirmation that your ${APP_FULL_NAME} account was logged in successfully.`,
        bodyHtml: card(
            "Login Activity",
            `
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    ${infoRow("Login Method", safeText(loginMethod))}
                    ${infoRow("Login Time", formatDateTime(loginTime))}
                    ${infoRow("IP Address", safeText(ipAddress || "Not available"))}
                </table>
            `
        ),
        buttonText: "Open Account",
        buttonUrl: APP_URL,
        footerNote: "If this was not you, please change your password immediately and contact support.",
    });

    return sendTemplateMail({
        to,
        subject: `Login Successful - ${APP_FULL_NAME}`,
        html,
    });
}

export async function sendLoginEmail(...args) {
    if (args.length === 1 && typeof args[0] === "object") {
        return sendLoginNotificationEmail(args[0]);
    }

    const [to, fullName, loginTime, loginMethod, ipAddress] = args;
    return sendLoginNotificationEmail({ to, fullName, loginTime, loginMethod, ipAddress });
}

function getBookingPartyName(value) {
    return safeText(value, "Passenger");
}

function getBusNumber(booking = {}) {
    return safeText(
        booking.busNumber ||
        booking?.schedule?.busNumber ||
        booking?.scheduleId?.busNumber ||
        booking?.bus?.busNumber ||
        "--"
    );
}

function getRouteName(booking = {}) {
    return safeText(
        booking.routeName ||
        booking?.schedule?.routeName ||
        booking?.scheduleId?.routeName ||
        booking?.bus?.routeName ||
        "--"
    );
}

function getTicketNumber(booking = {}) {
    return safeText(booking.bookingCode || booking.ticketNumber || booking.bookingId || "--");
}

function getRouteLabel(booking = {}) {
    const busNumber = getBusNumber(booking);
    const routeName = getRouteName(booking);
    return routeName && routeName !== "--" ? `${busNumber} - ${routeName}` : busNumber;
}

export async function sendBookingConfirmation(email, name, booking = {}) {
    const pickup = safeText(booking.pickupName || booking.pickup || "");
    const drop = safeText(booking.dropName || booking.drop || "");
    const startTime = safeText(booking.pickupTime || booking.startTime || "");
    const endTime = safeText(booking.dropTime || booking.endTime || "");
    const fareAmount = Number(booking.fare ?? booking.finalPayableAmount ?? 0);

    const html = createEmailTemplate({
        preheader: "Your booking is confirmed",
        title: "Booking Confirmed",
        subtitle: "Your seat has been reserved successfully",
        badgeText: "CONFIRMED",
        introTitle: `Hello ${getBookingPartyName(name)},`,
        introText:
            "Great news! Your booking has been confirmed successfully. Please review the trip details below and keep this email for reference.",
        bodyHtml: `
            ${card(
            "Booking Details",
            `
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        ${infoRow("Passenger Name", getBookingPartyName(name))}
                        ${infoRow("Ticket Number", getTicketNumber(booking), true)}
                        ${infoRow("Bus Number", getBusNumber(booking))}
                        ${infoRow("Route Name", getRouteName(booking))}
                        ${infoRow("Travel Date", safeText(booking.date || booking.travelDate || "--"))}
                        ${infoRow(
                "Seat Number",
                safeText(
                    booking.seatNo ||
                    (Array.isArray(booking.seats) ? booking.seats.join(", ") : "--")
                )
            )}
                        ${infoRow(
                "Pickup Point",
                formatStopWithTime(pickup, startTime, booking.pickupMarathi)
            )}
                        ${infoRow(
                "Drop Point",
                formatStopWithTime(drop, endTime, booking.dropMarathi)
            )}
                    </table>
                `
        )}
            ${card(
            "Payment Details",
            `
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        ${infoRow("Fare", formatCurrency(fareAmount), true)}
                        ${infoRow("Payment Method", safeText(booking.paymentMethod || "Online Payment"))}
                        ${booking.paymentId ? infoRow("Payment ID", booking.paymentId) : ""}
                    </table>
                `
        )}
            ${alertBox(
            "Please arrive at your pickup point 10-15 minutes before departure.",
            "success"
        )}
        `,
        buttonText: "View My Bookings",
        buttonUrl: APP_URL,
        footerNote: "Wishing you a safe and comfortable journey with Morya Travels.",
    });

    return sendTemplateMail({
        to: email,
        subject: `Booking Confirmed - ${getBusNumber(booking)}`,
        html,
    });
}

export async function sendBookingCancellation(email, name, booking = {}) {
    const pickup = safeText(booking.pickupName || booking.pickup || "");
    const drop = safeText(booking.dropName || booking.drop || "");
    const startTime = safeText(booking.pickupTime || booking.startTime || "");
    const endTime = safeText(booking.dropTime || booking.endTime || "");
    const fareAmount = Number(booking.fare ?? booking.finalPayableAmount ?? 0);

    const hasRefundObject = booking?.refund && typeof booking.refund === "object";
    const refundAmount = Number(hasRefundObject ? booking?.refund?.amount || 0 : 0);
    const retainedAmount = Math.max(fareAmount - refundAmount, 0);
    const paymentMethod = safeText(booking.paymentMethod || "Online Payment");

    const bookingDetailsHtml = card(
        "Cancelled Booking Details",
        `
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${infoRow("Passenger Name", getBookingPartyName(name))}
                ${infoRow("Ticket Number", getTicketNumber(booking), true)}
                ${infoRow("Bus Number", getBusNumber(booking))}
                ${infoRow("Route Name", getRouteName(booking))}
                ${infoRow("Travel Date", safeText(booking.date || booking.travelDate || "--"))}
                ${infoRow(
            "Seat Number",
            safeText(
                booking.seatNo ||
                (Array.isArray(booking.seats) ? booking.seats.join(", ") : "--")
            )
        )}
                ${infoRow(
            "Pickup Point",
            formatStopWithTime(pickup, startTime, booking.pickupMarathi)
        )}
                ${infoRow(
            "Drop Point",
            formatStopWithTime(drop, endTime, booking.dropMarathi)
        )}
            </table>
        `
    );

    const refundStatusText =
        refundAmount > 0
            ? "Refund has been processed successfully."
            : "No refund applicable for this cancellation.";

    const paymentDetails = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${infoRow("Fare", formatCurrency(fareAmount), true)}
            ${infoRow("Payment Method", paymentMethod)}
            ${infoRow("Refund Amount", formatCurrency(refundAmount), refundAmount > 0)}
            ${infoRow("Amount Retained", formatCurrency(retainedAmount))}
            ${booking?.refund?.mode
            ? infoRow("Refund Mode", safeText(booking.refund.mode))
            : infoRow("Refund Mode", refundAmount > 0 ? "Manual / Original Payment Source" : "No Refund")
        }
        </table>
        <div style="margin-top:12px;">
            ${alertBox(refundStatusText, refundAmount > 0 ? "success" : "warning")}
        </div>
    `;

    const html = createEmailTemplate({
        preheader: "Your booking has been cancelled",
        title: "Booking Cancelled",
        subtitle: "Your reservation has been cancelled",
        badgeText: "CANCELLED",
        introTitle: `Hello ${getBookingPartyName(name)},`,
        introText:
            "Your booking has been cancelled successfully. Please review the cancelled booking and refund details below.",
        bodyHtml: `
            ${bookingDetailsHtml}
            ${card("Payment Details", paymentDetails)}
            ${alertBox(
            "If you need to rebook or have questions about a refund, please contact support.",
            "warning"
        )}
        `,
        buttonText: "View My Bookings",
        buttonUrl: APP_URL,
        footerNote: "We hope to serve you again soon with Morya Travels.",
    });

    return sendTemplateMail({
        to: email,
        subject: `Booking Cancelled - ${getBusNumber(booking)}`,
        html,
    });
}

export async function sendBookingLoginEmail({
    to,
    fullName,
    loginTime,
    loginMethod,
    ipAddress,
}) {
    return sendLoginNotificationEmail({ to, fullName, loginTime, loginMethod, ipAddress });
}

export async function sendStaffWelcomeEmail({
    to,
    fullName,
    position,
    email,
    password,
}) {
    const html = createEmailTemplate({
        preheader: "Staff account created",
        title: "Welcome Staff Member",
        subtitle: "Your staff account is ready",
        badgeText: "STAFF",
        introTitle: `Hello ${fullName},`,
        introText: `You have been added as a ${position} in Morya Travels.`,
        bodyHtml: card(
            "Staff Details",
            `
        <table width="100%">
          ${infoRow("Name", fullName)}
          ${infoRow("Position", position, true)}
          ${infoRow("Email", email)}
          ${infoRow("Password", password, true)}
        </table>
      `
        ),
        buttonText: "Login Now",
        buttonUrl: LOGIN_URL,
    });

    return sendTemplateMail({
        to,
        subject: "Staff Account Created",
        html,
    });
}