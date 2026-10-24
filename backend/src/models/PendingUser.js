import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * PendingUser — temporary store for signups awaiting email verification.
 * Once the user clicks the verification link, this document is promoted
 * to a real User and deleted here.
 *
 * Uses a dedicated `expiresAt` field for the TTL index so expiry is
 * explicit, predictable, and can be extended on resend.
 */
const pendingUserSchema = new mongoose.Schema({
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
  },
  verificationToken: {
    type: String,
    required: true,
  },
  // MongoDB TTL index on this field — document is auto-deleted when
  // expiresAt is reached (index fires every ~60s)
  expiresAt: {
    type: Date,
    required: true,
    // TTL = 0 means "delete when expiresAt <= now"
    expires: 0,
  },
}, {
  // Use Mongoose timestamps for createdAt/updatedAt audit fields
  // (separate from the TTL field so they don't interfere)
  timestamps: true,
});

// Hash password before saving
pendingUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("PendingUser", pendingUserSchema);
