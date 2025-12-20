/**
 * Invoice PDF Generator Service
 * Generates HTML-based invoice that can be converted to PDF
 */

const storeName = "Khemsang Store";
const storeAddress = "Kathmandu, Nepal";
const storePhone = "+977-9800000000";
const storeEmail = "support@khemsangstore.com";

/**
 * Generate Invoice HTML
 */
export const generateInvoiceHTML = (order, user) => {
  const invoiceNumber = `INV-${order._id.toString().slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = order.items
    .map(
      (item, index) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center;">${
        index + 1
      }</td>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
        <strong>${item.product?.title || "Product"}</strong>
      </td>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center;">${
        item.quantity
      }</td>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;">Rs. ${item.price.toLocaleString()}</td>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">Rs. ${(
        item.price * item.quantity
      ).toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.5; }
        .invoice { max-width: 800px; margin: 0 auto; padding: 40px; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #6366f1; }
        .logo { font-size: 28px; font-weight: 700; color: #6366f1; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 32px; color: #6366f1; margin-bottom: 8px; }
        .invoice-title p { color: #6b7280; font-size: 14px; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .info-box { flex: 1; }
        .info-box h3 { font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; letter-spacing: 1px; }
        .info-box p { color: #374151; font-size: 14px; margin-bottom: 4px; }
        .info-box .highlight { font-weight: 600; color: #1f2937; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; padding: 14px 12px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        th:first-child { border-radius: 8px 0 0 0; }
        th:last-child { border-radius: 0 8px 0 0; text-align: right; }
        th:nth-child(3), th:nth-child(4) { text-align: center; }
        td { font-size: 14px; }
        .totals { margin-left: auto; width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .totals-row.total { border-bottom: none; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; padding: 16px; border-radius: 8px; margin-top: 10px; font-size: 18px; font-weight: 700; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 13px; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .invoice { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <!-- Header -->
        <div class="header">
          <div>
            <div class="logo">${storeName}</div>
            <p style="color:#6b7280;font-size:14px;margin-top:8px;">${storeAddress}</p>
            <p style="color:#6b7280;font-size:14px;">${storePhone}</p>
            <p style="color:#6b7280;font-size:14px;">${storeEmail}</p>
          </div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <p><strong>${invoiceNumber}</strong></p>
            <p>Date: ${orderDate}</p>
            <div style="margin-top:12px;">
              <span class="status-badge ${
                order.paymentStatus === "paid"
                  ? "status-paid"
                  : "status-pending"
              }">
                ${order.paymentStatus === "paid" ? "PAID" : "PENDING"}
              </span>
            </div>
          </div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <div class="info-box">
            <h3>Bill To</h3>
            <p class="highlight">${
              order.shippingAddress?.fullName || user?.name
            }</p>
            <p>${order.shippingAddress?.address}</p>
            <p>${order.shippingAddress?.city}</p>
            <p>Phone: ${order.shippingAddress?.phone}</p>
            <p>Email: ${user?.email}</p>
          </div>
          <div class="info-box" style="text-align:right;">
            <h3>Order Details</h3>
            <p>Order ID: <span class="highlight">#${order._id
              .toString()
              .slice(-8)
              .toUpperCase()}</span></p>
            <p>Payment: <span class="highlight">${
              order.paymentMethod?.toUpperCase() || "ESEWA"
            }</span></p>
            ${
              order.transactionId
                ? `<p>Transaction: <span class="highlight">${order.transactionId}</span></p>`
                : ""
            }
            ${
              order.couponCode
                ? `<p>Coupon: <span class="highlight">${order.couponCode}</span></p>`
                : ""
            }
          </div>
        </div>

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th style="width:50px;text-align:center;">#</th>
              <th>Item Description</th>
              <th style="width:80px;text-align:center;">Qty</th>
              <th style="width:120px;text-align:right;">Unit Price</th>
              <th style="width:120px;text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>Rs. ${subtotal.toLocaleString()}</span>
          </div>
          ${
            order.discount > 0
              ? `
          <div class="totals-row">
            <span>Discount</span>
            <span style="color:#10b981;">-Rs. ${order.discount.toLocaleString()}</span>
          </div>
          `
              : ""
          }
          <div class="totals-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div class="totals-row total">
            <span>Total</span>
            <span>Rs. ${order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p style="margin-bottom:8px;">Thank you for shopping with ${storeName}!</p>
          <p>For any queries, contact us at ${storeEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate Invoice Data (JSON format for frontend PDF generation)
 */
export const generateInvoiceData = (order, user) => {
  return {
    invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
    orderDate: new Date(order.createdAt).toISOString(),
    store: {
      name: storeName,
      address: storeAddress,
      phone: storePhone,
      email: storeEmail,
    },
    customer: {
      name: order.shippingAddress?.fullName || user?.name,
      email: user?.email,
      address: order.shippingAddress?.address,
      city: order.shippingAddress?.city,
      phone: order.shippingAddress?.phone,
    },
    order: {
      id: order._id,
      shortId: order._id.toString().slice(-8).toUpperCase(),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId,
      couponCode: order.couponCode,
    },
    items: order.items.map((item) => ({
      name: item.product?.title || "Product",
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    })),
    subtotal: order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
    discount: order.discount || 0,
    shipping: 0,
    total: order.totalAmount,
  };
};

export default {
  generateInvoiceHTML,
  generateInvoiceData,
};
