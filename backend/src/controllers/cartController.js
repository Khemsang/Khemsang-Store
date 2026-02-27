import User from "../models/User.js";
import Product from "../models/Product.js";

// Get user cart
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    
    // Clean up any duplicates
    const cleanedCart = [];
    const seen = new Map();
    
    for (const item of user.cart) {
      if (!item.product) continue; // Skip if product doesn't exist
      
      const key = `${item.product._id.toString()}-${item.colorVariant?.colorName || 'none'}`;
      if (seen.has(key)) {
        // Merge with existing
        const existing = seen.get(key);
        existing.quantity += item.quantity;
      } else {
        seen.set(key, item);
        cleanedCart.push(item);
      }
    }
    
    // Update cart if duplicates were found
    if (cleanedCart.length !== user.cart.length) {
      user.cart = cleanedCart;
      await user.save();
    }
    
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Merge localStorage cart after login
export const mergeCart = async (req, res) => {
  try {
    const { items } = req.body;
    
    const user = await User.findById(req.user._id);

    if (!items || items.length === 0) {
      const updatedUser = await User.findById(req.user._id).populate("cart.product");
      return res.json(updatedUser.cart);
    }

    // Merge items by checking product + variant
    items.forEach(item => {
      const productId = typeof item.product === 'object' ? item.product._id : item.product;
      
      // Find existing item with same product AND same color variant
      const existing = user.cart.find(c => {
        const sameProduct = c.product.toString() === productId;
        const sameVariant = item.colorVariant 
          ? (c.colorVariant?.colorName === item.colorVariant.colorName)
          : !c.colorVariant;
        return sameProduct && sameVariant;
      });

      if (existing) {
        existing.quantity += item.quantity;
        if (item.colorVariant) {
          existing.colorVariant = item.colorVariant;
        }
      } else {
        const cartItem = { product: productId, quantity: item.quantity };
        if (item.colorVariant) {
          cartItem.colorVariant = item.colorVariant;
        }
        user.cart.push(cartItem);
      }
    });

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(updatedUser.cart);
  } catch (err) {
    console.error("❌ Error merging cart:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add item to cart with stock validation and price snapshot
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, colorVariant } = req.body;
    const user = await User.findById(req.user._id);

    // ✅ Step 1: Try to find as regular Product first, then FeaturedProduct
    let product = await Product.findById(productId);
    let isFeaturedProduct = false;
    
    if (!product) {
      // Try to find as FeaturedProduct
      const FeaturedProduct = (await import("../models/FeaturedProduct.js")).default;
      product = await FeaturedProduct.findById(productId);
      isFeaturedProduct = true;
    }
    
    if (!product) {
      return res.status(404).json({ 
        message: "Product not found",
        code: "PRODUCT_NOT_FOUND"
      });
    }

    // ✅ Step 2: Check stock availability
    let availableStock = product.stock || 999; // Featured products may not have stock field
    let variantData = null;

    if (colorVariant && !isFeaturedProduct) {
      const variant = product.colorVariants?.find(
        v => v.colorName === colorVariant.colorName && v.isActive
      );
      
      if (!variant) {
        return res.status(400).json({ 
          message: "Selected variant not available",
          code: "VARIANT_NOT_FOUND"
        });
      }
      
      availableStock = variant.stock;
      variantData = {
        colorName: variant.colorName,
        colorCode: variant.colorCode,
        price: variant.price || product.price
      };
    }

    // ✅ Step 3: Validate requested quantity (skip for featured products without stock)
    if (!isFeaturedProduct && availableStock < quantity) {
      return res.status(400).json({ 
        message: `Only ${availableStock} item(s) available in stock`,
        code: "INSUFFICIENT_STOCK",
        availableStock,
        requestedQuantity: quantity
      });
    }

    // ✅ Step 4: Find existing item with same product AND same color variant
    const existing = user.cart.find(item => {
      const sameProduct = item.product.toString() === productId;
      const sameVariant = colorVariant 
        ? (item.colorVariant?.colorName === colorVariant.colorName)
        : !item.colorVariant;
      return sameProduct && sameVariant;
    });

    const isNewItem = !existing;
    let totalQuantity = quantity;

    if (!isNewItem) {
      totalQuantity = existing.quantity + quantity;
    }

    // ✅ Step 5: Validate total quantity doesn't exceed stock (skip for featured products)
    if (!isFeaturedProduct && availableStock < totalQuantity) {
      const canAdd = availableStock - (isNewItem ? 0 : existing.quantity);
      return res.status(400).json({ 
        message: `Cannot add ${quantity} more. Only ${canAdd} available`,
        code: "CART_LIMIT_EXCEEDED",
        availableStock,
        currentInCart: isNewItem ? 0 : existing.quantity,
        canAdd
      });
    }

    // ✅ Step 6: Create price snapshot (lock price at cart time)
    const priceSnapshot = {
      originalPrice: variantData?.price || product.price,
      discountedPrice: product.discount 
        ? (variantData?.price || product.price) * (1 - product.discount / 100)
        : variantData?.price || product.price,
      discount: product.discount || 0,
      snapshotAt: new Date()
    };

    // ✅ Step 7: Add/Update cart
    if (isNewItem) {
      const cartItem = { 
        product: productId, 
        quantity,
        priceSnapshot,
        addedAt: new Date()
      };
      if (variantData) {
        cartItem.colorVariant = variantData;
      }
      user.cart.push(cartItem);
    } else {
      existing.quantity = totalQuantity;
      if (variantData) {
        existing.colorVariant = variantData;
      }
      // Keep original price snapshot for existing items
    }

    // Clean up any duplicates that might exist
    const cleanedCart = [];
    const seen = new Map();
    
    for (const item of user.cart) {
      const key = `${item.product.toString()}-${item.colorVariant?.colorName || 'none'}`;
      if (seen.has(key)) {
        // Merge with existing
        const existing = seen.get(key);
        existing.quantity += item.quantity;
      } else {
        seen.set(key, item);
        cleanedCart.push(item);
      }
    }
    
    user.cart = cleanedCart;
    await user.save();
    
    // ✅ Step 8: Return updated cart with full product data
    const updatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json({ 
      cart: updatedUser.cart, 
      isNewItem,
      message: isNewItem ? "Added to cart" : "Cart updated"
    });
  } catch (err) {
    console.error("❌ Add to cart error:", err);
    res.status(500).json({ 
      message: "Failed to add to cart",
      code: "SERVER_ERROR"
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    const user = await User.findById(req.user._id);

    const item = user.cart.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user._id);
    
    // Remove by subdocument _id
    user.cart.pull(itemId);

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
