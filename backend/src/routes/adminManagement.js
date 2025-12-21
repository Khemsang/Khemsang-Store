import express from "express";
import User from "../models/User.js";
import AdminLog from "../models/AdminLog.js";
import SiteSettings from "../models/SiteSettings.js";
import { auth, isSuperAdmin } from "../middleware/auth.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Helper function to send admin block notification email
const sendAdminBlockEmail = async (adminEmail, adminName, reason = "") => {
  const storeName = "Khemsang Store";
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
                <td style="background:linear-gradient(135deg,#ef4444 0%,#dc2626 50%,#b91c1c 100%);padding:40px 40px 30px;text-align:center;">
                  <div style="width:80px;height:80px;background-color:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:40px;">🚫</span>
                  </div>
                  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Account Suspended</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Admin Access Revoked</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">
                    Dear <strong>${adminName}</strong>,
                  </p>
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">
                    Your admin account on <strong>${storeName}</strong> has been <span style="color:#ef4444;font-weight:bold;">suspended</span> by the Super Admin.
                  </p>
                  
                  <!-- Warning Box -->
                  <div style="background-color:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin:20px 0;">
                    <p style="color:#991b1b;font-size:15px;margin:0 0 10px;font-weight:600;">
                      ⚠️ What this means:
                    </p>
                    <ul style="color:#7f1d1d;font-size:14px;margin:0;padding-left:20px;line-height:1.8;">
                      <li>You cannot login to the admin panel</li>
                      <li>Your products remain visible but you cannot manage them</li>
                      <li>All admin privileges are temporarily revoked</li>
                    </ul>
                  </div>

                  ${
                    reason
                      ? `
                  <div style="background-color:#f3f4f6;border-left:4px solid #6b7280;padding:12px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
                    <p style="color:#374151;font-size:14px;margin:0;">
                      <strong>Reason:</strong> ${reason}
                    </p>
                  </div>
                  `
                      : ""
                  }

                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:20px 0 0;">
                    If you believe this is a mistake, please contact the Super Admin for assistance.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af;font-size:13px;margin:0 0 10px;">
                    This is an automated notification from ${storeName}
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

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${
        process.env.GMAIL_USER
      }>`,
      to: adminEmail,
      subject: `🚫 Your Admin Account Has Been Suspended - ${storeName}`,
      html,
    });
    console.log(`✅ Block email sent to ${adminEmail}`);
  } catch (err) {
    console.error("Failed to send block notification email:", err.message);
  }
};

// Helper function to send admin unblock notification email
const sendAdminUnblockEmail = async (adminEmail, adminName) => {
  const storeName = "Khemsang Store";
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
                    <span style="font-size:40px;">✅</span>
                  </div>
                  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Account Reactivated</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Welcome Back!</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">
                    Dear <strong>${adminName}</strong>,
                  </p>
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">
                    Great news! Your admin account on <strong>${storeName}</strong> has been <span style="color:#10b981;font-weight:bold;">reactivated</span>.
                  </p>
                  
                  <!-- Success Box -->
                  <div style="background-color:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:20px;margin:20px 0;">
                    <p style="color:#166534;font-size:15px;margin:0 0 10px;font-weight:600;">
                      ✨ You can now:
                    </p>
                    <ul style="color:#15803d;font-size:14px;margin:0;padding-left:20px;line-height:1.8;">
                      <li>Login to the admin panel</li>
                      <li>Manage your products and orders</li>
                      <li>Access all admin features</li>
                    </ul>
                  </div>

                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:20px 0 0;">
                    Thank you for your patience. We look forward to your continued partnership!
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
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

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${
        process.env.GMAIL_USER
      }>`,
      to: adminEmail,
      subject: `✅ Your Admin Account Has Been Reactivated - ${storeName}`,
      html,
    });
    console.log(`✅ Unblock email sent to ${adminEmail}`);
  } catch (err) {
    console.error("Failed to send unblock notification email:", err.message);
  }
};

// Helper function to send password reset notification email
const sendPasswordResetNotificationEmail = async (
  adminEmail,
  adminName,
  newPassword
) => {
  const storeName = "Khemsang Store";
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
                <td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 50%,#b45309 100%);padding:40px 40px 30px;text-align:center;">
                  <div style="width:80px;height:80px;background-color:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:40px;">🔑</span>
                  </div>
                  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Password Reset</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Your password has been changed</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">
                    Dear <strong>${adminName}</strong>,
                  </p>
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">
                    Your password for <strong>${storeName}</strong> admin panel has been reset by the Super Admin.
                  </p>
                  
                  <!-- New Password Box -->
                  <div style="background-color:#fef3c7;border:2px solid #fbbf24;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
                    <p style="color:#92400e;font-size:14px;margin:0 0 10px;font-weight:600;">
                      Your New Password:
                    </p>
                    <div style="background-color:#ffffff;border:2px dashed #f59e0b;border-radius:8px;padding:15px;font-size:24px;font-weight:bold;color:#b45309;letter-spacing:2px;">
                      ${newPassword}
                    </div>
                  </div>

                  <!-- Warning -->
                  <div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
                    <p style="color:#991b1b;font-size:14px;margin:0;">
                      🔒 Please change this password immediately after logging in for security.
                    </p>
                  </div>

                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:20px 0 0;">
                    If you did not request this change, please contact the Super Admin immediately.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
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

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${
        process.env.GMAIL_USER
      }>`,
      to: adminEmail,
      subject: `🔑 Your Password Has Been Reset - ${storeName}`,
      html,
    });
    console.log(`✅ Password reset email sent to ${adminEmail}`);
  } catch (err) {
    console.error(
      "Failed to send password reset notification email:",
      err.message
    );
  }
};

// Helper function to send warning notification email
const sendAdminWarningEmail = async (adminEmail, adminName, warningMessage) => {
  const storeName = "Khemsang Store";
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
                <td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 50%,#b45309 100%);padding:40px 40px 30px;text-align:center;">
                  <div style="width:80px;height:80px;background-color:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:40px;">⚠️</span>
                  </div>
                  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Warning Notice</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Important message from Super Admin</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">
                    Dear <strong>${adminName}</strong>,
                  </p>
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">
                    You have received a <span style="color:#f59e0b;font-weight:bold;">warning</span> from the Super Admin at <strong>${storeName}</strong>.
                  </p>
                  
                  <!-- Warning Message Box -->
                  <div style="background-color:#fef3c7;border:2px solid #fbbf24;border-radius:12px;padding:20px;margin:20px 0;">
                    <p style="color:#92400e;font-size:14px;margin:0 0 10px;font-weight:600;">
                      ⚠️ Warning Message:
                    </p>
                    <div style="background-color:#ffffff;border-left:4px solid #f59e0b;padding:15px;border-radius:0 8px 8px 0;">
                      <p style="color:#374151;font-size:15px;margin:0;line-height:1.6;">
                        ${warningMessage}
                      </p>
                    </div>
                  </div>

                  <!-- Notice -->
                  <div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:0 8px 8px 0;margin:20px 0;">
                    <p style="color:#991b1b;font-size:14px;margin:0;">
                      ⚡ Please take this warning seriously. Multiple warnings may result in account suspension.
                    </p>
                  </div>

                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:20px 0 0;">
                    If you have any questions, please contact the Super Admin.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af;font-size:13px;margin:0 0 10px;">
                    This is an official warning from ${storeName}
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

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${
        process.env.GMAIL_USER
      }>`,
      to: adminEmail,
      subject: `⚠️ Warning Notice - ${storeName}`,
      html,
    });
    console.log(`✅ Warning email sent to ${adminEmail}`);
  } catch (err) {
    console.error("Failed to send warning notification email:", err.message);
  }
};

// Helper function to log admin actions
const logAdminAction = async (
  adminId,
  action,
  actionType,
  targetType,
  targetId,
  details,
  req
) => {
  try {
    await AdminLog.create({
      admin: adminId,
      action,
      actionType,
      targetType,
      targetId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (err) {
    console.error("Failed to log admin action:", err);
  }
};

// ==================== ADMIN MANAGEMENT ====================

// Get all admins (Super Admin only)
router.get("/admins", auth, isSuperAdmin, async (req, res) => {
  try {
    const admins = await User.find({
      isAdmin: true,
      isSuperAdmin: { $ne: true },
    })
      .select("-password -verificationToken -resetPasswordToken")
      .sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get admin stats
router.get("/stats", auth, isSuperAdmin, async (req, res) => {
  try {
    const totalAdmins = await User.countDocuments({
      isAdmin: true,
      isSuperAdmin: { $ne: true },
    });
    const activeAdmins = await User.countDocuments({
      isAdmin: true,
      isSuperAdmin: { $ne: true },
      adminStatus: "active",
    });
    const suspendedAdmins = await User.countDocuments({
      isAdmin: true,
      adminStatus: "suspended",
    });
    const totalUsers = await User.countDocuments({ isAdmin: false });

    res.json({ totalAdmins, activeAdmins, suspendedAdmins, totalUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new admin
router.post("/create-admin", auth, isSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, adminRole, permissions } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const newAdmin = new User({
      name,
      email,
      password,
      phone,
      isAdmin: true,
      isVerified: true,
      adminRole: adminRole || "admin",
      adminStatus: "active",
      permissions: permissions || undefined,
      createdBy: req.user._id,
    });

    await newAdmin.save();

    await logAdminAction(
      req.user._id,
      `Created new admin: ${name}`,
      "admin_create",
      "admin",
      newAdmin._id,
      { email },
      req
    );

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        adminRole: newAdmin.adminRole,
        permissions: newAdmin.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update admin permissions
router.put("/permissions/:userId", auth, isSuperAdmin, async (req, res) => {
  try {
    const { permissions, adminRole } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isSuperAdmin)
      return res.status(400).json({ message: "Cannot modify Super Admin" });

    if (permissions) user.permissions = permissions;
    if (adminRole) user.adminRole = adminRole;

    await user.save();

    await logAdminAction(
      req.user._id,
      `Updated permissions for: ${user.name}`,
      "admin_update",
      "admin",
      user._id,
      { permissions, adminRole },
      req
    );

    res.json({ message: "Permissions updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Promote user to admin
router.put("/promote/:userId", auth, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isSuperAdmin)
      return res.status(400).json({ message: "Cannot modify Super Admin" });

    user.isAdmin = true;
    user.adminStatus = "active";
    user.adminRole = "admin";
    user.createdBy = req.user._id;
    await user.save();

    await logAdminAction(
      req.user._id,
      `Promoted user to admin: ${user.name}`,
      "admin_create",
      "admin",
      user._id,
      {},
      req
    );

    res.json({ message: "User promoted to admin successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Demote admin to user
router.put("/demote/:userId", auth, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isSuperAdmin)
      return res.status(400).json({ message: "Cannot demote Super Admin" });

    user.isAdmin = false;
    user.adminStatus = "active";
    user.adminRole = undefined;
    user.permissions = undefined;
    await user.save();

    await logAdminAction(
      req.user._id,
      `Demoted admin to user: ${user.name}`,
      "admin_delete",
      "admin",
      user._id,
      {},
      req
    );

    res.json({ message: "Admin demoted to user successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Suspend admin (blocks account + sends email notification)
router.put("/suspend/:userId", auth, isSuperAdmin, async (req, res) => {
  try {
    const { reason, duration } = req.body; // duration in days (0 = permanent)
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isSuperAdmin)
      return res.status(400).json({ message: "Cannot suspend Super Admin" });

    user.adminStatus = "suspended";
    user.isBlocked = true;
    user.suspendedAt = new Date();
    user.suspendReason = reason || "No reason provided";

    // Set suspension end date if duration provided
    if (duration && duration > 0) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(duration));
      user.suspendedUntil = endDate;
    } else {
      user.suspendedUntil = null; // Permanent suspension
    }

    await user.save();

    // Send email notification
    await sendAdminBlockEmail(user.email, user.name, reason);

    await logAdminAction(
      req.user._id,
      `Suspended admin: ${user.name}`,
      "admin_update",
      "admin",
      user._id,
      { status: "suspended", reason, duration },
      req
    );

    res.json({ message: "Admin suspended and notified via email", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Activate admin (unblocks account + sends email notification)
router.put("/activate/:userId", auth, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.adminStatus = "active";
    user.isBlocked = false;
    user.suspendedAt = null;
    user.suspendedUntil = null;
    user.suspendReason = null;
    await user.save();

    // Send email notification
    await sendAdminUnblockEmail(user.email, user.name);

    await logAdminAction(
      req.user._id,
      `Activated admin: ${user.name}`,
      "admin_update",
      "admin",
      user._id,
      { status: "active" },
      req
    );

    res.json({ message: "Admin activated and notified via email", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single admin details
router.get("/admin/:userId", auth, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password -verificationToken -resetPasswordToken")
      .populate("createdBy", "name email")
      .populate("warnings.issuedBy", "name email");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Warning to admin (Super Admin only)
router.put("/warn/:userId", auth, isSuperAdmin, async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isSuperAdmin)
      return res.status(400).json({ message: "Cannot warn Super Admin" });

    // Add warning to user's warnings array
    if (!user.warnings) user.warnings = [];
    user.warnings.push({
      message,
      date: new Date(),
      issuedBy: req.user._id,
    });
    await user.save();

    // Send warning email notification
    await sendAdminWarningEmail(user.email, user.name, message);

    await logAdminAction(
      req.user._id,
      `Issued warning to: ${user.name}`,
      "admin_update",
      "admin",
      user._id,
      { warning: message },
      req
    );

    res.json({
      message: "Warning issued successfully. Email notification sent!",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset admin password (Super Admin only)
router.put("/reset-password/:userId", auth, isSuperAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isSuperAdmin)
      return res
        .status(400)
        .json({ message: "Cannot reset Super Admin password from here" });

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Send email notification with new password
    await sendPasswordResetNotificationEmail(
      user.email,
      user.name,
      newPassword
    );

    await logAdminAction(
      req.user._id,
      `Reset password for: ${user.name}`,
      "admin_update",
      "admin",
      user._id,
      { action: "password_reset" },
      req
    );

    res.json({
      message: "Password reset successfully. Email notification sent to admin.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all regular users
router.get("/users", auth, isSuperAdmin, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select("-password -verificationToken -resetPasswordToken")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Block user
router.put("/block-user/:userId", auth, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = true;
    await user.save();

    await logAdminAction(
      req.user._id,
      `Blocked user: ${user.name}`,
      "user_block",
      "user",
      user._id,
      {},
      req
    );

    res.json({ message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unblock user
router.put("/unblock-user/:userId", auth, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = false;
    await user.save();

    await logAdminAction(
      req.user._id,
      `Unblocked user: ${user.name}`,
      "user_unblock",
      "user",
      user._id,
      {},
      req
    );

    res.json({ message: "User unblocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SITE SETTINGS ====================

// Get maintenance status (PUBLIC - no auth required)
router.get("/maintenance-status", async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();
    res.json({
      maintenanceMode: settings?.maintenanceMode || false,
      maintenanceMessage:
        settings?.maintenanceMessage ||
        "We are currently performing maintenance. Please check back soon!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get site settings
router.get("/settings", auth, isSuperAdmin, async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update site settings
router.put("/settings", auth, isSuperAdmin, async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    await logAdminAction(
      req.user._id,
      "Updated site settings",
      "settings_update",
      "settings",
      settings._id,
      req.body,
      req
    );

    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle maintenance mode
router.put("/maintenance", auth, isSuperAdmin, async (req, res) => {
  try {
    const { enabled, message } = req.body;
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }
    settings.maintenanceMode = enabled;
    if (message) settings.maintenanceMessage = message;
    await settings.save();

    await logAdminAction(
      req.user._id,
      `${enabled ? "Enabled" : "Disabled"} maintenance mode`,
      "settings_update",
      "settings",
      settings._id,
      { maintenanceMode: enabled },
      req
    );

    res.json({
      message: `Maintenance mode ${enabled ? "enabled" : "disabled"}`,
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ADMIN ACTIVITY LOGS ====================

// Get all admin activities
router.get("/activities", auth, isSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, adminId, actionType } = req.query;
    const query = {};

    if (adminId) query.admin = adminId;
    if (actionType) query.actionType = actionType;

    const activities = await AdminLog.find(query)
      .populate("admin", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await AdminLog.countDocuments(query);

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific admin's activities
router.get("/activities/:adminId", auth, isSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const activities = await AdminLog.find({ admin: req.params.adminId })
      .populate("admin", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await AdminLog.countDocuments({ admin: req.params.adminId });

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activity stats
router.get("/activity-stats", auth, isSuperAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = await AdminLog.countDocuments({
      createdAt: { $gte: today },
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekActivities = await AdminLog.countDocuments({
      createdAt: { $gte: weekAgo },
    });

    const actionTypeCounts = await AdminLog.aggregate([
      { $group: { _id: "$actionType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      todayActivities,
      weekActivities,
      actionTypeCounts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
