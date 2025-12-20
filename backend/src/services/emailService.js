// emailService.js
import nodemailer from "nodemailer";

// Create transporter with Gmail service
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Use App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Generic function to send email
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to}`);
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
    console.log("⚠️ Fallback: email content below\n", html);
  }
};

// Send verification email
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const storeName = "Khemsang Store";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <tr>
                <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);padding:40px 40px 30px;text-align:center;">
                  <div style="font-size:50px;margin-bottom:15px;">✉️</div>
                  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Verify Your Email</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Welcome to ${storeName}!</p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">Hi there! 👋</p>
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 30px;">Thanks for signing up! Please verify your email address by clicking the button below.</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding:10px 0 30px;">
                        <a href="${verificationUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;box-shadow:0 4px 14px rgba(99,102,241,0.4);">✓ Verify Email Address</a>
                      </td>
                    </tr>
                  </table>
                  <div style="border-top:1px solid #e5e7eb;margin:20px 0;"></div>
                  <p style="color:#6b7280;font-size:14px;margin:0 0 10px;">Or copy this link:</p>
                  <p style="background-color:#f3f4f6;padding:12px;border-radius:8px;word-break:break-all;font-size:13px;color:#6366f1;margin:0 0 20px;">${verificationUrl}</p>
                  <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;">
                    <p style="color:#92400e;font-size:14px;margin:0;">⏰ This link expires in <strong>15 minutes</strong></p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af;font-size:13px;margin:0;">© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `✉️ Verify Your Email - ${storeName}`,
    html,
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  const storeName = "Khemsang Store";
  const otpDigits = otp.toString().split("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <tr>
                <td style="background:linear-gradient(135deg,#10b981 0%,#059669 50%,#047857 100%);padding:40px 40px 30px;text-align:center;">
                  <div style="font-size:50px;margin-bottom:15px;">🔐</div>
                  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Login Verification</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Your One-Time Password</p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;text-align:center;">Use this code to complete your login:</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding:20px 0 30px;">
                        <div style="display:inline-block;background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border:2px solid #10b981;border-radius:16px;padding:20px 30px;">
                          <table cellpadding="0" cellspacing="8">
                            <tr>
                              ${otpDigits
                                .map(
                                  (digit) =>
                                    `<td style="width:45px;height:55px;background-color:#ffffff;border:2px solid #10b981;border-radius:12px;text-align:center;font-size:28px;font-weight:700;color:#059669;">${digit}</td>`
                                )
                                .join("")}
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
                    <p style="color:#92400e;font-size:14px;margin:0;">⏰ This code expires in <strong>10 minutes</strong></p>
                  </div>
                  <div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:0 8px 8px 0;">
                    <p style="color:#991b1b;font-size:14px;margin:0;">🔒 Never share this code with anyone.</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af;font-size:13px;margin:0;">© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `🔐 Your Login OTP: ${otp} - ${storeName}`,
    html,
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const storeName = "Khemsang Store";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <tr>
                <td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 50%,#b45309 100%);padding:40px 40px 30px;text-align:center;">
                  <div style="font-size:50px;margin-bottom:15px;">🔑</div>
                  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Reset Your Password</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Password Reset Request</p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">Hi there! 👋</p>
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 30px;">We received a request to reset your password. Click the button below to create a new password.</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding:10px 0 30px;">
                        <a href="${resetUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;box-shadow:0 4px 14px rgba(245,158,11,0.4);">🔑 Reset Password</a>
                      </td>
                    </tr>
                  </table>
                  <div style="border-top:1px solid #e5e7eb;margin:20px 0;"></div>
                  <p style="color:#6b7280;font-size:14px;margin:0 0 10px;">Or copy this link:</p>
                  <p style="background-color:#f3f4f6;padding:12px;border-radius:8px;word-break:break-all;font-size:13px;color:#d97706;margin:0 0 20px;">${resetUrl}</p>
                  <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
                    <p style="color:#92400e;font-size:14px;margin:0;">⏰ This link expires in <strong>15 minutes</strong></p>
                  </div>
                  <div style="background-color:#f3f4f6;border-left:4px solid #6b7280;padding:12px 16px;border-radius:0 8px 8px 0;">
                    <p style="color:#4b5563;font-size:14px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af;font-size:13px;margin:0;">© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `🔑 Reset Your Password - ${storeName}`,
    html,
  });
};

// Test SMTP connection
export const testEmailConnection = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️  Email credentials not configured");
      console.log("⚠️  Emails will fallback to console logging.");
    }
    return false;
  }

  try {
    await transporter.verify();
    console.log("✅ SMTP connection successful. Ready to send emails!");
    return true;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ SMTP connection failed:", err.message);
      console.log("⚠️ Emails will fallback to console logging.");
    } else {
      console.log("⚠️  Email service unavailable - using fallback");
    }
    return false;
  }
};
