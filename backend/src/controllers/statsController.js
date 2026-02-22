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

    const isSuperAdmin = req.user.isSuperAdmin;
    const adminId = req.user._id;

    console.log("📊 Fetching analytics for:", isSuperAdmin ? "Super Admin" : "Admin", adminId);

    // Get products based on admin role
    let productQuery = {};
    if (!isSuperAdmin) {
      productQuery = { createdBy: adminId };
    }

    const [users, allOrders, products] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      Order.find().populate("items.product").sort({ createdAt: -1 }),
      Product.countDocuments(productQuery),
    ]);

    console.log("📦 Total orders found:", allOrders.length);
    console.log("👥 Total customers:", users);
    console.log("🛍️ Total products:", products);

    // Filter orders based on admin role
    let orders = allOrders;
    if (!isSuperAdmin) {
      // Regular admin only sees orders containing their products
      orders = allOrders.filter((order) => {
        return order.items.some(
          (item) =>
            item.product?.createdBy?.toString() === adminId.toString()
        );
      });
      console.log("🔍 Filtered orders for admin:", orders.length);
    }

    // Calculate total revenue from filtered orders (include all payment statuses for now)
    const totalRevenue = orders.reduce((sum, o) => {
      // Count paid orders and COD orders that are delivered
      if (o.paymentStatus === "paid" || (o.paymentMethod === "cod" && o.orderStatus === "delivered")) {
        return sum + (o.totalAmount || 0);
      }
      return sum;
    }, 0);

    console.log("💰 Total revenue calculated:", totalRevenue);

    // Monthly revenue (last 6 months) from filtered orders
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        const isPaid = o.paymentStatus === "paid" || (o.paymentMethod === "cod" && o.orderStatus === "delivered");
        return orderDate >= date && orderDate < nextMonth && isPaid;
      });
      const revenue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      monthlyRevenue.push({
        month: date.toLocaleString("default", { month: "short" }),
        revenue,
      });
    }

    console.log("📅 Monthly revenue:", monthlyRevenue);

    // Weekly revenue (last 7 weeks)
    const weeklyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        const isPaid = o.paymentStatus === "paid" || (o.paymentMethod === "cod" && o.orderStatus === "delivered");
        return orderDate >= weekStart && orderDate < weekEnd && isPaid;
      });
      
      const revenue = weekOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const weekLabel = `Week ${7 - i}`;
      
      weeklyRevenue.push({
        week: weekLabel,
        revenue,
        date: weekStart.toLocaleDateString("default", { month: "short", day: "numeric" }),
      });
    }

    console.log("📊 Weekly revenue:", weeklyRevenue);

    // Daily revenue (last 7 days)
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        const isPaid = o.paymentStatus === "paid" || (o.paymentMethod === "cod" && o.orderStatus === "delivered");
        return orderDate >= date && orderDate < nextDay && isPaid;
      });
      
      const revenue = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      dailyRevenue.push({
        day: date.toLocaleDateString("default", { weekday: "short" }),
        date: date.toLocaleDateString("default", { month: "short", day: "numeric" }),
        revenue,
      });
    }

    console.log("📈 Daily revenue:", dailyRevenue);

    // Orders by status from filtered orders
    const ordersByStatus = {
      pending: orders.filter((o) => o.orderStatus === "pending").length,
      processing: orders.filter((o) => o.orderStatus === "processing").length,
      shipped: orders.filter((o) => o.orderStatus === "shipped").length,
      delivered: orders.filter((o) => o.orderStatus === "delivered").length,
      cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
    };

    console.log("📋 Orders by status:", ordersByStatus);

    const analyticsData = {
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: users,
      totalProducts: products,
      monthlyRevenue,
      weeklyRevenue,
      dailyRevenue,
      ordersByStatus: Object.entries(ordersByStatus).map(([status, count]) => ({
        status,
        count,
      })),
      recentOrders: orders.slice(0, 5),
      adminRole: isSuperAdmin ? "Super Admin" : "Admin",
    };

    console.log("✅ Analytics data prepared successfully");
    res.json(analyticsData);
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    res
      .status(500)
      .json({ message: "Error fetching analytics", error: error.message });
  }
};

// Get notification counts for admin
export const getNotifications = async (req, res) => {
  try {
    const Order = (await import("../models/Order.js")).default;
    const Review = (await import("../models/Review.js")).default;
    const Testimonial = (await import("../models/Testimonial.js")).default;

    const isSuperAdmin = req.user.isSuperAdmin;
    const adminId = req.user._id;

    let newOrders = 0;
    let unreadOrders = 0;
    let pendingReviews = 0;
    let pendingTestimonials = 0;

    if (isSuperAdmin) {
      // Super admin sees all notifications
      newOrders = await Order.countDocuments({
        orderStatus: { $in: ["pending", "processing"] },
      });

      // Count unread orders (not read by this admin)
      const allOrders = await Order.find();
      unreadOrders = allOrders.filter(
        (order) =>
          !order.readBy.some(
            (r) => r.admin.toString() === adminId.toString()
          )
      ).length;

      pendingReviews = await Review.countDocuments({
        isApproved: false,
      });

      pendingTestimonials = await Testimonial.countDocuments({
        isApproved: false,
      });
    } else {
      // Regular admin only sees notifications for their products
      const allOrders = await Order.find({
        orderStatus: { $in: ["pending", "processing"] },
      }).populate("items.product");

      // Filter orders containing admin's products
      const adminOrders = allOrders.filter((order) => {
        return order.items.some(
          (item) =>
            item.product?.createdBy?.toString() === adminId.toString()
        );
      });
      newOrders = adminOrders.length;

      // Count unread orders for this admin
      unreadOrders = adminOrders.filter(
        (order) =>
          !order.readBy.some(
            (r) => r.admin.toString() === adminId.toString()
          )
      ).length;

      // Get reviews for admin's products
      const adminProducts = await (await import("../models/Product.js")).default
        .find({ createdBy: adminId })
        .select("_id");
      const productIds = adminProducts.map((p) => p._id);

      pendingReviews = await Review.countDocuments({
        product: { $in: productIds },
        isApproved: false,
      });

      // Testimonials are global, so regular admin doesn't see them
      pendingTestimonials = 0;
    }

    res.json({
      newOrders,
      unreadOrders,
      pendingReviews,
      pendingTestimonials,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: error.message });
  }
};
