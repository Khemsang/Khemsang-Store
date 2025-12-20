import axios from "axios";

/**
 * Brevo API Email Service
 * Uses Brevo's REST API instead of SMTP - no port blocking issues!
 * Get your API key from: https://app.brevo.com/settings/keys/api
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// Send email via Brevo API
const sendEmailViaAPI = async ({ to, subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error("❌ BREVO_API_KEY not configured");
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ Dev mode - email skipped");
      return { success: false, message: "API key missing" };
    }
    throw new Error("Brevo API key not configured");
  }

  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: "Khemsang Store",
          email: process.env.EMAIL_FROM || "noreply@khemsangstore.com",
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Email sent via Brevo API to: ${to}`);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error("❌ Brevo API error:", error.response?.data || error.message);
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ Dev mode - email failed but continuing");
      return { success: false, error: error.message };
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send verification email
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const storeName = "Khemsang Store";

  const htmlContent = `
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
          <tr>
            <td style="padding:40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="color:#374151; font-size:16px; line-height:24px; padding-bottom:30px;">
                    Hey there! 👋 We're excited to have you join us.<br>
                    Please verify your email to unlock all features.
                  </td>
                </tr>
              </table>
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
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:25px 0;">
                <tr>
                  <td style="border-bottom:1px solid #e5e7eb; width:45%;"></td>
                  <td align="center" style="color:#9ca3af; font-size:12px; width:10%;">or</td>
                  <td style="border-bottom:1px solid #e5e7eb; width:45%;"></td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f9fafb">
                <tr>
                  <td style="padding:20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280; font-size:13px; font-weight:bold; padding-bottom:10px;">
                          📋 Copy this link:
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
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:25px;">
                <tr>
                  <td bgcolor="#fef3c7" style="border-left:4px solid #f59e0b; padding:15px 20px;">
                    <span style="color:#92400e; font-size:14px; font-weight:bold;">
                      ⏰ This link expires in 15 minutes
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
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

  return await sendEmailViaAPI({
    to: email,
    subject: `✨ Verify Your Email - Welcome to ${storeName}!`,
    htmlContent,
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  const storeName = "Khemsang Store";
  const otpDigits = otp.toString().split("");

  const htmlContent = `
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
              <div style="width:80px;height:80px;background-color:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 20px;display:inline-block;line-height:80px;">
                <span style="font-size:40px;">🔐</span>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Login Verification</h1>
              <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Your One-Time Password</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;text-align:center;">
                Use this code to complete your login:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:20px 0 30px;">
                    <table cellpadding="0" cellspacing="8" style="display:inline-block;">
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
                  </td>
                </tr>
              </table>
              <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
                <p style="color:#92400e;font-size:14px;margin:0;">
                  ⏰ This code expires in <strong>10 minutes</strong>
                </p>
              </div>
              <div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
                <p style="color:#991b1b;font-size:14px;margin:0;">
                  🔒 Never share this code with anyone.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:13px;margin:0 0 10px;">
                If you didn't try to login, please secure your account.
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

  return await sendEmailViaAPI({
    to: email,
    subject: `🔐 Your Login OTP: ${otp} - ${storeName}`,
    htmlContent,
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const storeName = "Khemsang Store";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e5e7eb;">
          <tr>
            <td align="center" bgcolor="#ef4444" style="padding:40px 20px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size:50px;padding-bottom:15px;">🔑</td>
                </tr>
                <tr>
                  <td align="center" style="color:#ffffff;font-size:26px;font-weight:bold;">Password Reset</td>
                </tr>
                <tr>
                  <td align="center" style="color:#fecaca;font-size:16px;padding-top:8px;">Reset your password securely</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="color:#374151;font-size:16px;line-height:24px;margin:0 0 30px;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#ef4444" style="padding:16px 40px;border-radius:8px;">
                          <a href="${resetUrl}" target="_blank" style="color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;display:block;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f9fafb">
                <tr>
                  <td style="padding:20px;">
                    <p style="color:#6b7280;font-size:13px;font-weight:bold;margin:0 0 10px;">
                      Or copy this link:
                    </p>
                    <p style="color:#7c3aed;font-size:12px;word-break:break-all;margin:0;">
                      ${resetUrl}
                    </p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:25px;">
                <tr>
                  <td bgcolor="#fef3c7" style="border-left:4px solid #f59e0b;padding:15px 20px;">
                    <p style="color:#92400e;font-size:14px;margin:0;">
                      ⏰ This link expires in 15 minutes
                    </p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:15px;">
                <tr>
                  <td bgcolor="#fef2f2" style="border-left:4px solid #ef4444;padding:15px 20px;">
                    <p style="color:#991b1b;font-size:14px;margin:0;">
                      If you didn't request this, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" bgcolor="#f9fafb" style="padding:25px;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} ${storeName} • Made with ❤️ in Nepal
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

  return await sendEmailViaAPI({
    to: email,
    subject: `🔑 Password Reset Request - ${storeName}`,
    htmlContent,
  });
};

export default sendEmailViaAPI;
