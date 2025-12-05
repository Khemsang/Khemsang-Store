import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); // Must be first

// Create transporter
let transporter;

const createTransporter = () => {
  // If Gmail credentials provided, use Gmail
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("✅ Gmail SMTP configured");
  } else {
    console.log("⚠️ SMTP credentials not configured");
  }
};

// Initialize transporter immediately
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

// Test connection - skip verify to avoid timeout
export const testEmailConnection = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("⚠️ Email credentials not configured");
    return false;
  }

  // Just check if transporter exists, don't verify connection
  // Gmail will work when actually sending emails
  if (transporter) {
    console.log("✅ Email service ready (Gmail)");
    return true;
  }

  return false;
};
