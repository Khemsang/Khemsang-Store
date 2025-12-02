import ContactSettings from "../models/ContactSettings.js";
import ContactMessage from "../models/ContactMessage.js";

// Get contact settings
export const getContactSettings = async (req, res) => {
  try {
    let settings = await ContactSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await ContactSettings.create({
        email: "info@example.com",
        phone: "+1 234 567 8900",
        address: "123 Main Street, City, Country",
        workingHours: "Mon - Fri: 9:00 AM - 6:00 PM",
      });
    }
    res.json(settings);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching contact settings",
        error: error.message,
      });
  }
};

// Update contact settings (admin)
export const updateContactSettings = async (req, res) => {
  try {
    let settings = await ContactSettings.findOne();
    if (!settings) {
      settings = new ContactSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Error updating contact settings",
        error: error.message,
      });
  }
};

// Submit contact message
export const submitContactMessage = async (req, res) => {
  try {
    const message = new ContactMessage(req.body);
    await message.save();
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error sending message", error: error.message });
  }
};

// Get all contact messages (admin)
export const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
};

// Update message status (admin)
export const updateMessageStatus = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json(message);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating message status", error: error.message });
  }
};

// Delete message (admin)
export const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting message", error: error.message });
  }
};
