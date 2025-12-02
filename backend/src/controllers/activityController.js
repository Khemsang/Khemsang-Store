import Activity from "../models/Activity.js";

// @desc    Get user activities
// @route   GET /api/activities
export const getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .populate("relatedOrder", "totalAmount orderStatus")
      .populate("relatedProduct", "title images")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create activity
// @route   POST /api/activities
export const createActivity = async (req, res) => {
  try {
    const { action, type, icon, relatedOrder, relatedProduct, metadata } =
      req.body;

    const activity = await Activity.create({
      user: req.user._id,
      action,
      type,
      icon: icon || "FaCircle",
      relatedOrder,
      relatedProduct,
      metadata,
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to log activity (can be used in other controllers)
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
    await Activity.create({
      user: userId,
      action,
      type,
      icon,
      relatedOrder,
      relatedProduct,
      metadata,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};
