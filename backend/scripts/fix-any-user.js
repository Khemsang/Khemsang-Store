import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function fixUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.argv[2] || "cloudsnepal33@gmail.com";
    const password = process.argv[3] || email;

    const user = await mongoose.connection.db
      .collection("users")
      .findOne({ email });

    if (!user) {
      process.exit(1);
    }

    const currentMatch = await bcrypt.compare(password, user.password);

    if (!currentMatch) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await mongoose.connection.db
        .collection("users")
        .updateOne({ email }, { $set: { password: hashedPassword } });
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

fixUser();
