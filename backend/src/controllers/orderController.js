import Order from "../models/Order.js";
import User from "../models/User.js";
import { verifyEsewaPayment } from "../services/esewaService.js";
import { logActivity } from "./activityController.js";

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  try {
    console.log("Creating order...");
    console.log("User:", req.user?._id);
    console.log("Request body:", req.body);

    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city
    ) {
      return res
        .status(400)
        .json({ message: "Complete shipping address required" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "esewa",
      paymentStatus: "pending", // Always pending initially
      orderStatus: "pending",
    });

    console.log("Order created successfully:", order._id);
    console.log("Payment Method:", order.paymentMethod);
    console.log("Payment Status:", order.paymentStatus);

    // Log activity
    await logActivity(
      req.user._id,
      `Placed order #${order._id.toString().slice(-6)} - Rs. ${
        order.totalAmount
      }`,
      "order",
      "FaShoppingBag",
      order._id,
      null,
      {
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        paymentMethod: order.paymentMethod,
      }
    );

    // Clear user cart after order
    try {
      await User.findByIdAndUpdate(req.user._id, { cart: [] });
    } catch (cartError) {
      console.log("Error clearing cart:", cartError.message);
      // Don't fail the order if cart clearing fails
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify eSewa payment
// @route   GET /api/orders/esewa/verify
export const verifyPayment = async (req, res) => {
  try {
    const { oid, amt, refId } = req.query;

    const verification = await verifyEsewaPayment(oid, amt, refId);

    if (verification.success) {
      // Update order payment status
      const order = await Order.findById(oid);
      if (order) {
        order.paymentStatus = "paid";
        order.transactionId = refId;
        order.orderStatus = "processing";
        await order.save();
      }

      res.redirect(
        `${process.env.FRONTEND_URL}/payment/success?orderId=${oid}`
      );
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${oid}`);
    }
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};

// @desc    Handle eSewa payment failure
// @route   GET /api/orders/esewa/failure
export const paymentFailure = (req, res) => {
  const { oid } = req.query;
  res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${oid}`);
};
