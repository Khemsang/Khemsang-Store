import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to MongoDB");

    const email = "cloudsnepalweb33@gmail.com";
    const password = "cloudsnepalweb33@gmail.com";
    const name = "Clouds Nepal Web";

    const existing = await User.findOne({ email });

    if (existing) {
      console.log("👤 Updating existing Super Admin...");
      existing.name = name;
      existing.password = password;
      existing.role = "super-admin"; // New role system
      existing.isAdmin = true; // Legacy compatibility
      existing.isSuperAdmin = true; // Legacy compatibility
      existing.isVerified = true;
      existing.isApproved = true;
      existing.adminStatus = "active";
      existing.adminRole = "admin";
      
      existing.verificationToken = undefined;
      existing.verificationTokenExpires = undefined;
      
      await existing.save();
      console.log("✅ Super Admin updated successfully!");
    } else {
      console.log("🆕 Creating new Super Admin...");
      const superAdmin = new User({
        name: name,
        email: email,
        password: password,
        role: "super-admin", // New role system
        isAdmin: true, // Legacy compatibility
        isSuperAdmin: true, // Legacy compatibility
        isVerified: true,
        isApproved: true,
        adminStatus: "active",
        adminRole: "admin",
        permissions: {
          products: {
            create: true,
            edit: true,
            delete: true,
          },
          orders: {
            view: true,
            manage: true,
          },
          users: {
            view: true,
            block: true,
          },
          categories: {
            create: true,
            edit: true,
            delete: true,
          },
          banners: {
            manage: true,
          },
          coupons: {
            manage: true,
          },
          reviews: {
            manage: true,
          },
          payments: {
            view: true,
          },
        },
      });
      
      await superAdmin.save();
      console.log("✅ Super Admin created successfully!");
    }

    // Verify the super admin
    const verifyUser = await User.findOne({ email }).select("+password");
    console.log("\n🔍 Super Admin Verification:");
    console.log("📧 Email:", verifyUser.email);
    console.log("👤 Name:", verifyUser.name);
    console.log("🎭 Role:", verifyUser.role);
    console.log("🔐 Is Admin:", verifyUser.isAdmin);
    console.log("🛡️ Is Super Admin:", verifyUser.isSuperAdmin);
    console.log("✅ Is Verified:", verifyUser.isVerified);
    console.log("✅ Is Approved:", verifyUser.isApproved);
    
    console.log("\n🎯 Login Credentials:");
    console.log("Email: cloudsnepalweb33@gmail.com");
    console.log("Password: cloudsnepalweb33@gmail.com");
    console.log("Role: super-admin");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createSuperAdmin();
