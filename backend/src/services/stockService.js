/**
 * Stock Management Service
 * Centralized business logic for stock operations
 * Follows Single Responsibility Principle
 */

import Product from "../models/Product.js";

class StockService {
  /**
   * Validate and reserve stock for order items
   * @param {Array} items - Order items with product, quantity, and optional colorVariant
   * @returns {Promise<Object>} - { success: boolean, errors: Array, reservations: Array }
   */
  async validateAndReserveStock(items) {
    const errors = [];
    const reservations = [];

    for (const item of items) {
      try {
        const result = await this._reserveItemStock(item);
        if (result.success) {
          reservations.push(result.reservation);
        } else {
          errors.push(result.error);
        }
      } catch (error) {
        errors.push({
          productId: item.product,
          message: error.message,
          code: "RESERVATION_ERROR",
        });
      }
    }

    return {
      success: errors.length === 0,
      errors,
      reservations,
    };
  }

  /**
   * Reserve stock for a single item
   * @private
   */
  async _reserveItemStock(item) {
    const product = await Product.findById(item.product);

    if (!product) {
      return {
        success: false,
        error: {
          productId: item.product,
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND",
        },
      };
    }

    // Handle variant stock
    if (item.colorVariant?.colorName) {
      return this._reserveVariantStock(product, item);
    }

    // Handle regular product stock
    return this._reserveRegularStock(product, item);
  }

  /**
   * Reserve variant stock
   * @private
   */
  _reserveVariantStock(product, item) {
    const variant = product.colorVariants.find(
      (v) => v.colorName === item.colorVariant.colorName
    );

    if (!variant) {
      return {
        success: false,
        error: {
          productId: product._id,
          variantName: item.colorVariant.colorName,
          message: `Variant "${item.colorVariant.colorName}" not found`,
          code: "VARIANT_NOT_FOUND",
        },
      };
    }

    if (variant.stock < item.quantity) {
      return {
        success: false,
        error: {
          productId: product._id,
          variantName: variant.colorName,
          message: `Insufficient stock for ${product.title} - ${variant.colorName}`,
          available: variant.stock,
          requested: item.quantity,
          code: "INSUFFICIENT_STOCK",
        },
      };
    }

    return {
      success: true,
      reservation: {
        product,
        variant,
        quantity: item.quantity,
        type: "variant",
      },
    };
  }

  /**
   * Reserve regular product stock
   * @private
   */
  _reserveRegularStock(product, item) {
    if (product.stock < item.quantity) {
      return {
        success: false,
        error: {
          productId: product._id,
          message: `Insufficient stock for ${product.title}`,
          available: product.stock,
          requested: item.quantity,
          code: "INSUFFICIENT_STOCK",
        },
      };
    }

    return {
      success: true,
      reservation: {
        product,
        quantity: item.quantity,
        type: "regular",
      },
    };
  }

  /**
   * Commit stock reservations (reduce stock)
   * @param {Array} reservations - Array of reservation objects
   * @returns {Promise<void>}
   */
  async commitReservations(reservations) {
    for (const reservation of reservations) {
      if (reservation.type === "variant") {
        await this._reduceVariantStock(reservation);
      } else {
        await this._reduceRegularStock(reservation);
      }
    }
  }

  /**
   * Reduce variant stock
   * @private
   */
  async _reduceVariantStock(reservation) {
    const { product, variant, quantity } = reservation;

    variant.stock -= quantity;

    // Handle flash sale stock
    if (variant.isFlashSale && variant.flashStock > 0) {
      variant.flashStock = Math.max(0, variant.flashStock - quantity);
      if (variant.flashStock === 0) {
        variant.isFlashSale = false;
      }
    }

    await product.save();
  }

  /**
   * Reduce regular product stock
   * @private
   */
  async _reduceRegularStock(reservation) {
    const { product, quantity } = reservation;

    product.stock -= quantity;

    // Handle flash sale stock
    if (product.isFlashSale && product.flashStock > 0) {
      product.flashStock = Math.max(0, product.flashStock - quantity);
      if (product.flashStock === 0) {
        product.isFlashSale = false;
      }
    }

    await product.save();
  }

  /**
   * Rollback stock reservations (restore stock)
   * Used when order creation fails
   * @param {Array} reservations - Array of reservation objects
   * @returns {Promise<void>}
   */
  async rollbackReservations(reservations) {
    for (const reservation of reservations) {
      try {
        if (reservation.type === "variant") {
          await this._restoreVariantStock(reservation);
        } else {
          await this._restoreRegularStock(reservation);
        }
      } catch (error) {
        console.error("❌ Failed to rollback stock:", error);
        // Log to monitoring system in production
      }
    }
  }

  /**
   * Restore variant stock
   * @private
   */
  async _restoreVariantStock(reservation) {
    const { product, variant, quantity } = reservation;
    const freshProduct = await Product.findById(product._id);
    
    const freshVariant = freshProduct.colorVariants.find(
      (v) => v.colorName === variant.colorName
    );

    if (freshVariant) {
      freshVariant.stock += quantity;
      if (variant.isFlashSale) {
        freshVariant.flashStock += quantity;
      }
      await freshProduct.save();
    }
  }

  /**
   * Restore regular product stock
   * @private
   */
  async _restoreRegularStock(reservation) {
    const { product, quantity } = reservation;
    const freshProduct = await Product.findById(product._id);

    if (freshProduct) {
      freshProduct.stock += quantity;
      if (product.isFlashSale) {
        freshProduct.flashStock += quantity;
      }
      await freshProduct.save();
    }
  }

  /**
   * Check stock availability without reserving
   * @param {String} productId - Product ID
   * @param {Number} quantity - Requested quantity
   * @param {String} variantName - Optional variant name
   * @returns {Promise<Object>} - { available: boolean, stock: number }
   */
  async checkAvailability(productId, quantity, variantName = null) {
    const product = await Product.findById(productId);

    if (!product) {
      return { available: false, stock: 0, error: "Product not found" };
    }

    if (variantName) {
      const variant = product.colorVariants.find(
        (v) => v.colorName === variantName
      );
      if (!variant) {
        return { available: false, stock: 0, error: "Variant not found" };
      }
      return {
        available: variant.stock >= quantity,
        stock: variant.stock,
      };
    }

    return {
      available: product.stock >= quantity,
      stock: product.stock,
    };
  }
}

export default new StockService();
