import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

async function fixUserRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to MongoDB");

    // Find users with undefined or missing roles
    const usersWithoutRole = await User.find({
      $or: [
        { role: { $exists: false } },
        { role: null },
        { role: "" }
      ]
    });

    console.log(`Found ${usersWithoutRole.length} users without proper roles`);

    for (const user of usersWithoutRole) {
      console.log(`\n👤 Fixing user: ${user.email}`);
      
      // Determine role based on existing fields
      if (user.isSuperAdmin) {
        user.role = "super-admin";
        console.log("   Set role to: super-admin");
      } else if (user.isAdmin) {
        user.role = "admin";
        console.log("   Set role to: admin");
      } else {
        user.role = "customer"; // Default to customer
        console.log("   Set role to: customer (default)");
      }
      
      await user.save();
      console.log("   ✅ User updated");
    }

    // Verify all users now have roles
    const allUsers = await User.find({}).select("email role isAdmin isSuperAdmin");
    console.log("\n📊 All Users After Fix:");
    allUsers.forEach(user => {
      console.log(`   ${user.email} - Role: ${user.role} - Admin: ${user.isAdmin} - SuperAdmin: ${user.isSuperAdmin}`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

fixUserRoles();