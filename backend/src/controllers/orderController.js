import Order from "../models/Order.js";
import User from "../models/User.js";
import logger from "../config/logger.js";
import { requireFields } from "../utils/validate.js";
import {
  verifyEsewaPayment,
  generateEsewaSignature,
} from "../services/esewaService.js";
import { logActivity } from "./activityController.js";
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
} from "../services/orderEmailService.js";
import { sendCouponForLargeOrder } from "../services/couponEmailService.js";
import {
  generateInvoiceHTML,
  generateInvoiceData,
} from "../services/invoiceService.js";
import {
  notifyNewOrder,
  notifyOrderStatusChange,
  notifyOrderCancelled,
} from "../services/notificationService.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_MESSAGES = {
  pending:    "Order placed and awaiting confirmation",
  processing: "Order confirmed and being prepared",
  shipped:    "Order has been shipped",
  delivered:  "Order has been delivered",
  cancelled:  "Order has been cancelled",
};
const getStatusMessage = (status) => STATUS_MESSAGES[status] || "Status updated";

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod, couponCode, discount } =
      req.body;

    if (!items?.length)
      return res.status(400).json({ message: "No items in order" });
    if (!totalAmount || totalAmount <= 0)
      return res.status(400).json({ message: "Invalid total amount" });

    const finalAmount = discount ? totalAmount - discount : totalAmount;
    if (finalAmount < 5000) {
      return res.status(400).json({
        message: `Minimum order amount is Rs. 5000. Your order total after discount is Rs. ${finalAmount}.`,
        finalAmount,
        minimumRequired: 5000,
      });
    }

    const addrMissing = requireFields(shippingAddress || {}, [
      "fullName",
      "phone",
      "address",
      "city",
    ]);
    if (addrMissing)
      return res.status(400).json({ message: `Shipping address: ${addrMissing}` });

    const Product = (await import("../models/Product.js")).default;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product)
        return res.status(404).json({ message: `Product not found: ${item.product}` });

      if (item.colorVariant?.colorName) {
        const variant = product.colorVariants.find(
          (v) => v.colorName === item.colorVariant.colorName
        );
        if (!variant)
          return res.status(404).json({
            message: `Variant ${item.colorVariant.colorName} not found for ${product.title}`,
          });
        if (variant.stock < item.quantity)
          return res.status(400).json({
            message: `Insufficient stock for ${product.title} - ${variant.colorName}. Available: ${variant.stock}`,
          });

        variant.stock -= item.quantity;
        if (variant.isFlashSale && variant.flashStock > 0) {
          variant.flashStock = Math.max(0, variant.flashStock - item.quantity);
          if (variant.flashStock === 0) variant.isFlashSale = false;
        }
      } else {
        if (product.stock < item.quantity)
          return res.status(400).json({
            message: `Insufficient stock for ${product.title}. Available: ${product.stock}`,
          });

        product.stock -= item.quantity;
        if (product.isFlashSale && product.flashStock > 0) {
          product.flashStock = Math.max(0, product.flashStock - item.quantity);
          if (product.flashStock === 0) product.isFlashSale = false;
        }
      }

      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "esewa",
      paymentStatus: "pending",
      orderStatus: "pending",
      couponCode: couponCode || undefined,
      discount: discount || 0,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("items.product")
      .populate("user", "name email phone");

    logActivity(
      req.user._id,
      `Placed order #${order._id.toString().slice(-6)} - Rs. ${order.totalAmount}`,
      "order",
      "FaShoppingBag",
      order._id,
      null,
      { totalAmount: order.totalAmount, itemCount: order.items.length, paymentMethod: order.paymentMethod }
    ).catch(() => {});

    User.findByIdAndUpdate(req.user._id, { cart: [] }).catch(() => {});

    sendOrderConfirmationEmail(populatedOrder, req.user).catch((err) =>
      logger.warn("Failed to send order confirmation email", { message: err.message })
    );
    notifyNewOrder(populatedOrder).catch((err) =>
      logger.warn("Failed to send new-order notification", { message: err.message })
    );
    sendCouponForLargeOrder(populatedOrder, req.user).catch((err) =>
      logger.warn("Failed to send large-order coupon email", { message: err.message })
    );

    res.status(201).json(order);
  } catch (err) {
    logger.error("createOrder failed", { message: err.message });
    res.status(500).json({ message: "Failed to create order" });
  }
};

// ─── GET MY ORDERS ────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const filter = { user: req.user._id };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("items.product")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    logger.error("getMyOrders failed", { message: err.message });
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ─── GET ALL ORDERS (admin) ───────────────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};
    if (status && status !== "all") filter.orderStatus = status;

    // Super Admin: all orders. Regular admin: only their products' orders.
    // For regular admins we must load all matching orders first, then filter in JS
    // (the createdBy field lives on Product, not on Order).
    if (req.user.isAdmin && !req.user.isSuperAdmin) {
      const allMatching = await Order.find(filter)
        .populate("user", "name email")
        .populate("items.product")
        .sort({ createdAt: -1 });

      const adminId = req.user._id.toString();
      const filtered = allMatching.filter((order) =>
        order.items.some((item) => item.product?.createdBy?.toString() === adminId)
      );

      const total    = filtered.length;
      const paginated = filtered.slice(skip, skip + limitNum);
      return res.json({
        orders: paginated,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      });
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .populate("items.product")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    logger.error("getAllOrders failed", { message: err.message });
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ─── GET SINGLE ORDER ─────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin)
      return res.status(403).json({ message: "Not authorized" });

    res.json(order);
  } catch (err) {
    logger.error("getOrderById failed", { message: err.message });
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

// ─── UPDATE ORDER STATUS ──────────────────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber, estimatedDelivery } = req.body;
    if (!orderStatus)
      return res.status(400).json({ message: "orderStatus is required" });

    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    if (trackingNumber)   order.trackingNumber   = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    order.trackingHistory.push({
      status: orderStatus,
      message: getStatusMessage(orderStatus),
      timestamp: new Date(),
    });

    const updatedOrder = await order.save();

    if (previousStatus !== orderStatus && order.user) {
      if (orderStatus === "shipped") {
        sendOrderShippedEmail(updatedOrder, order.user).catch((err) =>
          logger.warn("Failed to send shipped email", { message: err.message })
        );
      } else if (orderStatus === "delivered") {
        sendOrderDeliveredEmail(updatedOrder, order.user).catch((err) =>
          logger.warn("Failed to send delivered email", { message: err.message })
        );
      }

      if (orderStatus === "cancelled") {
        notifyOrderCancelled(updatedOrder).catch((err) =>
          logger.warn("Failed to send cancellation notification", { message: err.message })
        );
      } else {
        notifyOrderStatusChange(updatedOrder, previousStatus, orderStatus).catch((err) =>
          logger.warn("Failed to send status-change notification", { message: err.message })
        );
      }
    }

    res.json(updatedOrder);
  } catch (err) {
    logger.error("updateOrderStatus failed", { message: err.message });
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// ─── MARK ORDER AS READ ───────────────────────────────────────────────────────
export const markOrderAsRead = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const alreadyRead = order.readBy.some(
      (r) => r.admin.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      order.readBy.push({ admin: req.user._id, readAt: new Date() });
      order.isRead = true;
      await order.save();
    }

    res.json({ message: "Order marked as read" });
  } catch (err) {
    logger.error("markOrderAsRead failed", { message: err.message });
    res.status(500).json({ message: "Failed to mark order as read" });
  }
};

// ─── GET INVOICE ──────────────────────────────────────────────────────────────
export const getInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin)
      return res.status(403).json({ message: "Not authorized" });

    if (req.query.format === "html") {
      res.setHeader("Content-Type", "text/html");
      return res.send(generateInvoiceHTML(order, order.user));
    }

    res.json(generateInvoiceData(order, order.user));
  } catch (err) {
    logger.error("getInvoice failed", { message: err.message });
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};

// ─── VERIFY ESEWA PAYMENT ─────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { data, oid, refId } = req.query;

    if (data) {
      const verification = await verifyEsewaPayment(data);
      if (verification.success) {
        await Order.findByIdAndUpdate(verification.orderId, {
          paymentStatus: "paid",
          transactionId: verification.orderId,
          orderStatus: "processing",
        });
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/success?orderId=${verification.orderId}`
        );
      }
    } else if (oid) {
      await Order.findByIdAndUpdate(oid, {
        paymentStatus: "paid",
        transactionId: refId || oid,
        orderStatus: "processing",
      });
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/success?orderId=${oid}`
      );
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  } catch (err) {
    logger.error("verifyPayment failed", { message: err.message });
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};

// ─── GET ESEWA SIGNATURE ──────────────────────────────────────────────────────
export const getEsewaSignature = async (req, res) => {
  try {
    const missing = requireFields(req.body, ["totalAmount", "transactionUuid"]);
    if (missing) return res.status(400).json({ message: missing });

    const { totalAmount, transactionUuid, productCode } = req.body;
    const signature = generateEsewaSignature(
      totalAmount,
      transactionUuid,
      productCode || "EPAYTEST"
    );
    res.json({ signature });
  } catch (err) {
    logger.error("getEsewaSignature failed", { message: err.message });
    res.status(500).json({ message: "Failed to generate payment signature" });
  }
};

// ─── PAYMENT FAILURE ──────────────────────────────────────────────────────────
export const paymentFailure = (req, res) => {
  const { oid } = req.query;
  res.redirect(`${process.env.FRONTEND_URL}/payment/failed${oid ? `?orderId=${oid}` : ""}`);
};
