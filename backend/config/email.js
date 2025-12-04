import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); // Must be first

// Create transporter with Gmail service
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Generic send function
export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ SMTP credentials missing in .env");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw new Error("Failed to send email");
  }
};

// Verification email
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <h2>Welcome!</h2>
      <p>Click below to verify your email:</p>
      <a href="${verificationUrl}" style="padding:12px 24px;background-color:#4F46E5;color:white;text-decoration:none;border-radius:5px;">Verify Email</a>
      <p>Or paste this link: ${verificationUrl}</p>
    </div>
  `;

  await sendEmail({ to: email, subject: "Verify Your Email", html });
};

// OTP email
export const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <h2>Login OTP</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>Expires in 10 minutes</p>
    </div>
  `;
  await sendEmail({ to: email, subject: "Login OTP", html });
};

// Test connection
export const testEmailConnection = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️  Email credentials not configured");
      console.log("⚠️  In development, tokens/OTPs will be shown in console.");
    }
    return false;
  }

  try {
    await transporter.verify();
    console.log("✅ Email server ready");
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Email server connection failed:", error.message);
      console.log("⚠️  In development, tokens/OTPs will be shown in console.");
    } else {
      // In production, just log once without details
      console.log("⚠️  Email service unavailable - using fallback");
    }
    return false;
  }
};
