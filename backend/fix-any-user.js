import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function fixUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB\n");

    // Change this email to the user you want to fix
    const email = process.argv[2] || "cloudsnepal33@gmail.com";
    const password = process.argv[3] || email; // Default: password = email

    const user = await mongoose.connection.db
      .collection("users")
      .findOne({ email });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${email})`);

    // Test current password
    const currentMatch = await bcrypt.compare(password, user.password);
    console.log(
      `Current password test: ${currentMatch ? "✅ MATCH" : "❌ NO MATCH"}`
    );

    if (!currentMatch) {
      console.log("\n🔧 Fixing password...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await mongoose.connection.db
        .collection("users")
        .updateOne({ email }, { $set: { password: hashedPassword } });

      console.log("✅ Password fixed!");
    }

    console.log("\n================================");
    console.log("Login with:");
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log("================================");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixUser();
