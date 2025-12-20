import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

let transporter;

const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify connection
    transporter.verify((err) => {
      if (err) {
        console.log("❌ SMTP connection failed:", err.message);
      } else {
        console.log("✅ Brevo SMTP ready");
      }
    });
  } else {
    console.log("⚠️ SMTP credentials not configured");
  }
};

createTransporter();

// Generic send function
export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log("⚠️ Email transporter not ready, retrying...");
    await createTransporter();
  }

  if (!transporter) {
    console.error("❌ Email service unavailable");
    throw new Error("Email service unavailable");
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@test.com",
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to: ${to}`);

    // If using Ethereal, show preview URL
    if (info.messageId && info.envelope) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📧 Preview URL: ${previewUrl}`);
      }
    }
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw new Error("Failed to send email");
  }
};

// Verification email - Gmail optimized
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
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border:1px solid #e5e7eb;">
          
          <!-- Purple Header -->
          <tr>
            <td align="center" bgcolor="#7c3aed" style="padding:40px 20px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size:50px; padding-bottom:15px;">✨</td>
                </tr>
                <tr>
                  <td align="center" style="color:#ffffff; font-size:26px; font-weight:bold;">Welcome to ${storeName}!</td>
                </tr>
                <tr>
                  <td align="center" style="color:#e9d5ff; font-size:16px; padding-top:8px;">Just one more step to get started</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:40px 30px;">
              
              <!-- Welcome Text -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="color:#374151; font-size:16px; line-height:24px; padding-bottom:30px;">
                    Hey there! 👋 We're excited to have you join us.<br>
                    Please verify your email to unlock all features.
                  </td>
                </tr>
              </table>
              
              <!-- Button Box -->
              <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f5f3ff" style="border:2px solid #c4b5fd;">
                <tr>
                  <td align="center" style="padding:30px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="color:#6d28d9; font-size:12px; font-weight:bold; letter-spacing:1px; padding-bottom:20px;">
                          🎯 CLICK TO VERIFY
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" bgcolor="#7c3aed" style="padding:16px 40px;">
                                <a href="${verificationUrl}" target="_blank" style="color:#ffffff; font-size:16px; font-weight:bold; text-decoration:none; display:block;">
                                  ✓ Verify My Email
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:25px 0;">
                <tr>
                  <td style="border-bottom:1px solid #e5e7eb; width:45%;"></td>
                  <td align="center" style="color:#9ca3af; font-size:12px; width:10%;">or</td>
                  <td style="border-bottom:1px solid #e5e7eb; width:45%;"></td>
                </tr>
              </table>
              
              <!-- Link Fallback -->
              <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f9fafb">
                <tr>
                  <td style="padding:20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280; font-size:13px; font-weight:bold; padding-bottom:10px;">
                          📋 Copy this link to your browser:
                        </td>
                      </tr>
                      <tr>
                        <td bgcolor="#ffffff" style="padding:12px; border:1px dashed #d1d5db; color:#7c3aed; font-size:12px; word-break:break-all;">
                          ${verificationUrl}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Timer Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:25px;">
                <tr>
                  <td bgcolor="#fef3c7" style="border-left:4px solid #f59e0b; padding:15px 20px;">
                    <span style="color:#92400e; font-size:14px; font-weight:bold;">
                      ⏰ Hurry! This link expires in 15 minutes
                    </span>
                  </td>
                </tr>
              </table>
              
              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0fdf4" style="margin-top:25px;">
                <tr>
                  <td style="padding:20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#166534; font-size:14px; font-weight:bold; padding-bottom:15px;">
                          🎁 What you'll get after verification:
                        </td>
                      </tr>
                      <tr><td style="color:#15803d; font-size:14px; padding:5px 0;">✅ Access to exclusive deals</td></tr>
                      <tr><td style="color:#15803d; font-size:14px; padding:5px 0;">✅ Track your orders in real-time</td></tr>
                      <tr><td style="color:#15803d; font-size:14px; padding:5px 0;">✅ Save items to your wishlist</td></tr>
                      <tr><td style="color:#15803d; font-size:14px; padding:5px 0;">✅ Faster checkout experience</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#f9fafb" style="padding:25px; border-top:1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="color:#6b7280; font-size:13px; padding-bottom:8px;">
                    Didn't create an account? Just ignore this email.
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color:#9ca3af; font-size:12px;">
                    © ${new Date().getFullYear()} ${storeName} • Made with ❤️ in Nepal
                  </td>
                </tr>
              </table>
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
    subject: `✨ Verify Your Email - Welcome to ${storeName}!`,
    html,
  });
};

// OTP email
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
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#10b981 0%,#059669 50%,#047857 100%);padding:40px 40px 30px;text-align:center;">
                  <div style="width:80px;height:80px;background-color:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:40px;">🔐</span>
                  </div>
                  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Login Verification</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Your One-Time Password</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;text-align:center;">
                    Use this code to complete your login:
                  </p>
                  <!-- OTP Box -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding:20px 0 30px;">
                        <div style="display:inline-block;background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border:2px solid #10b981;border-radius:16px;padding:20px 30px;">
                          <table cellpadding="0" cellspacing="8">
                            <tr>
                              ${otpDigits
                                .map(
                                  (digit) => `
                                <td style="width:50px;height:60px;background-color:#ffffff;border:2px solid #10b981;border-radius:12px;text-align:center;font-size:32px;font-weight:700;color:#059669;box-shadow:0 2px 4px rgba(16,185,129,0.2);">
                                  ${digit}
                                </td>
                              `
                                )
                                .join("")}
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <!-- Warning -->
                  <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
                    <p style="color:#92400e;font-size:14px;margin:0;">
                      ⏰ This code expires in <strong>10 minutes</strong>
                    </p>
                  </div>
                  <!-- Security Notice -->
                  <div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
                    <p style="color:#991b1b;font-size:14px;margin:0;">
                      🔒 Never share this code with anyone. Our team will never ask for it.
                    </p>
                  </div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af;font-size:13px;margin:0 0 10px;">
                    If you didn't try to login, please secure your account immediately.
                  </p>
                  <p style="color:#9ca3af;font-size:13px;margin:0;">
                    © ${new Date().getFullYear()} ${storeName}. All rights reserved.
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

  await sendEmail({
    to: email,
    subject: `🔐 Your Login OTP: ${otp} - ${storeName}`,
    html,
  });
};

// Test connection
export const testEmailConnection = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("⚠️ SMTP credentials not configured");
    return false;
  }

  if (transporter) {
    console.log("✅ Email server ready");
    return true;
  }

  return false;
};
