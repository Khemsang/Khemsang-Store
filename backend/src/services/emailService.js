import nodemailer from "nodemailer";

// Create transporter with better configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // For development
    },
  });
};

// Send verification email
export const sendVerificationEmail = async (email, token) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${
      process.env.EMAIL_FROM || process.env.SMTP_USER
    }>`,
    to: email,
    subject: "✅ Verify Your Email Address - Khemsang Store",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content { 
            background: #ffffff; 
            padding: 40px 30px;
          }
          .content h2 {
            color: #10b981;
            font-size: 22px;
            margin-top: 0;
          }
          .content p {
            font-size: 16px;
            color: #555;
            margin: 15px 0;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button { 
            display: inline-block; 
            padding: 16px 40px; 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white !important; 
            text-decoration: none; 
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          }
          .info-box {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .info-box p {
            margin: 5px 0;
            font-size: 14px;
            color: #065f46;
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
            background-color: #f9fafb;
            color: #6b7280; 
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 5px 0;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 30px 0;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="icon">🎉</div>
            <h1>Welcome to Khemsang Store!</h1>
            <p>You're just one step away from getting started</p>
          </div>
          
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up! To complete your registration and start shopping, please verify your email address by clicking the button below:</p>
            
            <div class="button-container">
              <a href="${verificationUrl}" class="button">✅ Verify Email Address</a>
            </div>
            
            <div class="info-box">
              <p><strong>⏰ Important:</strong> This verification link will expire in 15 minutes.</p>
              <p><strong>🔒 Security:</strong> If you didn't create this account, please ignore this email.</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #6b7280;">
              <strong>Button not working?</strong> Copy and paste this link into your browser:
            </p>
            <p style="font-size: 13px; color: #10b981; word-break: break-all; background: #f0fdf4; padding: 12px; border-radius: 6px; font-family: monospace;">
              ${verificationUrl}
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Khemsang Store</strong></p>
            <p>Your trusted online furniture store</p>
            <p style="margin-top: 15px;">
              Need help? Contact us at <a href="mailto:${process.env.EMAIL_FROM || process.env.SMTP_USER}" style="color: #10b981; text-decoration: none;">${process.env.EMAIL_FROM || process.env.SMTP_USER}</a>
            </p>
            <p style="margin-top: 10px; font-size: 12px; color: #9ca3af;">
              © ${new Date().getFullYear()} Khemsang Store. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${
      process.env.GMAIL_USER
    }>`,
    to: email,
    subject: "Your Login OTP Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .otp { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; padding: 20px; background: white; border-radius: 10px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Login OTP</h1>
          </div>
          <div class="content">
            <p>Your One-Time Password (OTP) for login is:</p>
            <div class="otp">${otp}</div>
            <p>This OTP will expire in 15 minutes.</p>
            <p><strong>Do not share this code with anyone.</strong></p>
          </div>
          <div class="footer">
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${
      process.env.GMAIL_USER
    }>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Password Reset</h1>
          </div>
          <div class="content">
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy this link: <br><small>${resetUrl}</small></p>
            <p>This link will expire in 15 minutes.</p>
          </div>
          <div class="footer">
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send super admin password reset email (special template)
export const sendSuperAdminPasswordResetEmail = async (email, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${
      process.env.GMAIL_USER
    }>`,
    to: email,
    subject: "🔐 Super Admin Password Reset - High Priority",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 40px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
          .warning { background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Super Admin Password Reset</h1>
            <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">High Priority Security Action</p>
          </div>
          <div class="content">
            <div class="warning">
              <p style="color: #991b1b; font-weight: bold; margin: 0 0 10px;">⚠️ SUPER ADMIN SECURITY ALERT</p>
              <p style="color: #7f1d1d; margin: 0; font-size: 14px;">This is a password reset request for the Super Admin account. Only proceed if you initiated this request.</p>
            </div>
            
            <p><strong>Dear Super Admin,</strong></p>
            <p>A password reset has been requested for your Super Admin account. Click the button below to set a new password:</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">🔐 Reset Super Admin Password</a>
            </p>
            
            <p>Or copy this secure link: <br><small style="word-break: break-all;">${resetUrl}</small></p>
            
            <div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;"><strong>Security Details:</strong></p>
              <ul style="margin: 5px 0 0; padding-left: 20px; font-size: 14px;">
                <li>This link expires in <strong>30 minutes</strong></li>
                <li>Can only be used once</li>
                <li>Requires strong password (minimum 8 characters)</li>
              </ul>
            </div>
            
            <p style="color: #dc2626; font-weight: bold;">🚨 If you did not request this password reset, please:</p>
            <ul style="color: #7f1d1d;">
              <li>Do not click the reset link</li>
              <li>Check your system security immediately</li>
              <li>Contact your technical team if available</li>
            </ul>
          </div>
          <div class="footer">
            <p style="color: #dc2626; font-weight: bold;">This is a critical security email for Super Admin access.</p>
            <p>© ${new Date().getFullYear()} ${process.env.STORE_NAME || "Khemsang Store"}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send seller approval email
export const sendSellerApprovalEmail = async (email, sellerName, businessName, approvalNote = "") => {
  const transporter = createTransporter();
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  const mailOptions = {
    from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🎉 Seller Account Approved - Welcome to Our Platform!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .success-box { background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your Seller Account Has Been Approved</p>
          </div>
          <div class="content">
            <p><strong>Dear ${sellerName},</strong></p>
            
            <div class="success-box">
              <p style="color: #065f46; font-weight: bold; margin: 0 0 10px;">✅ ACCOUNT APPROVED</p>
              <p style="color: #047857; margin: 0; font-size: 14px;">Your seller account for <strong>${businessName}</strong> has been successfully approved!</p>
            </div>
            
            <p>We're excited to welcome you to our marketplace! You can now:</p>
            <ul style="color: #374151;">
              <li>✅ Access your seller dashboard</li>
              <li>✅ Add and manage your products</li>
              <li>✅ Process orders from customers</li>
              <li>✅ Track your sales and earnings</li>
              <li>✅ Manage your business profile</li>
            </ul>

            ${approvalNote ? `
            <div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;"><strong>Admin Note:</strong></p>
              <p style="margin: 5px 0 0; font-size: 14px; color: #4b5563;">${approvalNote}</p>
            </div>
            ` : ""}
            
            <p style="text-align: center;">
              <a href="${loginUrl}" class="button">🚀 Access Seller Dashboard</a>
            </p>
            
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #1e40af; font-weight: bold; margin: 0 0 10px;">📋 Next Steps:</p>
              <ol style="color: #1e3a8a; margin: 0; padding-left: 20px;">
                <li>Log in to your seller dashboard</li>
                <li>Complete your business profile</li>
                <li>Add your first products</li>
                <li>Set up your payment information</li>
                <li>Start selling!</li>
              </ol>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Welcome aboard and happy selling!</p>
          </div>
          <div class="footer">
            <p><strong>The ${process.env.STORE_NAME || "Khemsang Store"} Team</strong></p>
            <p>© ${new Date().getFullYear()} ${process.env.STORE_NAME || "Khemsang Store"}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send seller rejection email
export const sendSellerRejectionEmail = async (email, sellerName, businessName, rejectionReason) => {
  const transporter = createTransporter();
  const supportUrl = `${process.env.FRONTEND_URL}/contact`;

  const mailOptions = {
    from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Seller Application Update - Action Required",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .warning-box { background: #fef3c7; border: 2px solid #fcd34d; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Application Update</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Seller Account Review Complete</p>
          </div>
          <div class="content">
            <p><strong>Dear ${sellerName},</strong></p>
            
            <p>Thank you for your interest in becoming a seller on our platform. We have completed the review of your application for <strong>${businessName}</strong>.</p>
            
            <div class="warning-box">
              <p style="color: #92400e; font-weight: bold; margin: 0 0 10px;">⚠️ APPLICATION REQUIRES ATTENTION</p>
              <p style="color: #a16207; margin: 0; font-size: 14px;">Unfortunately, we cannot approve your seller account at this time.</p>
            </div>
            
            <div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;"><strong>Reason for Review:</strong></p>
              <p style="margin: 5px 0 0; font-size: 14px; color: #4b5563;">${rejectionReason}</p>
            </div>
            
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #1e40af; font-weight: bold; margin: 0 0 10px;">🔄 What You Can Do:</p>
              <ul style="color: #1e3a8a; margin: 0; padding-left: 20px;">
                <li>Review the feedback provided above</li>
                <li>Address the mentioned concerns</li>
                <li>Submit a new application with updated information</li>
                <li>Contact our support team for clarification</li>
              </ul>
            </div>
            
            <p>We encourage you to address the feedback and reapply. Our team is here to help you succeed on our platform.</p>
            
            <p style="text-align: center;">
              <a href="${supportUrl}" class="button">📞 Contact Support</a>
            </p>
            
            <p>Thank you for your understanding, and we look forward to potentially working with you in the future.</p>
          </div>
          <div class="footer">
            <p><strong>The ${process.env.STORE_NAME || "Khemsang Store"} Team</strong></p>
            <p>© ${new Date().getFullYear()} ${process.env.STORE_NAME || "Khemsang Store"}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default {
  sendVerificationEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendSuperAdminPasswordResetEmail,
  sendSellerApprovalEmail,
  sendSellerRejectionEmail,
};
