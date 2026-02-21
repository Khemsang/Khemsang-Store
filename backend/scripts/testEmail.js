import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("📧 Testing Email Configuration...\n");

// Check environment variables
console.log("Environment Variables:");
console.log("SMTP_USER:", process.env.SMTP_USER || "❌ NOT SET");
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "✅ SET" : "❌ NOT SET");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "❌ NOT SET");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "❌ NOT SET");
console.log("");

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error("❌ Email configuration incomplete!");
  console.log("\nPlease set the following in .env file:");
  console.log("SMTP_USER=your-email@gmail.com");
  console.log("SMTP_PASS=your-16-char-app-password");
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
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
});

// Test email
const testEmail = async () => {
  try {
    console.log("🔄 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!\n");

    console.log("📤 Sending test email...");
    const info = await transporter.sendMail({
      from: `"Khemsang Store Test" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: "✅ Test Email - Khemsang Store",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px; }
            .success { color: #10b981; font-size: 48px; text-align: center; }
            h1 { color: #333; text-align: center; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅</div>
            <h1>Email Configuration Working!</h1>
            <p>यो test email हो। तपाईंको email configuration सही तरिकाले काम गरिरहेको छ।</p>
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>SMTP User: ${process.env.SMTP_USER}</li>
              <li>Email From: ${process.env.EMAIL_FROM || process.env.SMTP_USER}</li>
              <li>Frontend URL: ${process.env.FRONTEND_URL}</li>
            </ul>
            <p>अब तपाईं verification emails पठाउन सक्नुहुन्छ!</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("\n📧 Check your inbox:", process.env.SMTP_USER);
    console.log("\n✅ Email configuration is working correctly!");
  } catch (error) {
    console.error("\n❌ Email test failed!");
    console.error("Error:", error.message);
    
    if (error.message.includes("Invalid login")) {
      console.log("\n💡 Troubleshooting:");
      console.log("1. Make sure you're using Gmail App Password, not regular password");
      console.log("2. Generate App Password: https://myaccount.google.com/apppasswords");
      console.log("3. Enable 2-Step Verification first");
      console.log("4. Copy the 16-character password (without spaces)");
    }
    
    process.exit(1);
  }
};

testEmail();
