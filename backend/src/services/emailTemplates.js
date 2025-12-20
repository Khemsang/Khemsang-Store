/**
 * Email Templates for Order Notifications
 */

const storeName = "Khemsang Store";

// Order Confirmation Email
export const orderConfirmationTemplate = (order, user) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${item.product?.images?.[0] || ""}" alt="${
        item.product?.title || "Product"
      }" style="width:60px;height:60px;object-fit:cover;border-radius:8px;"/>
          <div>
            <p style="margin:0;font-weight:600;color:#1f2937;">${
              item.product?.title || "Product"
            }</p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:14px;">Qty: ${
              item.quantity
            }</p>
          </div>
        </div>
      </td>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#1f2937;">
        Rs. ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px;text-align:center;">
                  <div style="font-size:50px;margin-bottom:16px;">✅</div>
                  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Order Confirmed!</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Thank you for your purchase</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#374151;font-size:16px;margin:0 0 20px;">Hi ${
                    user?.name || "Customer"
                  },</p>
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 30px;">
                    Your order has been confirmed and is being processed. Here are your order details:
                  </p>
                  
                  <!-- Order Info -->
                  <div style="background-color:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:14px;">Order ID</td>
                        <td style="text-align:right;font-weight:600;color:#1f2937;">#${order._id
                          .toString()
                          .slice(-8)
                          .toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;padding-top:8px;">Order Date</td>
                        <td style="text-align:right;font-weight:600;color:#1f2937;padding-top:8px;">${new Date(
                          order.createdAt
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;padding-top:8px;">Payment Status</td>
                        <td style="text-align:right;padding-top:8px;">
                          <span style="background-color:${
                            order.paymentStatus === "paid"
                              ? "#dcfce7"
                              : "#fef3c7"
                          };color:${
    order.paymentStatus === "paid" ? "#166534" : "#92400e"
  };padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">
                            ${order.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Items -->
                  <h3 style="color:#1f2937;font-size:18px;margin:0 0 16px;">Order Items</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    ${itemsHtml}
                  </table>

                  <!-- Total -->
                  <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);border-radius:12px;padding:20px;color:#ffffff;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${
                        order.discount > 0
                          ? `
                      <tr>
                        <td style="font-size:14px;opacity:0.9;">Discount</td>
                        <td style="text-align:right;font-size:14px;">-Rs. ${order.discount.toLocaleString()}</td>
                      </tr>
                      `
                          : ""
                      }
                      <tr>
                        <td style="font-size:18px;font-weight:700;padding-top:8px;">Total Amount</td>
                        <td style="text-align:right;font-size:24px;font-weight:700;padding-top:8px;">Rs. ${order.totalAmount.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Shipping Address -->
                  <h3 style="color:#1f2937;font-size:18px;margin:24px 0 16px;">Shipping Address</h3>
                  <div style="background-color:#f9fafb;border-radius:12px;padding:20px;">
                    <p style="margin:0;font-weight:600;color:#1f2937;">${
                      order.shippingAddress?.fullName
                    }</p>
                    <p style="margin:8px 0 0;color:#6b7280;">${
                      order.shippingAddress?.address
                    }</p>
                    <p style="margin:4px 0 0;color:#6b7280;">${
                      order.shippingAddress?.city
                    }</p>
                    <p style="margin:4px 0 0;color:#6b7280;">Phone: ${
                      order.shippingAddress?.phone
                    }</p>
                  </div>

                  <!-- Track Order Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.FRONTEND_URL}/order/${
    order._id
  }" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
                          📦 Track Your Order
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af;font-size:13px;margin:0;">
                    © ${new Date().getFullYear()} ${storeName}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Order Shipped Email
export const orderShippedTemplate = (order, user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);padding:40px;text-align:center;">
                  <div style="font-size:50px;margin-bottom:16px;">🚚</div>
                  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Your Order is Shipped!</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">It's on the way to you</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#374151;font-size:16px;margin:0 0 20px;">Hi ${
                    user?.name || "Customer"
                  },</p>
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 30px;">
                    Great news! Your order has been shipped and is on its way to you.
                  </p>
                  
                  <!-- Tracking Info -->
                  <div style="background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);border:2px solid #3b82f6;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
                    <p style="color:#1d4ed8;font-size:14px;margin:0 0 8px;font-weight:600;">TRACKING NUMBER</p>
                    <p style="color:#1e40af;font-size:24px;font-weight:700;margin:0;letter-spacing:2px;">${
                      order.trackingNumber || "N/A"
                    }</p>
                  </div>

                  <!-- Order Info -->
                  <div style="background-color:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:14px;">Order ID</td>
                        <td style="text-align:right;font-weight:600;color:#1f2937;">#${order._id
                          .toString()
                          .slice(-8)
                          .toUpperCase()}</td>
                      </tr>
                      ${
                        order.estimatedDelivery
                          ? `
                      <tr>
                        <td style="color:#6b7280;font-size:14px;padding-top:8px;">Estimated Delivery</td>
                        <td style="text-align:right;font-weight:600;color:#1f2937;padding-top:8px;">${new Date(
                          order.estimatedDelivery
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</td>
                      </tr>
                      `
                          : ""
                      }
                    </table>
                  </div>

                  <!-- Shipping Address -->
                  <h3 style="color:#1f2937;font-size:18px;margin:0 0 16px;">Delivering To</h3>
                  <div style="background-color:#f9fafb;border-radius:12px;padding:20px;">
                    <p style="margin:0;font-weight:600;color:#1f2937;">${
                      order.shippingAddress?.fullName
                    }</p>
                    <p style="margin:8px 0 0;color:#6b7280;">${
                      order.shippingAddress?.address
                    }, ${order.shippingAddress?.city}</p>
                  </div>

                  <!-- Track Order Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.FRONTEND_URL}/order/${
    order._id
  }" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
                          📍 Track Your Package
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af;font-size:13px;margin:0;">
                    © ${new Date().getFullYear()} ${storeName}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Order Delivered Email
export const orderDeliveredTemplate = (order, user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px;text-align:center;">
                  <div style="font-size:50px;margin-bottom:16px;">🎉</div>
                  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Order Delivered!</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Your package has arrived</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#374151;font-size:16px;margin:0 0 20px;">Hi ${
                    user?.name || "Customer"
                  },</p>
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 30px;">
                    Your order has been delivered! We hope you love your purchase.
                  </p>
                  
                  <!-- Order Info -->
                  <div style="background-color:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:14px;">Order ID</td>
                        <td style="text-align:right;font-weight:600;color:#1f2937;">#${order._id
                          .toString()
                          .slice(-8)
                          .toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;padding-top:8px;">Delivered On</td>
                        <td style="text-align:right;font-weight:600;color:#1f2937;padding-top:8px;">${new Date().toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Review Request -->
                  <div style="background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                    <p style="color:#92400e;font-size:16px;margin:0 0 8px;font-weight:600;">⭐ How was your experience?</p>
                    <p style="color:#a16207;font-size:14px;margin:0;">We'd love to hear your feedback! Leave a review for your purchased items.</p>
                  </div>

                  <!-- Review Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${
                          process.env.FRONTEND_URL
                        }/orders" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
                          ⭐ Write a Review
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#f9fafb;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#6b7280;font-size:14px;margin:0 0 10px;">Thank you for shopping with us!</p>
                  <p style="color:#9ca3af;font-size:13px;margin:0;">
                    © ${new Date().getFullYear()} ${storeName}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export default {
  orderConfirmationTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
};
