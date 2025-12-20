import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: true,
    },
    verificationTokenExpires: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
pendingUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Auto-delete expired pending users (after 1 hour buffer beyond expiry)
// Note: expireAfterSeconds: 0 means delete when verificationTokenExpires time is reached
// We removed this to handle expiry manually in code for better control
// pendingUserSchema.index(
//   { verificationTokenExpires: 1 },
//   { expireAfterSeconds: 0 }
// );

export default mongoose.model("PendingUser", pendingUserSchema);
