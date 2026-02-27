import Coupon from "../models/Coupon.js";

// Get all coupons (admin)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create coupon
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Validate coupon (user)
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const orderAmount = cartTotal || 0;

    // Check minimum order amount BEFORE applying coupon
    if (orderAmount < 5000) {
      return res.status(400).json({ 
        message: `Minimum order amount of Rs. 5000 required to use coupons. Your current cart total is Rs. ${orderAmount}. Add Rs. ${5000 - orderAmount} more to use this coupon.`,
        currentAmount: orderAmount,
        minimumRequired: 5000
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is Rs. ${coupon.minOrderAmount}`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discountAmount),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Apply coupon (increment usage)
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
    res.json({ message: "Coupon applied" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
