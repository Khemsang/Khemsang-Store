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
  
  // Calculate totals
  const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const shipping = order.shippingCost || 0;
  const discount = order.discount || 0;
  
  const mailOptions = {
    from: `"${process.env.STORE_NAME || "Khemsang Furniture"}" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `✅ Order Confirmed - #${order._id.toString().slice(-6).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            background-color: #f3f4f6;
          }
          .email-wrapper { 
            max-width: 600px; 
            margin: 40px auto; 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 { 
            font-size: 28px; 
            margin-bottom: 10px;
            font-weight: 700;
          }
          .header p { 
            font-size: 16px; 
            opacity: 0.95;
          }
          .content { 
            padding: 40px 30px;
          }
          .greeting { 
            font-size: 18px; 
            margin-bottom: 20px;
            color: #111827;
          }
          .section { 
            background: #f9fafb; 
            padding: 24px; 
            border-radius: 12px; 
            margin: 24px 0;
            border: 1px solid #e5e7eb;
          }
          .section-title { 
            font-size: 18px; 
            font-weight: 600; 
            color: #111827; 
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .item { 
            display: flex;
            justify-content: space-between;
            padding: 16px 0; 
            border-bottom: 1px solid #e5e7eb;
          }
          .item:last-child { border-bottom: none; }
          .item-details { flex: 1; }
          .item-name { 
            font-weight: 600; 
            color: #111827; 
            margin-bottom: 4px;
          }
          .item-meta { 
            font-size: 14px; 
            color: #6b7280;
          }
          .item-price { 
            font-weight: 600; 
            color: #111827;
            text-align: right;
          }
          .totals { 
            margin-top: 20px; 
            padding-top: 20px; 
            border-top: 2px solid #e5e7eb;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0;
            font-size: 15px;
          }
          .total-row.final { 
            font-size: 20px; 
            font-weight: 700; 
            color: #3b82f6;
            padding-top: 16px;
            border-top: 2px solid #3b82f6;
            margin-top: 12px;
          }
          .shipping-info { 
            line-height: 1.8;
          }
          .shipping-info strong { 
            display: block; 
            color: #111827; 
            margin-bottom: 4px;
          }
          .shipping-info p { 
            color: #4b5563; 
            margin: 2px 0;
          }
          .status-badge { 
            display: inline-block;
            padding: 6px 16px;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 12px;
          }
          .footer { 
            background: #f9fafb; 
            padding: 30px; 
            text-align: center; 
            border-top: 1px solid #e5e7eb;
          }
          .footer p { 
            color: #6b7280; 
            font-size: 14px; 
            margin: 8px 0;
          }
          .button { 
            display: inline-block;
            padding: 14px 32px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: background 0.3s;
          }
          .button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p>Order #${order._id.toString().slice(-6).toUpperCase()}</p>
            <p style="font-size: 14px; margin-top: 8px;">${new Date(order.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div class="content">
            <p class="greeting">Dear ${user.name},</p>
            <p style="color: #4b5563; margin-bottom: 24px;">
              Thank you for your order! We've received your order and will start processing it shortly. 
              You'll receive another email when your order ships.
            </p>

            <div class="section">
              <div class="section-title">
                <span>📦</span> Order Items
              </div>
              ${order.items.map(item => `
                <div class="item">
                  <div class="item-details">
                    <div class="item-name">${item.product?.title || item.product?.name || 'Product'}</div>
                    <div class="item-meta">
                      Quantity: ${item.quantity} × Rs. ${item.price.toLocaleString()}
                      ${item.colorVariant ? `<br><span style="display: inline-flex; align-items: center; gap: 6px;">Color: ${item.colorVariant.colorName} <span style="display: inline-block; width: 16px; height: 16px; border-radius: 50%; background-color: ${item.colorVariant.colorCode}; border: 2px solid #e5e7eb;"></span></span>` : ''}
                      ${item.size ? ` | Size: ${item.size}` : ''}
                    </div>
                  </div>
                  <div class="item-price">
                    Rs. ${(item.quantity * item.price).toLocaleString()}
                  </div>
                </div>
              `).join('')}
              
              <div class="totals">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>Rs. ${subtotal.toLocaleString()}</span>
                </div>
                ${shipping > 0 ? `
                  <div class="total-row">
                    <span>Shipping:</span>
                    <span>Rs. ${shipping.toLocaleString()}</span>
                  </div>
                ` : ''}
                ${discount > 0 ? `
                  <div class="total-row" style="color: #10b981;">
                    <span>Discount:</span>
                    <span>- Rs. ${discount.toLocaleString()}</span>
                  </div>
                ` : ''}
                <div class="total-row final">
                  <span>Total Amount:</span>
                  <span>Rs. ${order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">
                <span>🚚</span> Shipping Information
              </div>
              <div class="shipping-info">
                <strong>${order.shippingAddress.fullName}</strong>
                <p>📧 ${order.shippingAddress.email || user.email}</p>
                <p>📱 ${order.shippingAddress.phone}</p>
                <p>📍 ${order.shippingAddress.address}</p>
                <p>${order.shippingAddress.city}${order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ''}</p>
                <div class="status-badge">Status: ${order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">
                <span>💳</span> Payment Information
              </div>
              <p style="color: #4b5563;">
                <strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}<br>
                <strong>Payment Status:</strong> <span style="color: ${order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'}; font-weight: 600;">
                  ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <p style="color: #6b7280; margin-bottom: 16px;">Need help with your order?</p>
              <a href="mailto:${process.env.SMTP_USER}" class="button">Contact Support</a>
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for shopping with ${process.env.STORE_NAME || 'Khemsang Furniture'}!</strong></p>
            <p>If you have any questions, please contact us at ${process.env.SMTP_USER}</p>
            <p style="margin-top: 16px; font-size: 12px;">
              This is an automated email. Please do not reply to this message.
            </p>
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
