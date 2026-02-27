import Message from "../models/Message.js";
import User from "../models/User.js";

/**
 * ========================================
 * NOTIFICATION SERVICE
 * Automatically creates inbox notifications
 * for orders, products, and customer events
 * ========================================
 */

// Get all admin users
const getAdminUsers = async () => {
  try {
    const admins = await User.find({ 
      $or: [
        { role: "admin" },
        { isAdmin: true }
      ]
    }).select("_id");
    return admins.map((admin) => admin._id);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
};

// Create notification for all admins
const createAdminNotification = async (subject, message, metadata = {}) => {
  try {
    const adminIds = await getAdminUsers();
    
    if (adminIds.length === 0) {
      console.warn("No admin users found to send notification");
      return;
    }

    // Use the first admin as system sender
    const systemSender = adminIds[0];

    // Create individual notification for each admin
    const notifications = adminIds.map((adminId) => ({
      sender: systemSender,
      recipient: adminId,
      subject,
      message,
      isRead: false,
      isDraft: false,
      isStarred: false,
      deletedBy: [],
      metadata,
    }));

    const result = await Message.insertMany(notifications);
    return result;
  } catch (error) {
    console.error("Error creating admin notification:", error);
    throw error;
  }
};

/**
 * ORDER NOTIFICATIONS
 */
export const notifyNewOrder = async (order) => {
  const subject = `🛒 New Order #${order.orderNumber || order._id.toString().slice(-6)}`;
  
  // Format items with proper product details and color variant
  const itemsList = order.items?.map((item, index) => {
    const productName = item.product?.title || item.product?.name || "Product";
    const colorInfo = item.colorVariant ? ` | Color: ${item.colorVariant.colorName}` : "";
    const priceInfo = item.price ? ` | Price: Rs. ${item.price.toLocaleString()}` : "";
    return `${index + 1}. ${productName}
   Quantity: ${item.quantity}${colorInfo}${priceInfo}
   Subtotal: Rs. ${(item.quantity * (item.price || 0)).toLocaleString()}`;
  }).join("\n\n") || "No items";
  
  const message = `
New order received!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order ID: ${order._id}
Order Date: ${new Date(order.createdAt).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${order.user?.name || order.shippingAddress?.fullName || "Guest"}
Email: ${order.user?.email || order.shippingAddress?.email || "N/A"}
Phone: ${order.user?.phone || order.shippingAddress?.phone || "N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHIPPING ADDRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${order.shippingAddress?.fullName || "N/A"}
Phone: ${order.shippingAddress?.phone || "N/A"}
Email: ${order.shippingAddress?.email || "N/A"}
Address: ${order.shippingAddress?.address || "N/A"}
City: ${order.shippingAddress?.city || "N/A"}
Postal Code: ${order.shippingAddress?.postalCode || "N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER ITEMS (${order.items?.length || 0} product(s))
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT & STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Amount: Rs. ${order.totalAmount?.toLocaleString()}
Payment Method: ${order.paymentMethod?.toUpperCase()}
Payment Status: ${order.paymentStatus?.toUpperCase()}
Order Status: ${order.orderStatus?.toUpperCase()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "order",
    orderId: order._id,
    orderNumber: order.orderNumber,
  });
};

export const notifyOrderStatusChange = async (order, oldStatus, newStatus) => {
  const subject = `📦 Order Status Updated - #${order.orderNumber || order._id.toString().slice(-6)}`;
  const message = `
Order status has been changed.

Order ID: ${order._id}
Customer: ${order.user?.name || "Guest"}
Status Changed: ${oldStatus} → ${newStatus}
Total Amount: Rs. ${order.totalAmount?.toLocaleString()}

Updated: ${new Date().toLocaleString()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "order_status",
    orderId: order._id,
    oldStatus,
    newStatus,
  });
};

export const notifyOrderCancelled = async (order) => {
  const subject = `❌ Order Cancelled - #${order.orderNumber || order._id.toString().slice(-6)}`;
  const message = `
An order has been cancelled.

Order ID: ${order._id}
Customer: ${order.user?.name || "Guest"}
Email: ${order.user?.email || "N/A"}
Total Amount: Rs. ${order.totalAmount?.toLocaleString()}
Reason: ${order.cancellationReason || "Not specified"}

Cancelled: ${new Date().toLocaleString()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "order_cancelled",
    orderId: order._id,
  });
};

/**
 * PRODUCT NOTIFICATIONS
 */
export const notifyNewProduct = async (product) => {
  const subject = `✨ New Product Added - ${product.title || product.name}`;
  const message = `
A new product has been added to the store.

Product: ${product.title || product.name}
Category: ${product.category}
Price: Rs. ${product.price?.toLocaleString()}
Stock: ${product.stock} units
Status: ${product.isActive ? "Active" : "Inactive"}

Description: ${product.description?.substring(0, 200) || "No description"}

Added: ${new Date(product.createdAt).toLocaleString()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "product_new",
    productId: product._id,
  });
};

export const notifyProductOutOfStock = async (product) => {
  const subject = `⚠️ Product Out of Stock - ${product.title || product.name}`;
  const message = `
A product is now out of stock!

Product: ${product.title || product.name}
Category: ${product.category}
Price: Rs. ${product.price?.toLocaleString()}
Current Stock: ${product.stock}

Action Required: Restock this product or mark it as inactive.

Alert Time: ${new Date().toLocaleString()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "product_out_of_stock",
    productId: product._id,
  });
};

export const notifyProductLowStock = async (product, threshold = 10) => {
  const subject = `⚠️ Low Stock Alert - ${product.title || product.name}`;
  const message = `
Product stock is running low!

Product: ${product.title || product.name}
Category: ${product.category}
Current Stock: ${product.stock} units
Threshold: ${threshold} units

Action Recommended: Consider restocking soon.

Alert Time: ${new Date().toLocaleString()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "product_low_stock",
    productId: product._id,
    currentStock: product.stock,
  });
};

export const notifyProductUpdated = async (product, changes) => {
  const subject = `📝 Product Updated - ${product.title || product.name}`;
  const message = `
A product has been updated.

Product: ${product.title || product.name}
Category: ${product.category}

Changes Made:
${Object.entries(changes || {})
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

Updated: ${new Date().toLocaleString()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "product_updated",
    productId: product._id,
  });
};

export const notifyProductDeleted = async (product) => {
  const subject = `🗑️ Product Deleted - ${product.title || product.name}`;
  const message = `
A product has been deleted from the store.

Product: ${product.title || product.name}
Category: ${product.category}
Price: Rs. ${product.price?.toLocaleString()}

Deleted: ${new Date().toLocaleString()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "product_deleted",
    productId: product._id,
  });
};

/**
 * CUSTOMER NOTIFICATIONS
 */
export const notifyNewCustomer = async (user) => {
  // Fetch the complete user data with phone and address
  const completeUser = await User.findById(user._id).select('name email phone address createdAt');
  
  const subject = `👤 New Customer Registered - ${completeUser.name}`;
  const message = `
A new customer has registered!

Name: ${completeUser.name}
Email: ${completeUser.email}
Phone: ${completeUser.phone || "Not provided"}
Address: ${completeUser.address || "Not provided"}

Registration Date: ${new Date(completeUser.createdAt).toLocaleString()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "customer_new",
    userId: completeUser._id,
  });
};

export const notifyCustomerUpdated = async (user) => {
  const subject = `📝 Customer Profile Updated - ${user.name}`;
  const message = `
A customer has updated their profile.

Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || "Not provided"}

Updated: ${new Date().toLocaleString()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "customer_updated",
    userId: user._id,
  });
};

/**
 * REVIEW NOTIFICATIONS
 */
export const notifyNewReview = async (review, product) => {
  const subject = `⭐ New Review - ${product.name}`;
  const message = `
A new review has been submitted!

Product: ${product.name}
Rating: ${"⭐".repeat(review.rating)} (${review.rating}/5)
Customer: ${review.user?.name || "Anonymous"}

Review: ${review.comment || "No comment"}

Submitted: ${new Date(review.createdAt).toLocaleString()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "review_new",
    reviewId: review._id,
    productId: product._id,
  });
};

/**
 * CONTACT MESSAGE NOTIFICATIONS
 */
export const notifyNewContactMessage = async (contactMessage) => {
  const subject = `📧 New Contact Message - ${contactMessage.name}`;
  const message = `
New contact form submission received!

Name: ${contactMessage.name}
Email: ${contactMessage.email}
Phone: ${contactMessage.phone || "Not provided"}
Subject: ${contactMessage.subject || "No subject"}

Message:
${contactMessage.message}

Received: ${new Date(contactMessage.createdAt).toLocaleString()}
  `.trim();

  await createAdminNotification(subject, message, {
    type: "contact_message",
    contactMessageId: contactMessage._id,
  });
};

export default {
  notifyNewOrder,
  notifyOrderStatusChange,
  notifyOrderCancelled,
  notifyNewProduct,
  notifyProductOutOfStock,
  notifyProductLowStock,
  notifyProductUpdated,
  notifyProductDeleted,
  notifyNewCustomer,
  notifyCustomerUpdated,
  notifyNewReview,
  notifyNewContactMessage,
};
