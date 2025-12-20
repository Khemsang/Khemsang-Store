import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: Boolean,
  isSuperAdmin: Boolean,
  isVerified: Boolean,
  adminStatus: String,
});

const User = mongoose.model("User", userSchema);

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const email = "khemsangrai@gmail.com";
    const password = "khemsangrai@gmail.com";

    // Check if already exists
    const existing = await User.findOne({ email });

    if (existing) {
      // Update password if user exists
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updateOne(
        { email },
        {
          $set: {
            password: hashedPassword,
            isAdmin: true,
            isSuperAdmin: true,
            isVerified: true,
            adminStatus: "active",
          },
        }
      );
      console.log("\n✅ Super Admin password updated!\n");
    } else {
      // Create new super admin
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        name: "Super Admin",
        email: email,
        password: hashedPassword,
        isAdmin: true,
        isSuperAdmin: true,
        isVerified: true,
        adminStatus: "active",
      });
      console.log("\n✅ Super Admin created successfully!\n");
    }

    console.log("================================");
    console.log("Email:    " + email);
    console.log("Password: " + password);
    console.log("================================\n");
    console.log("Now login with these credentials!");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createSuperAdmin();
