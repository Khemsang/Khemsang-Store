import mongoose from "mongoose";
import User from "../src/models/User.js";

// Use the same connection as the running server
const MONGO_URI = "mongodb://localhost:27017/furnitureDb";

const updateToSuperAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    const email = "cloudsnepal33@gmail.com";
    const password = "cloudsnepal33@gmail.com";

    const user = await User.findOne({ email });
    
    if (user) {
      console.log("⚠️  User found. Updating to super admin...");
      
      user.role = "super-admin";
      user.isSuperAdmin = true;
      user.isAdmin = true;
      user.isVerified = true;
      user.isApproved = true;
      user.adminStatus = "active";
      user.password = password;
      
      await user.save();
      console.log("✅ User updated to super admin successfully!");
      console.log("📧 Email:", email);
      console.log("🔑 Password:", password);
    } else {
      console.log("❌ User not found. Creating new super admin...");
      
      const superAdmin = await User.create({
        name: "Super Admin",
        email,
        password,
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

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

updateToSuperAdmin();
