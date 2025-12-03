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

  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
      <h2>Welcome to Furniture Store!</h2>
      <p>Please verify your email address by clicking below:</p>
      <a href="${verificationUrl}" style="display:inline-block; padding:12px 24px; background:#4F46E5; color:white; text-decoration:none; border-radius:5px;">Verify Email</a>
      <p>Or paste this link in your browser: <br/>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Verify Your Email - Furniture Store",
    html,
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
      <h2>Login Verification</h2>
      <p>Your OTP is:</p>
      <h1 style="color:#4F46E5; font-size:32px; letter-spacing:5px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't try to login, secure your account immediately.</p>
    </div>
  `;

  await sendEmail({ to: email, subject: "Login OTP - Furniture Store", html });
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
