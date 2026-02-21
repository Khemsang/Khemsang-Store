import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const verifySuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const email = "cloudsnepal33@gmail.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Super admin not found!");
      console.log("Run: npm run create-super-admin");
      process.exit(1);
    }

    console.log("\n📊 Current Super Admin Status:");
    console.log("Email:", user.email);
    console.log("Name:", user.name);
    console.log("Role:", user.role);
    console.log("isSuperAdmin:", user.isSuperAdmin);
    console.log("isAdmin:", user.isAdmin);
    console.log("isVerified:", user.isVerified);
    console.log("adminStatus:", user.adminStatus);

    if (!user.isSuperAdmin || user.role !== "super-admin") {
      console.log("\n⚠️  Fixing super admin fields...");
      
      user.role = "super-admin";
      user.isSuperAdmin = true;
      user.isAdmin = true;
      user.isVerified = true;
      user.isApproved = true;
      user.adminStatus = "active";
      
      await user.save();
      console.log("✅ Super admin fields updated!");
    } else {
      console.log("\n✅ Super admin is properly configured!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

verifySuperAdmin();
