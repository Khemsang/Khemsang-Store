import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); // Must be first

let transporter = null;

// Lazy transporter creation
const getTransporter = () => {
  if (!transporter) {
    // Guard: Don't create transporter if credentials are missing
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP credentials not configured");
    }

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }
  return transporter;
};

// Generic send email
export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("⚠️ SMTP credentials missing - fallback to console logging");
    console.log(`To: ${to}\nSubject: ${subject}\nHTML: ${html}`);
    return;
  }

  // Skip placeholder passwords
  if (
    process.env.SMTP_PASS.includes("YOUR_") ||
    process.env.SMTP_PASS.includes("CHANGE_")
  ) {
    console.log("⚠️ SMTP password is placeholder - email skipped");
    console.log(`To: ${to}\nSubject: ${subject}\nHTML: ${html}`);
    return;
  }

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ Dev mode - fallback to console logging");
      console.log(`To: ${to}\nSubject: ${subject}\nHTML: ${html}`);
    }
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

// Password reset email
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}" style="padding:12px 24px;background-color:#4F46E5;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>Or paste this link: ${resetUrl}</p>
      <p>Expires in 15 minutes</p>
    </div>
  `;
  await sendEmail({ to: email, subject: "Reset Your Password", html });
};

// Test connection
export const testEmailConnection = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("⚠️ SMTP credentials not configured");
    console.log("⚠️ In development, emails will be logged to console");
    return false;
  }

  if (
    process.env.SMTP_PASS.includes("YOUR_") ||
    process.env.SMTP_PASS.includes("CHANGE_")
  ) {
    console.log("⚠️ SMTP password is placeholder - email skipped");
    return false;
  }

  try {
    const transport = getTransporter();
    await transport.verify();
    console.log("✅ SMTP connection successful");
    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:", error.message);
    console.log("⚠️ In development, emails will be logged to console");
    return false;
  }
};
