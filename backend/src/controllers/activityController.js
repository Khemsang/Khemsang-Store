import Activity from "../models/Activity.js";

// Get latest 20 activities for logged-in user
export const getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .populate("relatedOrder", "totalAmount orderStatus")
      .populate("relatedProduct", "title images")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new activity
export const createActivity = async (req, res) => {
  try {
    const activity = await Activity.create({
      user: req.user._id,
      action: req.body.action,
      type: req.body.type,
      icon: req.body.icon || "FaCircle",
      relatedOrder: req.body.relatedOrder || null,
      relatedProduct: req.body.relatedProduct || null,
      metadata: req.body.metadata || null,
    });

    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Log activity helper
export const logActivity = async (
  userId,
  action,
  type,
  icon = "FaCircle",
  relatedOrder = null,
  relatedProduct = null,
  metadata = null
) => {
  try {
    await Activity.create({ user: userId, action, type, icon, relatedOrder, relatedProduct, metadata });
  } catch (err) {
    console.error("Activity logging error:", err);
  }
};
