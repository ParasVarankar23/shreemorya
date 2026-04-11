import nodemailer from "nodemailer";

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

const APP_NAME = "Shree Morya Travels";
const SUPPORT_PHONE = "+91 88881 57744";
const LOGIN_URL = "https://shreemorya.vercel.app/login";

export async function sendWelcomePasswordEmail({
    to,
    fullName,
    email,
    phoneNumber,
    password,
}) {
    const mailOptions = {
        from: `"${APP_NAME}" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: `Welcome to ${APP_NAME} – Your Login Details`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_NAME}</title>
</head>
<body style="margin:0; padding:0; background:#f4f7f9; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:24px 12px; background:#f4f7f9;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; background:#ffffff; border:1px solid #e5e7eb; border-radius:20px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#0f766e; padding:32px 28px; text-align:center;">
              <div style="font-size:26px; font-weight:800; color:#ffffff;">🚌 ${APP_NAME}</div>
              <div style="font-size:14px; color:rgba(255,255,255,0.92); margin-top:8px;">
                Welcome aboard! Your account is ready.
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:34px 28px 24px;">
              <div style="font-size:16px; line-height:1.8; color:#111827;">
                Hello <strong>${fullName}</strong>,
              </div>

              <div style="font-size:15px; line-height:1.9; color:#374151; margin-top:16px;">
                Your account has been created successfully with <strong>${APP_NAME}</strong>.
                You can now log in using your <strong>Email</strong> or <strong>Phone Number</strong>.
              </div>

              <!-- Login Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#f8fafc; border:1px solid #dbe4ee; border-left:4px solid #0f766e; border-radius:16px; padding:22px;">
                    <div style="font-size:18px; font-weight:700; color:#111827; margin-bottom:14px;">
                      🔐 Login Details
                    </div>

                    <div style="font-size:15px; color:#374151; line-height:1.9;">
                      <strong>Email:</strong> ${email}
                    </div>

                    <div style="font-size:15px; color:#374151; line-height:1.9; margin-top:6px;">
                      <strong>Phone Number:</strong> ${phoneNumber}
                    </div>

                    <div style="font-size:15px; color:#374151; line-height:1.9; margin-top:6px;">
                      <strong>Login with:</strong> Email or Phone Number
                    </div>

                    <div style="font-size:15px; color:#374151; line-height:1.9; margin-top:16px;">
                      <strong>Temporary Password:</strong>
                    </div>

                    <div style="margin-top:10px; background:#ffffff; border:1px solid #d1d5db; border-radius:14px; padding:16px; text-align:center;">
                      <div style="font-size:28px; font-weight:800; color:#111827; letter-spacing:1px;">
                        ${password}
                      </div>
                    </div>

                    <div style="font-size:13px; color:#6b7280; line-height:1.8; margin-top:12px;">
                      Please use this password for your first login and change it after signing in.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
                <tr>
                  <td align="center">
                    <a href="${LOGIN_URL}" target="_blank" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; font-size:16px; font-weight:700; padding:14px 30px; border-radius:12px;">
                      Login Now
                    </a>
                  </td>
                </tr>
              </table>

              <div style="font-size:14px; color:#6b7280; line-height:1.8; margin-top:14px; text-align:center;">
                <a href="${LOGIN_URL}" target="_blank" style="color:#0f766e; text-decoration:none; font-weight:600;">
                  ${LOGIN_URL}
                </a>
              </div>

              <!-- Support -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
                <tr>
                  <td style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:14px; padding:18px;">
                    <div style="font-size:15px; font-weight:700; color:#111827;">Need help?</div>
                    <div style="font-size:14px; color:#6b7280; margin-top:6px;">Customer Support</div>
                    <div style="font-size:18px; font-weight:700; color:#0f766e; margin-top:8px;">${SUPPORT_PHONE}</div>
                  </td>
                </tr>
              </table>

              <div style="font-size:15px; color:#374151; line-height:1.8; margin-top:24px;">
                Warm regards,<br />
                <strong>${APP_NAME} Team</strong>
              </div>

              <div style="height:1px; background:#e5e7eb; margin:24px 0 16px;"></div>

              <div style="font-size:12px; color:#9ca3af; line-height:1.8; text-align:center;">
                This is an automated email from ${APP_NAME}. Please do not reply directly.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    };

    return transporter.sendMail(mailOptions);
}

export async function sendPasswordResetOtpEmail({
    to,
    fullName,
    otp,
}) {
    const mailOptions = {
        from: `"${APP_NAME}" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: `Password Reset OTP – ${APP_NAME}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_NAME}</title>
</head>
<body style="margin:0; padding:0; background:#f4f7f9; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:24px 12px; background:#f4f7f9;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; background:#ffffff; border:1px solid #e5e7eb; border-radius:20px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#0f766e; padding:32px 28px; text-align:center;">
              <div style="font-size:26px; font-weight:800; color:#ffffff;">🔐 ${APP_NAME}</div>
              <div style="font-size:14px; color:rgba(255,255,255,0.92); margin-top:8px;">
                Password Reset Verification
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:34px 28px 24px;">
              <div style="font-size:16px; line-height:1.8; color:#111827;">
                Hello <strong>${fullName}</strong>,
              </div>

              <div style="font-size:15px; line-height:1.9; color:#374151; margin-top:16px;">
                We received a request to reset your password for your <strong>${APP_NAME}</strong> account.
                Please use the OTP below to continue.
              </div>

              <!-- OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#f8fafc; border:1px solid #dbe4ee; border-left:4px solid #0f766e; border-radius:16px; padding:24px; text-align:center;">
                    <div style="font-size:14px; color:#6b7280; margin-bottom:10px;">Your OTP Code</div>
                    <div style="font-size:34px; font-weight:800; color:#111827; letter-spacing:6px;">
                      ${otp}
                    </div>
                    <div style="font-size:13px; color:#6b7280; margin-top:10px;">
                      This OTP is valid for 10 minutes.
                    </div>
                  </td>
                </tr>
              </table>

              <div style="font-size:14px; color:#6b7280; line-height:1.8; margin-top:20px;">
                If you did not request this password reset, please ignore this email.
              </div>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="${LOGIN_URL}" target="_blank" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; font-size:16px; font-weight:700; padding:14px 30px; border-radius:12px;">
                      Go to Login
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Support -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:14px; padding:18px;">
                    <div style="font-size:15px; font-weight:700; color:#111827;">Need help?</div>
                    <div style="font-size:14px; color:#6b7280; margin-top:6px;">Customer Support</div>
                    <div style="font-size:18px; font-weight:700; color:#0f766e; margin-top:8px;">${SUPPORT_PHONE}</div>
                  </td>
                </tr>
              </table>

              <div style="height:1px; background:#e5e7eb; margin:24px 0 16px;"></div>

              <div style="font-size:12px; color:#9ca3af; line-height:1.8; text-align:center;">
                This is an automated email from ${APP_NAME}. Please do not reply directly.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    };

    return transporter.sendMail(mailOptions);
}

export async function sendPasswordResetSuccessEmail({
    to,
    fullName,
}) {
    const mailOptions = {
        from: `"${APP_NAME}" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: `Password Reset Successful – ${APP_NAME}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_NAME}</title>
</head>
<body style="margin:0; padding:0; background:#f4f7f9; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:24px 12px; background:#f4f7f9;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; background:#ffffff; border:1px solid #e5e7eb; border-radius:20px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#0f766e; padding:32px 28px; text-align:center;">
              <div style="font-size:26px; font-weight:800; color:#ffffff;">✅ ${APP_NAME}</div>
              <div style="font-size:14px; color:rgba(255,255,255,0.92); margin-top:8px;">
                Password Updated Successfully
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:34px 28px 24px;">
              <div style="font-size:16px; line-height:1.8; color:#111827;">
                Hello <strong>${fullName}</strong>,
              </div>

              <div style="font-size:15px; line-height:1.9; color:#374151; margin-top:16px;">
                Your password has been changed successfully for your <strong>${APP_NAME}</strong> account.
              </div>

              <div style="font-size:15px; line-height:1.9; color:#374151; margin-top:12px;">
                You can now log in with your new password.
              </div>

              <!-- Success Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#f0fdf4; border:1px solid #bbf7d0; border-left:4px solid #0f766e; border-radius:16px; padding:20px;">
                    <div style="font-size:16px; font-weight:700; color:#166534;">
                      Password reset successful
                    </div>
                    <div style="font-size:14px; color:#166534; line-height:1.8; margin-top:8px;">
                      If you did not perform this action, please contact support immediately.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="${LOGIN_URL}" target="_blank" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; font-size:16px; font-weight:700; padding:14px 30px; border-radius:12px;">
                      Login Now
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Support -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:14px; padding:18px;">
                    <div style="font-size:15px; font-weight:700; color:#111827;">Need help?</div>
                    <div style="font-size:14px; color:#6b7280; margin-top:6px;">Customer Support</div>
                    <div style="font-size:18px; font-weight:700; color:#0f766e; margin-top:8px;">${SUPPORT_PHONE}</div>
                  </td>
                </tr>
              </table>

              <div style="height:1px; background:#e5e7eb; margin:24px 0 16px;"></div>

              <div style="font-size:12px; color:#9ca3af; line-height:1.8; text-align:center;">
                This is an automated email from ${APP_NAME}. Please do not reply directly.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    };

    return transporter.sendMail(mailOptions);
}