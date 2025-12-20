import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "apikey", // ✅ MUST be apikey
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Generic function to send email
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to: ${to}`);
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
    console.log("⚠️ Fallback: email content below\n", html);
  }
};

export default sendEmail;
