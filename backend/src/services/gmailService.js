import nodemailer from "nodemailer";

/**
 * Gmail Email Service
 * Simple and reliable email service using Gmail SMTP
 */

let transporter = null;

// Create Gmail transporter
const getGmailTransporter = () => {
  if (!transporter) {
    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const gmailPass = process.env.GMAIL_PASS || process.env.SMTP_PASS;

    if (!gmailUser || !gmailPass) {
      console.log("⚠️ Gmail credentials not configured");
      return null;
    }

    transporter = nodemailer.createTransport({
      service: "gmail", // Uses Gmail's built-in config
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    console.log("✅ Gmail transporter created");
  }
  return transporter;
};

// Send email via Gmail
const sendEmail = async ({ to, subject, html }) => {
  const transport = getGmailTransporter();

  if (!transport) {
    console.log("⚠️ Gmail not configured - email skipped");
    if (process.env.NODE_ENV === "development") {
      console.log(`📧 Would send to: ${to}`);
      console.log(`📧 Subject: ${subject}`);
    }
    return { success: false, message: "Gmail not configured" };
  }

  try {
    const info = await transport.sendMail({
      from: `"Khemsang Store" <${
        process.env.EMAIL_FROM || process.env.GMAIL_USER
      }>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to: ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Gmail send failed:", error.message);
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ Dev mode - continuing without email");
      return { success: false, error: error.message };
    }
    throw error;
  }
};

// Send verification email
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" bgcolor="#7c3aed" style="padding:40px 20px;">
              <h1 style="color:#ffffff; margin:0; font-size:28px;">✨ Welcome!</h1>
              <p style="color:#e9d5ff; margin:10px 0 0; font-size:16px;">Verify your email to get started</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="color:#374151; font-size:16px; line-height:24px; margin:0 0 30px;">
                Hey there! 👋 Click the button below to verify your email:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <a href="${verificationUrl}" style="background:#7c3aed; color:#ffffff; padding:14px 40px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#6b7280; font-size:14px; margin:20px 0 0;">
                Or copy this link: <br>
                <span style="color:#7c3aed; word-break:break-all;">${verificationUrl}</span>
              </p>
              <p style="color:#ef4444; font-size:13px; margin:20px 0 0;">
                ⏰ This link expires in 15 minutes
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" bgcolor="#f9fafb" style="padding:20px; border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af; font-size:12px; margin:0;">
                © ${new Date().getFullYear()} Khemsang Store • Made with ❤️ in Nepal
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return await sendEmail({
    to: email,
    subject: "✨ Verify Your Email - Khemsang Store",
    html,
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  const otpDigits = otp.toString().split("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" bgcolor="#10b981" style="padding:40px 20px;">
              <div style="font-size:50px; margin-bottom:10px;">🔐</div>
              <h1 style="color:#ffffff; margin:0; font-size:28px;">Login Verification</h1>
              <p style="color:#d1fae5; margin:10px 0 0; font-size:16px;">Your One-Time Password</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="color:#374151; font-size:16px; text-align:center; margin:0 0 30px;">
                Use this code to complete your login:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="8" style="display:inline-block;">
                      <tr>
                        ${otpDigits
                          .map(
                            (digit) => `
                          <td style="width:50px; height:60px; background:#f0fdf4; border:2px solid #10b981; border-radius:8px; text-align:center; font-size:32px; font-weight:bold; color:#059669;">
                            ${digit}
                          </td>
                        `
                          )
                          .join("")}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="color:#f59e0b; font-size:14px; text-align:center; margin:30px 0 0;">
                ⏰ Expires in 10 minutes
              </p>
              <p style="color:#ef4444; font-size:13px; text-align:center; margin:10px 0 0;">
                🔒 Never share this code with anyone
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" bgcolor="#f9fafb" style="padding:20px; border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af; font-size:12px; margin:0;">
                © ${new Date().getFullYear()} Khemsang Store
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return await sendEmail({
    to: email,
    subject: `🔐 Your Login OTP: ${otp}`,
    html,
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" bgcolor="#ef4444" style="padding:40px 20px;">
              <div style="font-size:50px; margin-bottom:10px;">🔑</div>
              <h1 style="color:#ffffff; margin:0; font-size:28px;">Password Reset</h1>
              <p style="color:#fecaca; margin:10px 0 0; font-size:16px;">Reset your password securely</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="color:#374151; font-size:16px; line-height:24px; margin:0 0 30px;">
                We received a request to reset your password. Click the button below:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <a href="${resetUrl}" style="background:#ef4444; color:#ffffff; padding:14px 40px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#6b7280; font-size:14px; margin:20px 0 0;">
                Or copy this link: <br>
                <span style="color:#ef4444; word-break:break-all;">${resetUrl}</span>
              </p>
              <p style="color:#f59e0b; font-size:13px; margin:20px 0 0;">
                ⏰ This link expires in 15 minutes
              </p>
              <p style="color:#6b7280; font-size:13px; margin:10px 0 0;">
                If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" bgcolor="#f9fafb" style="padding:20px; border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af; font-size:12px; margin:0;">
                © ${new Date().getFullYear()} Khemsang Store
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return await sendEmail({
    to: email,
    subject: "🔑 Password Reset Request",
    html,
  });
};

export default sendEmail;
