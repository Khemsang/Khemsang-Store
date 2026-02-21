import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

async function verifySuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to MongoDB");

    const email = "khemsangrai@gmail.com";
    
    // Find super admin with password field
    const superAdmin = await User.findOne({ email }).select("+password");

    if (!superAdmin) {
      console.log("❌ Super Admin not found!");
      process.exit(1);
    }

    console.log("✅ Super Admin found:");
    console.log("📧 Email:", superAdmin.email);
    console.log("👤 Name:", superAdmin.name);
    console.log("🔐 Is Admin:", superAdmin.isAdmin);
    console.log("🛡️ Is Super Admin:", superAdmin.isSuperAdmin);
    console.log("✅ Is Verified:", superAdmin.isVerified);
    console.log("📊 Admin Status:", superAdmin.adminStatus);
    console.log("🎭 Admin Role:", superAdmin.adminRole);
    console.log("🔒 Has Password:", !!superAdmin.password);
    console.log("🚫 Is Blocked:", superAdmin.isBlocked || false);

    // Test password matching
    const testPassword = "superadmin123";
    const isMatch = await superAdmin.matchPassword(testPassword);
    console.log("🔑 Password Test (superadmin123):", isMatch ? "✅ MATCH" : "❌ NO MATCH");

    if (!isMatch) {
      console.log("\n🔧 Fixing password...");
      superAdmin.password = testPassword;
      await superAdmin.save();
      console.log("✅ Password updated successfully!");
      
      // Test again
      const updatedUser = await User.findOne({ email }).select("+password");
      const newMatch = await updatedUser.matchPassword(testPassword);
      console.log("🔑 Password Test After Update:", newMatch ? "✅ MATCH" : "❌ STILL NO MATCH");
    }

    console.log("\n🎯 Login Credentials:");
    console.log("Email: khemsangrai@gmail.com");
    console.log("Password: superadmin123");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

verifySuperAdmin();