/**
 * Order Service
 * Centralized business logic for order operations
 * Implements transaction-like behavior for order creation
 */

import Order from "../models/Order.js";
import User from "../models/User.js";
import stockService from "./stockService.js";
import { logActivity } from "../controllers/activityController.js";
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
} from "./orderEmailService.js";
import { sendCouponForLargeOrder } from "./couponEmailService.js";
import {
  notifyNewOrder,
  notifyOrderStatusChange,
  notifyOrderCancelled,
} from "./notificationService.js";

class OrderService {
  /**
   * Business rules constants
   */
  static MINIMUM_ORDER_AMOUNT = 5000;
  static SHIPPING_COST = 100;
  static FREE_SHIPPING_THRESHOLD = 5000;
  static LARGE_ORDER_COUPON_THRESHOLD = 5000;

  /**
   * Create order with full validation and stock management
   * @param {Object} orderData - Order data from request
   * @param {Object} user - User object
   * @returns {Promise<Object>} - Created order
   */
  async createOrder(orderData, user) {
    const { items, totalAmount, shippingAddress, paymentMethod, couponCode, discount } = orderData;

    // Step 1: Validate order data
    this._validateOrderData(orderData);

    // Step 2: Calculate final amount
    const finalAmount = discount ? totalAmount - discount : totalAmount;

    // Step 3: Validate minimum order amount
    if (finalAmount < OrderService.MINIMUM_ORDER_AMOUNT) {
      throw new OrderValidationError(
        `Minimum order amount is Rs. ${OrderService.MINIMUM_ORDER_AMOUNT}. Your order total after discount is Rs. ${finalAmount}. Please add more items to your cart.`,
        {
          finalAmount,
          minimumRequired: OrderService.MINIMUM_ORDER_AMOUNT,
          code: "MINIMUM_ORDER_NOT_MET",
        }
      );
    }

    // Step 4: Validate and reserve stock
    const stockResult = await stockService.validateAndReserveStock(items);

    if (!stockResult.success) {
      throw new StockValidationError("Stock validation failed", {
        errors: stockResult.errors,
        code: "STOCK_VALIDATION_FAILED",
      });
    }

    let order = null;

    try {
      // Step 5: Commit stock reservations
      await stockService.commitReservations(stockResult.reservations);

      // Step 6: Create order
      order = await Order.create({
        user: user._id,
        items,
        totalAmount,
        shippingAddress,
        paymentMethod: paymentMethod || "esewa",
        paymentStatus: "pending",
        orderStatus: "pending",
        couponCode: couponCode || undefined,
        discount: discount || 0,
      });

      // Step 7: Populate order for emails
      const populatedOrder = await Order.findById(order._id)
        .populate("items.product")
        .populate("user", "name email phone");

      // Step 8: Post-order operations (non-blocking)
      this._executePostOrderOperations(populatedOrder, user, finalAmount);

      return order;
    } catch (error) {
      // Rollback stock if order creation failed
      if (stockResult.reservations.length > 0) {
        console.error("❌ Order creation failed, rolling back stock...");
        await stockService.rollbackReservations(stockResult.reservations);
      }
      throw error;
    }
  }

  /**
   * Validate order data
   * @private
   */
  _validateOrderData(orderData) {
    const { items, totalAmount, shippingAddress } = orderData;

    if (!items?.length) {
      throw new OrderValidationError("No items in order", {
        code: "NO_ITEMS",
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      throw new OrderValidationError("Invalid total amount", {
        code: "INVALID_AMOUNT",
      });
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city
    ) {
      throw new OrderValidationError("Complete shipping address required", {
        code: "INCOMPLETE_ADDRESS",
      });
    }
  }

  /**
   * Execute post-order operations (async, non-blocking)
   * @private
   */
  async _executePostOrderOperations(order, user, finalAmount) {
    // Clear user cart
    this._clearUserCart(user._id);

    // Log activity
    this._logOrderActivity(order, user);

    // Send confirmation email
    this._sendConfirmationEmail(order, user);

    // Notify admins
    this._notifyAdmins(order);

    // Send coupon for large orders
    if (finalAmount >= OrderService.LARGE_ORDER_COUPON_THRESHOLD) {
      this._sendLargeOrderCoupon(order, user);
    }
  }

  /**
   * Clear user cart
   * @private
   */
  async _clearUserCart(userId) {
    try {
      await User.findByIdAndUpdate(userId, { cart: [] });
    } catch (error) {
      console.error("❌ Failed to clear cart:", error.message);
    }
  }

  /**
   * Log order activity
   * @private
   */
  async _logOrderActivity(order, user) {
    try {
      await logActivity(
        user._id,
        `Placed order #${order._id.toString().slice(-6)} - Rs. ${order.totalAmount}`,
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
    } catch (error) {
      console.error("❌ Failed to log activity:", error.message);
    }
  }

  /**
   * Send confirmation email
   * @private
   */
  async _sendConfirmationEmail(order, user) {
    try {
      await sendOrderConfirmationEmail(order, user);
    } catch (error) {
      console.error("❌ Failed to send confirmation email:", error.message);
    }
  }

  /**
   * Notify admins
   * @private
   */
  async _notifyAdmins(order) {
    try {
      await notifyNewOrder(order);
    } catch (error) {
      console.error("❌ Failed to notify admins:", error.message);
    }
  }

  /**
   * Send large order coupon
   * @private
   */
  async _sendLargeOrderCoupon(order, user) {
    try {
      const coupon = await sendCouponForLargeOrder(order, user);
      if (coupon) {
      }
    } catch (error) {
      console.error("❌ Failed to send coupon:", error.message);
    }
  }

  /**
   * Update order status with notifications
   * @param {String} orderId - Order ID
   * @param {Object} updateData - Status update data
   * @returns {Promise<Object>} - Updated order
   */
  async updateOrderStatus(orderId, updateData) {
    const { orderStatus, trackingNumber, estimatedDelivery } = updateData;

    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
      throw new OrderNotFoundError("Order not found");
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    // Update tracking info
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    // Add to tracking history
    order.trackingHistory.push({
      status: orderStatus,
      message: this._getStatusMessage(orderStatus),
      timestamp: new Date(),
    });

    const updatedOrder = await order.save();

    // Send notifications if status changed
    if (previousStatus !== orderStatus && order.user) {
      this._sendStatusChangeNotifications(updatedOrder, order.user, previousStatus, orderStatus);
    }

    return updatedOrder;
  }

  /**
   * Get status message
   * @private
   */
  _getStatusMessage(status) {
    const messages = {
      pending: "Order placed and awaiting confirmation",
      processing: "Order confirmed and being prepared",
      shipped: "Order has been shipped",
      delivered: "Order has been delivered",
      cancelled: "Order has been cancelled",
    };
    return messages[status] || "Status updated";
  }

  /**
   * Send status change notifications
   * @private
   */
  async _sendStatusChangeNotifications(order, user, previousStatus, newStatus) {
    try {
      // Send email based on status
      if (newStatus === "shipped") {
        await sendOrderShippedEmail(order, user);
      } else if (newStatus === "delivered") {
        await sendOrderDeliveredEmail(order, user);
      }

      // Notify admins
      if (newStatus === "cancelled") {
        await notifyOrderCancelled(order);
      } else {
        await notifyOrderStatusChange(order, previousStatus, newStatus);
      }
    } catch (error) {
      console.error("❌ Failed to send status notifications:", error.message);
    }
  }
}

/**
 * Custom error classes for better error handling
 */
class OrderValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "OrderValidationError";
    this.details = details;
    this.statusCode = 400;
  }
}

class StockValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "StockValidationError";
    this.details = details;
    this.statusCode = 400;
  }
}

class OrderNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "OrderNotFoundError";
    this.statusCode = 404;
  }
}

export default new OrderService();
export { OrderValidationError, StockValidationError, OrderNotFoundError };
