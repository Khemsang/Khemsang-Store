import nodemailer from "nodemailer";

// Create transporter inline
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export const sendOrderConfirmationEmail = async (order, user) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${
      process.env.GMAIL_USER
    }>`,
    to: user.email,
    subject: `Order Confirmation #${order._id.toString().slice(-6)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .order-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-size: 20px; font-weight: bold; color: #10b981; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p>Order #${order._id.toString().slice(-6)}</p>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Thank you for your order! We've received your order and will process it soon.</p>
            
            <div class="order-details">
              <h3>Order Details:</h3>
              ${order.items
                .map(
                  (item) => `
                <div class="item">
                  <strong>${item.product?.name || "Product"}</strong><br>
                  Quantity: ${item.quantity} × Rs. ${item.price}<br>
                  Subtotal: Rs. ${item.quantity * item.price}
                </div>
              `
                )
                .join("")}
              <div class="total">Total: Rs. ${order.totalAmount}</div>
            </div>

            <div class="order-details">
              <h3>Shipping Address:</h3>
              <p>
                ${order.shippingAddress.fullName}<br>
                ${order.shippingAddress.phone}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}
              </p>
            </div>

            <p>We'll send you another email when your order ships.</p>
          </div>
          <div class="footer">
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOrderShippedEmail = async (order, user) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${
      process.env.GMAIL_USER
    }>`,
    to: user.email,
    subject: `Your Order Has Been Shipped! #${order._id.toString().slice(-6)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .tracking { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
          .tracking-number { font-size: 24px; font-weight: bold; color: #3b82f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Shipped!</h1>
            <p>Order #${order._id.toString().slice(-6)}</p>
          </div>
          <div class="content">
            <p>Hi ${user.email},</p>
            <p>Great news! Your order has been shipped and is on its way to you.</p>
            
            ${
              order.trackingNumber
                ? `
              <div class="tracking">
                <p>Tracking Number:</p>
                <div class="tracking-number">${order.trackingNumber}</div>
              </div>
            `
                : ""
            }

            <p>Expected delivery: ${
              order.estimatedDelivery
                ? new Date(order.estimatedDelivery).toLocaleDateString()
                : "Soon"
            }</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOrderDeliveredEmail = async (order, user) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"${process.env.STORE_NAME || "Khemsang Store"}" <${
      process.env.GMAIL_USER
    }>`,
    to: user.email,
    subject: `Order Delivered! #${order._id.toString().slice(-6)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Delivered!</h1>
            <p>Order #${order._id.toString().slice(-6)}</p>
          </div>
          <div class="content">
            <p>Hi ${user.email},</p>
            <p>Your order has been successfully delivered!</p>
            <p>We hope you enjoy your purchase. Thank you for shopping with us!</p>
            <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
};
