import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "../src/models/Message.js";
import User from "../src/models/User.js";

dotenv.config();

const checkInboxMessages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all admins
    const admins = await User.find({
      $or: [{ role: "admin" }, { isAdmin: true }],
    }).select("_id name email role isAdmin");

    console.log("\n📊 Admin Users:");
    admins.forEach((admin) => {
      console.log(
        `  - ${admin.name} (${admin.email}) - Role: ${admin.role}, isAdmin: ${admin.isAdmin}`
      );
    });

    // Get all messages
    const allMessages = await Message.find({})
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: -1 });

    console.log(`\n📧 Total Messages in Database: ${allMessages.length}`);

    // Check messages for each admin
    for (const admin of admins) {
      console.log(`\n👤 Checking inbox for: ${admin.name} (${admin.email})`);

      const inboxMessages = await Message.find({
        recipient: admin._id,
        parentMessage: null,
        isDraft: false,
        deletedBy: { $ne: admin._id },
      })
        .populate("sender", "name email")
        .sort({ createdAt: -1 });

      console.log(`  📥 Inbox Messages: ${inboxMessages.length}`);

      if (inboxMessages.length > 0) {
        console.log("  Messages:");
        inboxMessages.forEach((msg, idx) => {
          console.log(
            `    ${idx + 1}. ${msg.subject} (From: ${msg.sender?.name || "Unknown"}, Read: ${msg.isRead})`
          );
        });
      }

      // Check unread count
      const unreadCount = await Message.countDocuments({
        recipient: admin._id,
        isRead: false,
        isDraft: false,
        deletedBy: { $ne: admin._id },
      });

      console.log(`  📬 Unread Messages: ${unreadCount}`);
    }

    // Check for orphaned messages (messages with invalid sender/recipient)
    console.log("\n🔍 Checking for orphaned messages...");
    const orphanedMessages = [];

    for (const msg of allMessages) {
      if (!msg.sender || !msg.recipient) {
        orphanedMessages.push(msg);
      }
    }

    if (orphanedMessages.length > 0) {
      console.log(`⚠️  Found ${orphanedMessages.length} orphaned messages:`);
      orphanedMessages.forEach((msg) => {
        console.log(
          `  - ${msg.subject} (Sender: ${msg.sender?._id || "NULL"}, Recipient: ${msg.recipient?._id || "NULL"})`
        );
      });

      console.log("\n🗑️  Cleaning up orphaned messages...");
      const deleteResult = await Message.deleteMany({
        $or: [{ sender: null }, { recipient: null }],
      });
      console.log(`✅ Deleted ${deleteResult.deletedCount} orphaned messages`);
    } else {
      console.log("✅ No orphaned messages found");
    }

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkInboxMessages();
