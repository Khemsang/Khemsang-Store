import Order from "../models/Order.js";
import User from "../models/User.js";
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

/**
 * CREATE ORDER
 * POST /api/orders
 * Private
 */
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod, couponCode, discount } = req.body;

    if (!items?.length)
      return res.status(400).json({ message: "No items in order" });
    if (!totalAmount || totalAmount <= 0)
      return res.status(400).json({ message: "Invalid total amount" });
    
    // Calculate final amount after discount
    const finalAmount = discount ? totalAmount - discount : totalAmount;
    
    // Minimum order validation: Rs. 5000 after discount
    if (finalAmount < 5000) {
      return res.status(400).json({ 
        message: `Minimum order amount is Rs. 5000. Your order total after discount is Rs. ${finalAmount}. Please add more items to your cart.`,
        finalAmount,
        minimumRequired: 5000
      });
    }
    
    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city
    )
      return res
        .status(400)
        .json({ message: "Complete shipping address required" });

    // Import Product model
    const Product = (await import("../models/Product.js")).default;

    // Reduce stock for each item
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.product}` 
        });
      }

      // Check if this is a variant order
      if (item.colorVariant && item.colorVariant.colorName) {
        const variant = product.colorVariants.find(
          v => v.colorName === item.colorVariant.colorName
        );
        
        if (!variant) {
          return res.status(404).json({ 
            message: `Variant ${item.colorVariant.colorName} not found for product ${product.title}` 
          });
        }

        // Check variant stock
        if (variant.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.title} - ${variant.colorName}. Available: ${variant.stock}` 
          });
        }

        // Reduce variant stock
        variant.stock -= item.quantity;

        // If variant has flash sale, reduce flash stock too
        if (variant.isFlashSale && variant.flashStock > 0) {
          variant.flashStock = Math.max(0, variant.flashStock - item.quantity);
          
          // Disable flash sale if stock runs out
          if (variant.flashStock === 0) {
            variant.isFlashSale = false;
          }
        }
      } else {
        // Regular product (no variant)
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.title}. Available: ${product.stock}` 
          });
        }

        // Reduce product stock
        product.stock -= item.quantity;

        // If product has flash sale, reduce flash stock too
        if (product.isFlashSale && product.flashStock > 0) {
          product.flashStock = Math.max(0, product.flashStock - item.quantity);
          
          // Disable flash sale if stock runs out
          if (product.flashStock === 0) {
            product.isFlashSale = false;
          }
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

    // Populate order for email and notification
    const populatedOrder = await Order.findById(order._id)
      .populate("items.product")
      .populate("user", "name email phone");

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

    // Clear user cart
    await User.findByIdAndUpdate(req.user._id, { cart: [] }).catch(() => {});

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(populatedOrder, req.user);
    } catch (emailError) {
      console.error("❌ Failed to send order email:", emailError.message);
    }

    // Send notification to admins
    try {
      await notifyNewOrder(populatedOrder);
    } catch (notifError) {
      console.error("❌ Failed to send order notification:", notifError.message);
    }

    // Send coupon for orders above Rs. 5000 (based on final amount after discount)
    try {
      const coupon = await sendCouponForLargeOrder(populatedOrder, req.user);
      if (coupon) {
      }
    } catch (couponError) {
      console.error("❌ Failed to send coupon email:", couponError.message);
      // Don't fail the order if coupon email fails
    }

    res.status(201).json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create order", error: err.message });
  }
};

/**
 * GET MY ORDERS
 * GET /api/orders/my-orders
 * Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET ALL ORDERS
 * GET /api/orders?status=pending
 * Admin only (shows orders containing their products)
 * Super Admin sees ALL orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query filter
    const filter = {};
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    // Get all orders with populated products
    let orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    // Super Admin sees ALL orders, regular admin only their products' orders
    if (req.user.isAdmin && !req.user.isSuperAdmin) {
      orders = orders.filter((order) => {
        // Check if any item in the order belongs to this admin
        return order.items.some(
          (item) =>
            item.product?.createdBy?.toString() === req.user._id.toString()
        );
      });
    }

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
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin)
      return res.status(403).json({ message: "Not authorized" });

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
    const { orderStatus, trackingNumber, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    // Update tracking info if provided
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    // Add to tracking history
    order.trackingHistory.push({
      status: orderStatus,
      message: getStatusMessage(orderStatus),
      timestamp: new Date(),
    });

    const updatedOrder = await order.save();

    // Send email notifications based on status change
    if (previousStatus !== orderStatus && order.user) {
      try {
        if (orderStatus === "shipped") {
          await sendOrderShippedEmail(updatedOrder, order.user);
        } else if (orderStatus === "delivered") {
          await sendOrderDeliveredEmail(updatedOrder, order.user);
        }
      } catch (emailError) {
        console.error("❌ Failed to send status email:", emailError.message);
      }

      // Send notification to admins
      try {
        if (orderStatus === "cancelled") {
          await notifyOrderCancelled(updatedOrder);
        } else {
          await notifyOrderStatusChange(updatedOrder, previousStatus, orderStatus);
        }
      } catch (notifError) {
        console.error("❌ Failed to send status notification:", notifError.message);
      }
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function for status messages
const getStatusMessage = (status) => {
  const messages = {
    pending: "Order placed and awaiting confirmation",
    processing: "Order confirmed and being prepared",
    shipped: "Order has been shipped",
    delivered: "Order has been delivered",
    cancelled: "Order has been cancelled",
  };
  return messages[status] || "Status updated";
};

/**
 * MARK ORDER AS READ
 * PUT /api/orders/:id/mark-read
 * Admin only
 */
export const markOrderAsRead = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check if already read by this admin
    const alreadyRead = order.readBy.some(
      (r) => r.admin.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      order.readBy.push({
        admin: req.user._id,
        readAt: new Date(),
      });
      order.isRead = true;
      await order.save();
    }

    res.json({ message: "Order marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET INVOICE
 * GET /api/orders/:id/invoice
 * Private (owner or admin)
 */
export const getInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin)
      return res.status(403).json({ message: "Not authorized" });

    const { format } = req.query;

    if (format === "html") {
      const html = generateInvoiceHTML(order, order.user);
      res.setHeader("Content-Type", "text/html");
      return res.send(html);
    }

    // Return JSON data for frontend PDF generation
    const invoiceData = generateInvoiceData(order, order.user);
    res.json(invoiceData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * VERIFY ESEWA PAYMENT (v2 API)
 * GET /api/orders/esewa/verify
 * Public (callback)
 */
export const verifyPayment = async (req, res) => {
  try {
    const { data } = req.query; // eSewa v2 returns base64 encoded data

    if (data) {
      // New v2 API
      const verification = await verifyEsewaPayment(data);

      if (verification.success) {
        const order = await Order.findById(verification.orderId);
        if (order) {
          order.paymentStatus = "paid";
          order.transactionId = verification.orderId;
          order.orderStatus = "processing";
          await order.save();
        }
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/success?orderId=${verification.orderId}`
        );
      }
    } else {
      // Legacy API fallback
      const { oid, amt, refId } = req.query;
      if (oid) {
        const order = await Order.findById(oid);
        if (order) {
          order.paymentStatus = "paid";
          order.transactionId = refId || oid;
          order.orderStatus = "processing";
          await order.save();
        }
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/success?orderId=${oid}`
        );
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  } catch (err) {
    console.error("Payment verification error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};

/**
 * GET ESEWA SIGNATURE
 * POST /api/orders/esewa/signature
 * Private
 */
export const getEsewaSignature = async (req, res) => {
  try {
    const { totalAmount, transactionUuid, productCode } = req.body;
    const signature = generateEsewaSignature(
      totalAmount,
      transactionUuid,
      productCode || "EPAYTEST"
    );
    res.json({ signature });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
