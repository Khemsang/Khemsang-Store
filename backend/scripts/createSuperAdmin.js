import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Get email and password from command line arguments or use defaults
    const email = process.argv[2] || "cloudsnepal33@gmail.com";
    const password = process.argv[3] || "Admin@123456";

    // Check if super admin already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log("⚠️  User already exists. Updating to super admin...");
      
      existingUser.role = "super-admin";
      existingUser.isSuperAdmin = true;
      existingUser.isAdmin = true;
      existingUser.isVerified = true;
      existingUser.isApproved = true;
      existingUser.adminStatus = "active";
      existingUser.password = password; // Will be hashed by pre-save hook
      
      await existingUser.save();
      console.log("✅ User updated to super admin successfully!");
    } else {
      // Create new super admin
      const superAdmin = await User.create({
        name: "Super Admin",
        email,
        password, // Will be hashed by pre-save hook
        role: "super-admin",
        isSuperAdmin: true,
        isAdmin: true,
        isVerified: true,
        isApproved: true,
        adminStatus: "active",
      });

      console.log("✅ Super admin created successfully!");
      console.log("📧 Email:", superAdmin.email);
      console.log("🔑 Password:", password);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createSuperAdmin();
