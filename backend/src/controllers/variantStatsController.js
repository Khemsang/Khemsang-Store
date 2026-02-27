/**
 * ========================================
 * VARIANT STATISTICS CONTROLLER
 * Get order statistics for product variants
 * ========================================
 */

import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * Get variant order statistics for a product
 * GET /api/variant-stats/:productId
 */
export const getVariantStats = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get all completed orders containing this product
    const orders = await Order.find({
      "items.product": productId,
      orderStatus: { $in: ["delivered", "shipped", "processing"] },
    }).select("items orderStatus createdAt");

    // Calculate statistics for each variant
    const variantStats = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product.toString() === productId && item.colorVariant) {
          const variantKey = item.colorVariant.colorName;

          if (!variantStats[variantKey]) {
            variantStats[variantKey] = {
              colorName: item.colorVariant.colorName,
              colorCode: item.colorVariant.colorCode,
              totalOrders: 0,
              totalQuantity: 0,
              ordersByStatus: {
                processing: 0,
                shipped: 0,
                delivered: 0,
              },
            };
          }

          variantStats[variantKey].totalOrders += 1;
          variantStats[variantKey].totalQuantity += item.quantity;
          variantStats[variantKey].ordersByStatus[order.orderStatus] =
            (variantStats[variantKey].ordersByStatus[order.orderStatus] || 0) + item.quantity;
        }
      });
    });

    // Convert to array
    const statsArray = Object.values(variantStats);

    res.json({
      productId,
      variants: statsArray,
      totalVariants: statsArray.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all variant statistics for admin
 * GET /api/variant-stats
 */
export const getAllVariantStats = async (req, res) => {
  try {
    // Get all products with variants
    const products = await Product.find({ 
      colorVariants: { $exists: true, $ne: [] } 
    }).select("title colorVariants");

    const allStats = [];

    for (const product of products) {
      // Get orders for this product
      const orders = await Order.find({
        "items.product": product._id,
        orderStatus: { $in: ["delivered", "shipped", "processing"] },
      }).select("items orderStatus");

      const variantStats = {};

      orders.forEach((order) => {
        order.items.forEach((item) => {
          if (item.product.toString() === product._id.toString() && item.colorVariant) {
            const variantKey = item.colorVariant.colorName;

            if (!variantStats[variantKey]) {
              variantStats[variantKey] = {
                colorName: item.colorVariant.colorName,
                colorCode: item.colorVariant.colorCode,
                totalOrders: 0,
                totalQuantity: 0,
              };
            }

            variantStats[variantKey].totalOrders += 1;
            variantStats[variantKey].totalQuantity += item.quantity;
          }
        });
      });

      if (Object.keys(variantStats).length > 0) {
        allStats.push({
          productId: product._id,
          productTitle: product.title,
          variants: Object.values(variantStats),
        });
      }
    }

    res.json(allStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
