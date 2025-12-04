import Order from "../models/Order.js";
import User from "../models/User.js";
import { verifyEsewaPayment } from "../services/esewaService.js";
import { logActivity } from "./activityController.js";

/**
 * CREATE ORDER
 * POST /api/orders
 * Private
 */
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!items?.length) return res.status(400).json({ message: "No items in order" });
    if (!totalAmount || totalAmount <= 0)
      return res.status(400).json({ message: "Invalid total amount" });
    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address || !shippingAddress?.city)
      return res.status(400).json({ message: "Complete shipping address required" });

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "esewa",
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    // Log activity
    await logActivity(
      req.user._id,
      `Placed order #${order._id.toString().slice(-6)} - Rs. ${order.totalAmount}`,
      "order",
      "FaShoppingBag",
      order._id,
      null,
      { totalAmount: order.totalAmount, itemCount: order.items.length, paymentMethod: order.paymentMethod }
    );

    // Clear user cart
    await User.findByIdAndUpdate(req.user._id, { cart: [] }).catch(() => {});

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

/**
 * GET MY ORDERS
 * GET /api/orders/my-orders
 * Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET ALL ORDERS
 * GET /api/orders
 * Admin only
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET SINGLE ORDER
 * GET /api/orders/:id
 * Private (owner or admin)
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) return res.status(403).json({ message: "Not authorized" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE ORDER STATUS
 * PUT /api/orders/:id/status
 * Admin only
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = orderStatus;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * VERIFY ESEWA PAYMENT
 * GET /api/orders/esewa/verify
 * Public (callback)
 */
export const verifyPayment = async (req, res) => {
  try {
    const { oid, amt, refId } = req.query;
    const verification = await verifyEsewaPayment(oid, amt, refId);

    if (verification.success) {
      const order = await Order.findById(oid);
      if (order) {
        order.paymentStatus = "paid";
        order.transactionId = refId;
        order.orderStatus = "processing";
        await order.save();
      }
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${oid}`);
    } 
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${oid}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};

/**
 * PAYMENT FAILURE HANDLER
 * GET /api/orders/esewa/failure
 * Public (callback)
 */
export const paymentFailure = (req, res) => {
  const { oid } = req.query;
  res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${oid}`);
};
