/**
 * Cart Service
 * Centralized business logic for cart operations
 * Handles both guest and authenticated user carts
 */

import User from "../models/User.js";
import Product from "../models/Product.js";
import FeaturedProduct from "../models/FeaturedProduct.js";

class CartService {
  /**
   * Add item to cart with validation
   * @param {String} userId - User ID
   * @param {Object} itemData - { productId, quantity, colorVariant }
   * @returns {Promise<Object>} - { cart, isNewItem, message }
   */
  async addToCart(userId, itemData) {
    const { productId, quantity = 1, colorVariant } = itemData;

    // Step 1: Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new CartError("User not found", 404);
    }

    // Step 2: Find and validate product
    const productInfo = await this._findAndValidateProduct(productId, quantity, colorVariant);

    // Step 3: Check if item already exists in cart
    const existingItem = this._findExistingCartItem(user.cart, productId, colorVariant);

    // Step 4: Validate total quantity
    const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    
    if (!productInfo.isFeaturedProduct && productInfo.availableStock < totalQuantity) {
      const canAdd = productInfo.availableStock - (existingItem?.quantity || 0);
      throw new CartError(
        `Cannot add ${quantity} more. Only ${canAdd} available`,
        400,
        {
          code: "CART_LIMIT_EXCEEDED",
          availableStock: productInfo.availableStock,
          currentInCart: existingItem?.quantity || 0,
          canAdd,
        }
      );
    }

    // Step 5: Create price snapshot
    const priceSnapshot = this._createPriceSnapshot(productInfo);

    // Step 6: Add or update cart item
    const isNewItem = !existingItem;
    
    if (isNewItem) {
      const cartItem = {
        product: productId,
        quantity,
        priceSnapshot,
        addedAt: new Date(),
      };
      if (productInfo.variantData) {
        cartItem.colorVariant = productInfo.variantData;
      }
      user.cart.push(cartItem);
    } else {
      existingItem.quantity = totalQuantity;
      if (productInfo.variantData) {
        existingItem.colorVariant = productInfo.variantData;
      }
    }

    // Step 7: Clean duplicates and save
    user.cart = this._cleanDuplicates(user.cart);
    await user.save();

    // Step 8: Return populated cart
    const updatedUser = await User.findById(userId).populate("cart.product");

    return {
      cart: updatedUser.cart,
      isNewItem,
      message: isNewItem ? "Added to cart" : "Cart updated",
    };
  }

  /**
   * Find and validate product
   * @private
   */
  async _findAndValidateProduct(productId, quantity, colorVariant) {
    // Try regular product first
    let product = await Product.findById(productId);
    let isFeaturedProduct = false;

    if (!product) {
      // Try featured product
      product = await FeaturedProduct.findById(productId);
      isFeaturedProduct = true;
    }

    if (!product) {
      throw new CartError("Product not found", 404, { code: "PRODUCT_NOT_FOUND" });
    }

    let availableStock = product.stock || 999;
    let variantData = null;

    // Handle variant validation
    if (colorVariant && !isFeaturedProduct) {
      const variant = product.colorVariants?.find(
        (v) => v.colorName === colorVariant.colorName && v.isActive
      );

      if (!variant) {
        throw new CartError("Selected variant not available", 400, {
          code: "VARIANT_NOT_FOUND",
        });
      }

      availableStock = variant.stock;
      variantData = {
        colorName: variant.colorName,
        colorCode: variant.colorCode,
        price: variant.price || product.price,
      };
    }

    // Validate stock for non-featured products
    if (!isFeaturedProduct && availableStock < quantity) {
      throw new CartError(
        `Only ${availableStock} item(s) available in stock`,
        400,
        {
          code: "INSUFFICIENT_STOCK",
          availableStock,
          requestedQuantity: quantity,
        }
      );
    }

    return {
      product,
      isFeaturedProduct,
      availableStock,
      variantData,
    };
  }

  /**
   * Find existing cart item
   * @private
   */
  _findExistingCartItem(cart, productId, colorVariant) {
    return cart.find((item) => {
      const sameProduct = item.product.toString() === productId;
      const sameVariant = colorVariant
        ? item.colorVariant?.colorName === colorVariant.colorName
        : !item.colorVariant;
      return sameProduct && sameVariant;
    });
  }

  /**
   * Create price snapshot
   * @private
   */
  _createPriceSnapshot(productInfo) {
    const { product, variantData } = productInfo;
    const basePrice = variantData?.price || product.price;

    return {
      originalPrice: basePrice,
      discountedPrice: product.discount
        ? basePrice * (1 - product.discount / 100)
        : basePrice,
      discount: product.discount || 0,
      snapshotAt: new Date(),
    };
  }

  /**
   * Clean duplicate cart items
   * @private
   */
  _cleanDuplicates(cart) {
    const cleanedCart = [];
    const seen = new Map();

    for (const item of cart) {
      const key = `${item.product.toString()}-${item.colorVariant?.colorName || "none"}`;
      
      if (seen.has(key)) {
        const existing = seen.get(key);
        existing.quantity += item.quantity;
      } else {
        seen.set(key, item);
        cleanedCart.push(item);
      }
    }

    return cleanedCart;
  }

  /**
   * Merge guest cart with user cart
   * @param {String} userId - User ID
   * @param {Array} guestItems - Guest cart items
   * @returns {Promise<Array>} - Merged cart
   */
  async mergeCart(userId, guestItems) {
    if (!guestItems || guestItems.length === 0) {
      const user = await User.findById(userId).populate("cart.product");
      return user.cart;
    }

    const user = await User.findById(userId);

    for (const item of guestItems) {
      const productId = typeof item.product === "object" ? item.product._id : item.product;

      const existing = this._findExistingCartItem(user.cart, productId, item.colorVariant);

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
    }

    user.cart = this._cleanDuplicates(user.cart);
    await user.save();

    const updatedUser = await User.findById(userId).populate("cart.product");
    return updatedUser.cart;
  }

  /**
   * Get user cart
   * @param {String} userId - User ID
   * @returns {Promise<Array>} - Cart items
   */
  async getCart(userId) {
    const user = await User.findById(userId).populate("cart.product");
    user.cart = this._cleanDuplicates(user.cart);
    
    // Save if duplicates were found
    if (user.isModified("cart")) {
      await user.save();
    }

    return user.cart;
  }

  /**
   * Update cart item quantity
   * @param {String} userId - User ID
   * @param {String} itemId - Cart item ID
   * @param {Number} quantity - New quantity
   * @returns {Promise<Array>} - Updated cart
   */
  async updateCartItem(userId, itemId, quantity) {
    const user = await User.findById(userId);
    const item = user.cart.id(itemId);

    if (!item) {
      throw new CartError("Item not in cart", 404);
    }

    item.quantity = quantity;
    await user.save();

    const updatedUser = await User.findById(userId).populate("cart.product");
    return updatedUser.cart;
  }

  /**
   * Remove item from cart
   * @param {String} userId - User ID
   * @param {String} itemId - Cart item ID
   * @returns {Promise<Array>} - Updated cart
   */
  async removeFromCart(userId, itemId) {
    const user = await User.findById(userId);
    user.cart.pull(itemId);
    await user.save();

    const updatedUser = await User.findById(userId).populate("cart.product");
    return updatedUser.cart;
  }

  /**
   * Clear cart
   * @param {String} userId - User ID
   * @returns {Promise<void>}
   */
  async clearCart(userId) {
    const user = await User.findById(userId);
    user.cart = [];
    await user.save();
  }
}

/**
 * Custom error class for cart operations
 */
class CartError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.name = "CartError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export default new CartService();
export { CartError };
