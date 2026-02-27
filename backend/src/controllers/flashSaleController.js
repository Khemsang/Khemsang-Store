import Product from "../models/Product.js";

// Get all active flash sale products
export const getActiveFlashSales = async (req, res) => {
  try {
    const now = new Date();

    const flashSales = await Product.find({
      $or: [
        // Product-level flash sales
        {
          isFlashSale: true,
          flashStartTime: { $lte: now },
          flashEndTime: { $gte: now },
          flashStock: { $gt: 0 },
          isActive: true,
        },
        // Variant-level flash sales
        {
          "colorVariants.isFlashSale": true,
          "colorVariants.flashStartTime": { $lte: now },
          "colorVariants.flashEndTime": { $gte: now },
          "colorVariants.flashStock": { $gt: 0 },
          isActive: true,
        }
      ]
    }).sort({ flashEndTime: 1 }); // Sort by ending soon

    // Filter and transform products to show only active flash sale variants
    const activeFlashSales = flashSales
      .map(product => {
        const productObj = product.toObject();

        // Check product-level flash sale
        if (product.isFlashSaleActive()) {
          return productObj;
        }

        // Check variant-level flash sales
        if (product.colorVariants && product.colorVariants.length > 0) {
          const activeVariants = product.colorVariants.filter(variant => {
            if (!variant.isFlashSale) return false;
            const now = new Date();
            return variant.flashStartTime <= now &&
                   variant.flashEndTime >= now &&
                   variant.flashStock > 0;
          });

          // If there are active flash sale variants, return product with only those variants
          if (activeVariants.length > 0) {
            productObj.colorVariants = activeVariants;

            // Set product-level flash sale info from the first variant for display purposes
            // This ensures the product card shows flash sale badge
            if (!productObj.isFlashSale && activeVariants.length > 0) {
              const firstVariant = activeVariants[0];
              productObj.flashDiscountType = firstVariant.flashDiscountType;
              productObj.flashDiscountValue = firstVariant.flashDiscountValue;
              productObj.flashStartTime = firstVariant.flashStartTime;
              productObj.flashEndTime = firstVariant.flashEndTime;
              productObj.flashStock = activeVariants.reduce((sum, v) => sum + (v.flashStock || 0), 0);
            }

            return productObj;
          }
        }

        return null;
      })
      .filter(product => product !== null);

    res.json(activeFlashSales);
  } catch (err) {
    console.error("Error fetching active flash sales:", err);
    res.status(500).json({ message: err.message });
  }
}

// Get flash sales for home page (limited)
export const getHomeFlashSales = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const now = new Date();

    const flashSales = await Product.find({
      $or: [
        // Product-level flash sales
        {
          isFlashSale: true,
          flashStartTime: { $lte: now },
          flashEndTime: { $gte: now },
          flashStock: { $gt: 0 },
          isActive: true,
        },
        // Variant-level flash sales
        {
          "colorVariants.isFlashSale": true,
          "colorVariants.flashStartTime": { $lte: now },
          "colorVariants.flashEndTime": { $gte: now },
          "colorVariants.flashStock": { $gt: 0 },
          isActive: true,
        }
      ]
    })
      .sort({ flashEndTime: 1 })
      .limit(limit);

    // Filter and transform products to show only active flash sale variants
    const activeFlashSales = flashSales
      .map(product => {
        const productObj = product.toObject();

        // Check product-level flash sale
        if (product.isFlashSaleActive()) {
          return productObj;
        }

        // Check variant-level flash sales
        if (product.colorVariants && product.colorVariants.length > 0) {
          const activeVariants = product.colorVariants.filter(variant => {
            if (!variant.isFlashSale) return false;
            const now = new Date();
            return variant.flashStartTime <= now &&
                   variant.flashEndTime >= now &&
                   variant.flashStock > 0;
          });

          // If there are active flash sale variants, return product with only those variants
          if (activeVariants.length > 0) {
            productObj.colorVariants = activeVariants;

            // Set product-level flash sale info from the first variant for display purposes
            // This ensures the product card shows flash sale badge
            if (!productObj.isFlashSale && activeVariants.length > 0) {
              const firstVariant = activeVariants[0];
              productObj.flashDiscountType = firstVariant.flashDiscountType;
              productObj.flashDiscountValue = firstVariant.flashDiscountValue;
              productObj.flashStartTime = firstVariant.flashStartTime;
              productObj.flashEndTime = firstVariant.flashEndTime;
              productObj.flashStock = activeVariants.reduce((sum, v) => sum + (v.flashStock || 0), 0);
            }

            return productObj;
          }
        }

        return null;
      })
      .filter(product => product !== null);

    res.json(activeFlashSales);
  } catch (err) {
    console.error("Error fetching home flash sales:", err);
    res.status(500).json({ message: err.message });
  }
}

// Admin: Create flash sale
export const createFlashSale = async (req, res) => {
  try {
    const {
      productId,
      flashDiscountType,
      flashDiscountValue,
      flashStartTime,
      flashEndTime,
      flashStock,
      variantColorName, // Optional: for variant-specific flash sale
    } = req.body;

    // Validate required fields
    if (!productId || !flashDiscountType || !flashDiscountValue || !flashStartTime || !flashEndTime || !flashStock) {
      return res.status(400).json({ message: "All flash sale fields are required" });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check ownership
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only create flash sales for your own products" });
    }

    // Validate times
    const start = new Date(flashStartTime);
    const end = new Date(flashEndTime);
    
    if (end <= start) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // If variant-specific flash sale
    if (variantColorName) {
      const variant = product.colorVariants?.find(v => v.colorName === variantColorName);
      
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }

      // Validate flash stock against variant stock
      if (flashStock > variant.stock) {
        return res.status(400).json({ 
          message: `Flash stock (${flashStock}) cannot exceed variant stock (${variant.stock})` 
        });
      }

      // Validate discount
      const variantPrice = variant.price || product.price;
      if (flashDiscountType === "percentage" && (flashDiscountValue < 0 || flashDiscountValue > 100)) {
        return res.status(400).json({ message: "Percentage discount must be between 0 and 100" });
      }

      if (flashDiscountType === "flat" && flashDiscountValue >= variantPrice) {
        return res.status(400).json({ message: "Flat discount must be less than variant price" });
      }

      // Update variant with flash sale
      variant.isFlashSale = true;
      variant.flashDiscountType = flashDiscountType;
      variant.flashDiscountValue = flashDiscountValue;
      variant.flashStartTime = start;
      variant.flashEndTime = end;
      variant.flashStock = flashStock;

      await product.save();

      return res.json({
        message: "Variant flash sale created successfully",
        product,
        variant: variantColorName,
      });
    }

    // Product-level flash sale (existing logic)
    // Validate flash stock
    if (flashStock > product.stock) {
      return res.status(400).json({ 
        message: `Flash stock (${flashStock}) cannot exceed actual stock (${product.stock})` 
      });
    }

    // Validate discount
    if (flashDiscountType === "percentage" && (flashDiscountValue < 0 || flashDiscountValue > 100)) {
      return res.status(400).json({ message: "Percentage discount must be between 0 and 100" });
    }

    if (flashDiscountType === "flat" && flashDiscountValue >= product.price) {
      return res.status(400).json({ message: "Flat discount must be less than product price" });
    }

    // Update product with flash sale
    product.isFlashSale = true;
    product.flashDiscountType = flashDiscountType;
    product.flashDiscountValue = flashDiscountValue;
    product.flashStartTime = start;
    product.flashEndTime = end;
    product.flashStock = flashStock;

    await product.save();

    res.json({
      message: "Flash sale created successfully",
      product,
    });
  } catch (err) {
    console.error("Error creating flash sale:", err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update flash sale
export const updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      isFlashSale,
      flashDiscountType,
      flashDiscountValue,
      flashStartTime,
      flashEndTime,
      flashStock,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check ownership
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update flash sales for your own products" });
    }

    // If disabling flash sale
    if (isFlashSale === false) {
      product.isFlashSale = false;
      await product.save();
      return res.json({ message: "Flash sale disabled", product });
    }

    // Validate times if provided
    if (flashStartTime && flashEndTime) {
      const start = new Date(flashStartTime);
      const end = new Date(flashEndTime);
      
      if (end <= start) {
        return res.status(400).json({ message: "End time must be after start time" });
      }
      
      product.flashStartTime = start;
      product.flashEndTime = end;
    }

    // Validate and update flash stock
    if (flashStock !== undefined) {
      if (flashStock > product.stock) {
        return res.status(400).json({ 
          message: `Flash stock (${flashStock}) cannot exceed actual stock (${product.stock})` 
        });
      }
      product.flashStock = flashStock;
    }

    // Validate and update discount
    if (flashDiscountValue !== undefined) {
      if (flashDiscountType === "percentage" && (flashDiscountValue < 0 || flashDiscountValue > 100)) {
        return res.status(400).json({ message: "Percentage discount must be between 0 and 100" });
      }

      if (flashDiscountType === "flat" && flashDiscountValue >= product.price) {
        return res.status(400).json({ message: "Flat discount must be less than product price" });
      }

      product.flashDiscountValue = flashDiscountValue;
    }

    if (flashDiscountType) {
      product.flashDiscountType = flashDiscountType;
    }

    await product.save();

    res.json({
      message: "Flash sale updated successfully",
      product,
    });
  } catch (err) {
    console.error("Error updating flash sale:", err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all flash sales (active, upcoming, expired)
export const getAllFlashSales = async (req, res) => {
  try {
    const now = new Date();

    // Only get flash sales created by this admin
    const allFlashSales = await Product.find({
      isFlashSale: true,
      createdBy: req.user._id,
    }).sort({ flashEndTime: -1 });

    // Categorize
    const active = [];
    const upcoming = [];
    const expired = [];

    allFlashSales.forEach(product => {
      if (product.flashEndTime < now || product.flashStock === 0) {
        expired.push(product);
      } else if (product.flashStartTime > now) {
        upcoming.push(product);
      } else {
        active.push(product);
      }
    });

    res.json({
      active,
      upcoming,
      expired,
    });
  } catch (err) {
    console.error("Error fetching all flash sales:", err);
    res.status(500).json({ message: err.message });
  }
};

// Cron job helper: Auto-disable expired flash sales
export const disableExpiredFlashSales = async () => {
  try {
    const now = new Date();
    
    const result = await Product.updateMany(
      {
        isFlashSale: true,
        $or: [
          { flashEndTime: { $lt: now } },
          { flashStock: { $lte: 0 } },
        ],
      },
      {
        $set: { isFlashSale: false },
      }
    );

    return result;
  } catch (err) {
    console.error("❌ Error disabling expired flash sales:", err);
    throw err;
  }
};
