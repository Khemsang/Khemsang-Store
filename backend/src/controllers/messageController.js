import Message from "../models/Message.js";
import User from "../models/User.js";

/**
 * SEND MESSAGE
 * POST /api/messages
 * Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, subject, message, parentMessageId } = req.body;

    if (!recipientId || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Handle attachments from multer
    const attachments = req.files
      ? req.files.map((file) => ({
          url: file.path, // Cloudinary URL
          filename: file.originalname,
        }))
      : [];

    const newMessage = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      subject,
      message,
      parentMessage: parentMessageId || null,
      attachments,
    });

    // If this is a reply, add to parent's replies array
    if (parentMessageId) {
      await Message.findByIdAndUpdate(parentMessageId, {
        $push: { replies: newMessage._id },
        isReplied: true,
      });
    }

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email")
      .populate("recipient", "name email");

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET INBOX (Received Messages)
 * GET /api/messages/inbox
 * Private
 */
export const getInbox = async (req, res) => {
  try {
    const messages = await Message.find({
      recipient: req.user._id,
      parentMessage: null, // Only get main messages, not replies
      isDraft: false,
      deletedBy: { $ne: req.user._id },
    })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .populate({
        path: "replies",
        populate: { path: "sender", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET SENT MESSAGES
 * GET /api/messages/sent
 * Private
 */
export const getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      sender: req.user._id,
      parentMessage: null, // Only get main messages, not replies
      isDraft: false,
      deletedBy: { $ne: req.user._id },
    })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .populate({
        path: "replies",
        populate: { path: "sender recipient", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET STARRED MESSAGES
 * GET /api/messages/starred
 * Private
 */
export const getStarredMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
      isStarred: true,
      isDraft: false,
      deletedBy: { $ne: req.user._id },
    })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .populate({
        path: "replies",
        populate: { path: "sender", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET DRAFT MESSAGES
 * GET /api/messages/drafts
 * Private
 */
export const getDraftMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      sender: req.user._id,
      isDraft: true,
      deletedBy: { $ne: req.user._id },
    })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET TRASH MESSAGES
 * GET /api/messages/trash
 * Private
 */
export const getTrashMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      deletedBy: req.user._id,
    })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET SINGLE MESSAGE WITH REPLIES
 * GET /api/messages/:id
 * Private
 */
export const getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .populate({
        path: "replies",
        populate: { path: "sender recipient", select: "name email" },
      });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is sender or recipient
    const isAuthorized =
      message.sender._id.toString() === req.user._id.toString() ||
      message.recipient._id.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Mark as read if recipient is viewing
    if (
      message.recipient._id.toString() === req.user._id.toString() &&
      !message.isRead
    ) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * MARK MESSAGE AS READ
 * PUT /api/messages/:id/read
 * Private
 */
export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({ message: "Message marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE MESSAGE
 * DELETE /api/messages/:id
 * Private
 */
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is sender or recipient
    const isAuthorized =
      message.sender.toString() === req.user._id.toString() ||
      message.recipient.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Move to trash instead of permanent delete
    if (!message.deletedBy.includes(req.user._id)) {
      message.deletedBy.push(req.user._id);
      await message.save();
    }

    res.json({ message: "Message moved to trash" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * TOGGLE STAR
 * PUT /api/messages/:id/star
 * Private
 */
export const toggleStar = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is sender or recipient
    const isAuthorized =
      message.sender.toString() === req.user._id.toString() ||
      message.recipient.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    message.isStarred = !message.isStarred;
    await message.save();

    res.json({ message: "Star toggled", isStarred: message.isStarred });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * SAVE DRAFT
 * POST /api/messages/draft
 * Private
 */
export const saveDraft = async (req, res) => {
  try {
    const { recipientId, subject, message, draftId } = req.body;

    // Handle attachments from multer
    const attachments = req.files
      ? req.files.map((file) => ({
          url: file.path, // Cloudinary URL
          filename: file.originalname,
        }))
      : [];

    if (draftId) {
      // Update existing draft
      const draft = await Message.findById(draftId);
      if (!draft || draft.sender.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: "Draft not found" });
      }

      draft.recipient = recipientId;
      draft.subject = subject;
      draft.message = message;
      if (attachments.length > 0) {
        draft.attachments = [...draft.attachments, ...attachments];
      }
      await draft.save();

      const populatedDraft = await Message.findById(draft._id)
        .populate("sender", "name email")
        .populate("recipient", "name email");

      return res.json(populatedDraft);
    }

    // Create new draft
    const newDraft = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      subject: subject || "(No Subject)",
      message: message || "",
      isDraft: true,
      attachments,
    });

    const populatedDraft = await Message.findById(newDraft._id)
      .populate("sender", "name email")
      .populate("recipient", "name email");

    res.status(201).json(populatedDraft);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * SEND DRAFT
 * PUT /api/messages/:id/send
 * Private
 */
export const sendDraft = async (req, res) => {
  try {
    const draft = await Message.findById(req.params.id);

    if (!draft) {
      return res.status(404).json({ message: "Draft not found" });
    }

    if (draft.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!draft.isDraft) {
      return res.status(400).json({ message: "Message is not a draft" });
    }

    draft.isDraft = false;
    await draft.save();

    const populatedMessage = await Message.findById(draft._id)
      .populate("sender", "name email")
      .populate("recipient", "name email");

    res.json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PERMANENTLY DELETE MESSAGE
 * DELETE /api/messages/:id/permanent
 * Private
 */
export const permanentlyDeleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if message is in user's trash
    if (!message.deletedBy.includes(req.user._id)) {
      return res.status(403).json({ message: "Message not in trash" });
    }

    // If both sender and recipient deleted, permanently delete
    const isSender = message.sender.toString() === req.user._id.toString();
    const isRecipient = message.recipient.toString() === req.user._id.toString();

    if (isSender && isRecipient) {
      // Same person sent and received (shouldn't happen but handle it)
      await Message.findByIdAndDelete(req.params.id);
    } else if (message.deletedBy.length >= 2) {
      // Both parties deleted it
      await Message.findByIdAndDelete(req.params.id);
    } else {
      // Just remove from this user's view
      return res.json({ message: "Message permanently deleted from your view" });
    }

    res.json({ message: "Message permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * RESTORE FROM TRASH
 * PUT /api/messages/:id/restore
 * Private
 */
export const restoreMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Remove user from deletedBy array
    message.deletedBy = message.deletedBy.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await message.save();

    res.json({ message: "Message restored" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET UNREAD COUNT
 * GET /api/messages/unread/count
 * Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false,
      isDraft: false,
      parentMessage: null, // Only count main messages, not replies
      deletedBy: { $ne: req.user._id }, // Exclude deleted messages
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET ALL ADMINS (for customer to send message to)
 * GET /api/messages/admins
 * Private
 */
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ isAdmin: true }).select("name email");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
