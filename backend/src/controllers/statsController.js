import Stats from "../models/Stats.js";

// Get all active stats
export const getAllStats = async (req, res) => {
  try {
    const stats = await Stats.find({ isActive: true }).sort({ order: 1 });
    res.json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};

// Get single stat
export const getStatById = async (req, res) => {
  try {
    const stat = await Stats.findById(req.params.id);
    if (!stat) {
      return res.status(404).json({ message: "Stat not found" });
    }
    res.json(stat);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stat", error: error.message });
  }
};

// Create stat (admin)
export const createStat = async (req, res) => {
  try {
    const stat = new Stats(req.body);
    await stat.save();
    res.status(201).json(stat);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating stat", error: error.message });
  }
};

// Update stat (admin)
export const updateStat = async (req, res) => {
  try {
    const stat = await Stats.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!stat) {
      return res.status(404).json({ message: "Stat not found" });
    }
    res.json(stat);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating stat", error: error.message });
  }
};

// Delete stat (admin)
export const deleteStat = async (req, res) => {
  try {
    const stat = await Stats.findByIdAndDelete(req.params.id);
    if (!stat) {
      return res.status(404).json({ message: "Stat not found" });
    }
    res.json({ message: "Stat deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting stat", error: error.message });
  }
};

// Get all users (admin) - for analytics
export const getAllUsers = async (req, res) => {
  try {
    const User = (await import("../models/User.js")).default;
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Get analytics data
export const getAnalytics = async (req, res) => {
  try {
    const User = (await import("../models/User.js")).default;
    const Order = (await import("../models/Order.js")).default;
    const Product = (await import("../models/Product.js")).default;

    const [users, orders, products] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      Order.find().populate("items.product").sort({ createdAt: -1 }),
      Product.countDocuments(),
    ]);

    // Calculate total revenue
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return (
          orderDate >= date &&
          orderDate < nextMonth &&
          o.paymentStatus === "paid"
        );
      });
      const revenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      monthlyRevenue.push({
        month: date.toLocaleString("default", { month: "short" }),
        revenue,
      });
    }

    // Orders by status
    const ordersByStatus = {
      pending: orders.filter((o) => o.orderStatus === "pending").length,
      processing: orders.filter((o) => o.orderStatus === "processing").length,
      shipped: orders.filter((o) => o.orderStatus === "shipped").length,
      delivered: orders.filter((o) => o.orderStatus === "delivered").length,
      cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
    };

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: users,
      totalProducts: products,
      monthlyRevenue,
      ordersByStatus: Object.entries(ordersByStatus).map(([status, count]) => ({
        status,
        count,
      })),
      recentOrders: orders.slice(0, 5),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching analytics", error: error.message });
  }
};
