import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); // must be at top

let transporter = null;

// Lazy transporter creation
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // 587 TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Gmail App Password
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });
  }
  return transporter;
};

// Generic send email
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to: ${to}`);
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ Dev mode - email fallback, content below:\n", html);
    }
  }
};

// Send OTP Email
export const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
      <h2 style="color:#7c3aed;">🔐 Login Verification</h2>
      <p>Your OTP code is:</p>
      <div style="background:#f3f4f6;padding:20px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#7c3aed;">
        ${otp}
      </div>
      <p style="color:#6b7280;margin-top:20px;">This code expires in 15 minutes.</p>
      <p style="color:#ef4444;font-size:12px;">Never share this code with anyone.</p>
    </div>
  `;
  await sendEmail({ to: email, subject: `🔐 Your OTP: ${otp}`, html });
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
      <h2 style="color:#7c3aed;">🔑 Password Reset</h2>
      <p>Click the button below to reset your password:</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${resetUrl}" style="background:#7c3aed;color:white;padding:12px 30px;text-decoration:none;border-radius:6px;font-weight:bold;">
          Reset Password
        </a>
      </div>
      <p style="color:#6b7280;">Or copy this link: ${resetUrl}</p>
      <p style="color:#ef4444;font-size:12px;">This link expires in 15 minutes.</p>
    </div>
  `;
  await sendEmail({ to: email, subject: "🔑 Password Reset Request", html });
};

// Test SMTP connection
export const testEmailConnection = async () => {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log("✅ SMTP Auth successful!");
  } catch (err) {
    console.error("❌ SMTP Auth failed:", err.message);
  }
};

export default sendEmail;
