import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import readline from "readline";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function changeSuperAdminPassword() {
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
    console.log("📧 Email:", superAdmin.email);
    console.log("");

    // Ask for new password
    const newPassword = await askQuestion("🔒 Enter new password for Super Admin: ");
    
    if (!newPassword || newPassword.length < 6) {
      console.log("❌ Password must be at least 6 characters long");
      process.exit(1);
    }

    // Confirm password
    const confirmPassword = await askQuestion("🔒 Confirm new password: ");
    
    if (newPassword !== confirmPassword) {
      console.log("❌ Passwords do not match");
      process.exit(1);
    }

    // Update password
    superAdmin.password = newPassword;
    
    // Clear any existing reset tokens
    superAdmin.resetPasswordToken = undefined;
    superAdmin.resetPasswordExpires = undefined;
    
    await superAdmin.save();

    console.log("");
    console.log("✅ Super Admin password changed successfully!");
    console.log("🔐 You can now login with the new password");
    console.log("📧 Email:", superAdminEmail);
    console.log("🔑 Password: [HIDDEN]");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
changeSuperAdminPassword();