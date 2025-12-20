import { sendEmail } from "../../config/email.js";
import {
  orderConfirmationTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
} from "./emailTemplates.js";

const storeName = "Khemsang Store";

/**
 * Send Order Confirmation Email
 */
export const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const html = orderConfirmationTemplate(order, user);
    await sendEmail({
      to: user.email,
      subject: `✅ Order Confirmed #${order._id
        .toString()
        .slice(-8)
        .toUpperCase()} - ${storeName}`,
      html,
    });
    console.log(`✅ Order confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
};

/**
 * Send Order Shipped Email
 */
export const sendOrderShippedEmail = async (order, user) => {
  try {
    const html = orderShippedTemplate(order, user);
    await sendEmail({
      to: user.email,
      subject: `🚚 Your Order is Shipped! #${order._id
        .toString()
        .slice(-8)
        .toUpperCase()} - ${storeName}`,
      html,
    });
    console.log(`✅ Order shipped email sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send order shipped email:", error);
  }
};

/**
 * Send Order Delivered Email
 */
export const sendOrderDeliveredEmail = async (order, user) => {
  try {
    const html = orderDeliveredTemplate(order, user);
    await sendEmail({
      to: user.email,
      subject: `🎉 Order Delivered! #${order._id
        .toString()
        .slice(-8)
        .toUpperCase()} - ${storeName}`,
      html,
    });
    console.log(`✅ Order delivered email sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send order delivered email:", error);
  }
};

export default {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
};
