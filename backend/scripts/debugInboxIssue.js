import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "../src/models/Message.js";
import User from "../src/models/User.js";

dotenv.config();

const debugInboxIssue = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get the problematic admin
    const admin = await User.findOne({ email: "cloudsnepal33@gmail.com" });
    console.log(`\n👤 Admin: ${admin.name} (${admin._id})`);

    // Get ALL messages for this admin (without filters)
    const allMessagesForAdmin = await Message.find({
      recipient: admin._id,
    })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: -1 });

    console.log(`\n📧 Total messages for this admin: ${allMessagesForAdmin.length}`);

    allMessagesForAdmin.forEach((msg, idx) => {
      console.log(`\n${idx + 1}. ${msg.subject}`);
      console.log(`   Sender: ${msg.sender?._id} (${msg.sender?.name})`);
      console.log(`   Recipient: ${msg.recipient?._id} (${msg.recipient?.name})`);
      console.log(`   isRead: ${msg.isRead}`);
      console.log(`   isDraft: ${msg.isDraft}`);
      console.log(`   parentMessage: ${msg.parentMessage}`);
      console.log(`   deletedBy: ${JSON.stringify(msg.deletedBy)}`);
      console.log(`   createdAt: ${msg.createdAt}`);
    });

    // Now check with inbox filters
    console.log("\n\n🔍 Applying inbox filters:");
    
    const inboxQuery = {
      recipient: admin._id,
      parentMessage: null,
      isDraft: false,
      deletedBy: { $ne: admin._id },
    };
    
    console.log("Query:", JSON.stringify(inboxQuery, null, 2));

    const inboxMessages = await Message.find(inboxQuery)
      .populate("sender", "name email")
      .sort({ createdAt: -1 });

    console.log(`\n📥 Inbox Messages: ${inboxMessages.length}`);

    // Check each filter individually
    console.log("\n\n🔬 Testing each filter:");

    const recipientMatch = await Message.countDocuments({ recipient: admin._id });
    console.log(`✓ recipient matches: ${recipientMatch}`);

    const parentMessageNull = await Message.countDocuments({
      recipient: admin._id,
      parentMessage: null,
    });
    console.log(`✓ parentMessage is null: ${parentMessageNull}`);

    const notDraft = await Message.countDocuments({
      recipient: admin._id,
      parentMessage: null,
      isDraft: false,
    });
    console.log(`✓ isDraft is false: ${notDraft}`);

    const notDeleted = await Message.countDocuments({
      recipient: admin._id,
      parentMessage: null,
      isDraft: false,
      deletedBy: { $ne: admin._id },
    });
    console.log(`✓ not deleted by user: ${notDeleted}`);

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

debugInboxIssue();
