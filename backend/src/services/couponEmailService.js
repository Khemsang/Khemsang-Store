import nodemailer from "nodemailer";
import Coupon from "../models/Coupon.js";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Generate unique coupon code
const generateCouponCode = () => {
  const prefix = "THANK";
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}`;
};

// Create and send coupon for orders above threshold
export const sendCouponForLargeOrder = async (order, user) => {
  try {
    const THRESHOLD = 5000; // Rs. 5000
    
    // Check if order amount is above threshold
    if (order.totalAmount < THRESHOLD) {
      return null;
    }

    // Generate unique coupon code
    const couponCode = generateCouponCode();
    
    // Calculate coupon value (10% of order or Rs. 500, whichever is less)
    const discountValue = Math.min(Math.round(order.totalAmount * 0.1), 500);
    
    // Set expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Create coupon in database
    const coupon = await Coupon.create({
      code: couponCode,
      description: `Thank you coupon for order #${order._id.toString().slice(-6)}`,
      discountType: "fixed",
      discountValue: discountValue,
      minOrderAmount: 1000,
      maxDiscount: discountValue,
      usageLimit: 1, // Single use
      usedCount: 0,
      startDate: new Date(),
      endDate: expiryDate,
      isActive: true,
    });

    // Send email with coupon
    const mailOptions = {
      from: `${process.env.STORE_NAME || "Khemsang Furniture"} <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: `🎉 Thank You! Here's Your Exclusive Coupon Code`,
      html: generateCouponEmailHTML(order, user, coupon),
    };

    await transporter.sendMail(mailOptions);
    
    return coupon;
  } catch (error) {
    console.error("❌ Error sending coupon email:", error);
    throw error;
  }
};

// Generate HTML for coupon email
const generateCouponEmailHTML = (order, user, coupon) => {
  const storeName = process.env.STORE_NAME || "Khemsang Furniture";
  const orderNumber = order._id.toString().slice(-6);
  const expiryDate = new Date(coupon.endDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        .coupon-box {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .coupon-label {
          color: white;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }
        .coupon-code {
          background: white;
          color: #f5576c;
          font-size: 32px;
          font-weight: bold;
          padding: 15px 30px;
          border-radius: 10px;
          letter-spacing: 3px;
          display: inline-block;
          margin: 10px 0;
          font-family: 'Courier New', monospace;
        }
        .coupon-value {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-top: 15px;
        }
        .details {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #666;
          font-weight: 500;
        }
        .detail-value {
          color: #333;
          font-weight: bold;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-weight: bold;
          font-size: 16px;
          margin: 20px 0;
          transition: transform 0.3s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        .emoji {
          font-size: 48px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">🎉</div>
          <h1>Thank You for Your Order!</h1>
        </div>
        
        <div class="content">
          <div class="greeting">
            Dear ${user.name},
          </div>
          
          <div class="message">
            Thank you for your order <strong>#${orderNumber}</strong> worth <strong>Rs. ${order.totalAmount.toLocaleString()}</strong>! 
            We truly appreciate your business and trust in ${storeName}.
            <br><br>
            As a token of our gratitude, we're excited to offer you an exclusive discount coupon for your next purchase!
          </div>

          <div class="coupon-box">
            <div class="coupon-label">Your Exclusive Coupon Code</div>
            <div class="coupon-code">${coupon.code}</div>
            <div class="coupon-value">Save Rs. ${coupon.discountValue}</div>
          </div>

          <div class="details">
            <div class="detail-row">
              <span class="detail-label">💰 Discount Amount:</span>
              <span class="detail-value">Rs. ${coupon.discountValue}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📦 Minimum Order:</span>
              <span class="detail-value">Rs. ${coupon.minOrderAmount}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">⏰ Valid Until:</span>
              <span class="detail-value">${expiryDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🎫 Usage Limit:</span>
              <span class="detail-value">One Time Use</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="cta-button">
              Shop Now
            </a>
          </div>

          <div class="message" style="margin-top: 30px; font-size: 14px; color: #999;">
            <strong>How to use:</strong><br>
            1. Add items to your cart (minimum Rs. ${coupon.minOrderAmount})<br>
            2. Enter code <strong>${coupon.code}</strong> at checkout<br>
            3. Enjoy your discount!
          </div>
        </div>

        <div class="footer">
          <p>
            <strong>${storeName}</strong><br>
            Quality Furniture for Your Home
          </p>
          <p>
            Questions? Contact us at <a href="mailto:${process.env.GMAIL_USER}">${process.env.GMAIL_USER}</a>
          </p>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            This coupon is valid for 30 days and can be used once.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
