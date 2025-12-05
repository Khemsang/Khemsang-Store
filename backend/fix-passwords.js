import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

async function fixPasswords() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const users = await User.find({});

  for (const user of users) {
    // Check if password is already hashed (bcrypt hashes start with $2)
    if (!user.password.startsWith("$2")) {
      console.log(`Fixing password for: ${user.email}`);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
      console.log(`Fixed: ${user.email}`);
    } else {
      console.log(`Already hashed: ${user.email}`);
    }
  }

  console.log("Done!");
  process.exit(0);
}

fixPasswords().catch(console.error);
