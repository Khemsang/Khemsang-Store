import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import crypto from "crypto";
import { sendSuperAdminPasswordResetEmail } from "./src/services/emailService.js";

dotenv.config();

async function superAdminResetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to MongoDB");

    const superAdminEmail = "khemsangrai@gmail.com";
    
    // Find super admin
    const superAdmin = await User.findOne({ 
      email: superAdminEmail, 
      isSuperAdmin: true 
    });

    if (!superAdmin) {
      console.log("❌ Super Admin not found with email:", superAdminEmail);
      process.exit(1);
    }

    console.log("👤 Super Admin found:", superAdmin.name);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    superAdmin.resetPasswordToken = resetToken;
    superAdmin.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await superAdmin.save();

    console.log("🔑 Password reset token generated");
    console.log("⏰ Token expires in 30 minutes");

    // Try to send email
    try {
      await sendSuperAdminPasswordResetEmail(superAdminEmail, resetToken);
      console.log("✅ Password reset email sent to:", superAdminEmail);
      console.log("📧 Check your email for the reset link");
    } catch (emailError) {
      console.log("❌ Failed to send email:", emailError.message);
      console.log("🔗 Manual reset URL:");
      console.log(`${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
      console.log("\n📋 Reset Token (for manual use):");
      console.log(resetToken);
    }

    console.log("\n✅ Super Admin password reset initiated successfully!");
    console.log("🔒 Use the link/token to set a new password");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
superAdminResetPassword();