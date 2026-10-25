import Coupon from "../models/Coupon.js";
import logger from "../config/logger.js";
import { requireFields, isNonNegativeNumber, isOneOf } from "../utils/validate.js";

// GET /api/coupons — admin
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    logger.error("getAllCoupons failed", { message: err.message });
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
};

// POST /api/coupons — admin
export const createCoupon = async (req, res) => {
  try {
    const missing = requireFields(req.body, [
      "code",
      "discountValue",
      "endDate",
    ]);
    if (missing) return res.status(400).json({ message: missing });

    const { code, discountType, discountValue, minOrderAmount, maxDiscount, endDate } =
      req.body;

    if (
      discountType !== undefined &&
      !isOneOf(discountType, ["percentage", "fixed"])
    ) {
      return res
        .status(400)
        .json({ message: "discountType must be 'percentage' or 'fixed'" });
    }

    if (!isNonNegativeNumber(discountValue)) {
      return res.status(400).json({ message: "discountValue must be 0 or greater" });
    }

    if (
      discountType === "percentage" &&
      (Number(discountValue) < 0 || Number(discountValue) > 100)
    ) {
      return res
        .status(400)
        .json({ message: "Percentage discount must be between 0 and 100" });
    }

    if (minOrderAmount !== undefined && !isNonNegativeNumber(minOrderAmount)) {
      return res
        .status(400)
        .json({ message: "minOrderAmount must be 0 or greater" });
    }

    if (maxDiscount !== undefined && maxDiscount !== null && !isNonNegativeNumber(maxDiscount)) {
      return res.status(400).json({ message: "maxDiscount must be 0 or greater" });
    }

    if (isNaN(Date.parse(endDate))) {
      return res.status(400).json({ message: "endDate must be a valid date" });
    }

    const coupon = await Coupon.create({
      code: String(code).toUpperCase().trim(),
      discountType: discountType || "percentage",
      discountValue,
      minOrderAmount: minOrderAmount ?? 0,
      maxDiscount: maxDiscount ?? null,
      endDate,
      description: req.body.description ?? "",
      usageLimit: req.body.usageLimit ?? null,
      startDate: req.body.startDate ?? undefined,
      isActive: req.body.isActive ?? true,
    });

    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    logger.error("createCoupon failed", { message: err.message });
    res.status(500).json({ message: "Failed to create coupon" });
  }
};

// PUT /api/coupons/:id — admin
export const updateCoupon = async (req, res) => {
  try {
    const { discountType, discountValue, minOrderAmount } = req.body;

    if (discountType !== undefined && !isOneOf(discountType, ["percentage", "fixed"])) {
      return res
        .status(400)
        .json({ message: "discountType must be 'percentage' or 'fixed'" });
    }
    if (discountValue !== undefined && !isNonNegativeNumber(discountValue)) {
      return res.status(400).json({ message: "discountValue must be 0 or greater" });
    }
    if (minOrderAmount !== undefined && !isNonNegativeNumber(minOrderAmount)) {
      return res
        .status(400)
        .json({ message: "minOrderAmount must be 0 or greater" });
    }

    const allowedFields = [
      "code",
      "description",
      "discountType",
      "discountValue",
      "minOrderAmount",
      "maxDiscount",
      "usageLimit",
      "startDate",
      "endDate",
      "isActive",
    ];
    const update = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }
    if (update.code) update.code = String(update.code).toUpperCase().trim();

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    res.json(coupon);
  } catch (err) {
    logger.error("updateCoupon failed", { message: err.message });
    res.status(500).json({ message: "Failed to update coupon" });
  }
};

// DELETE /api/coupons/:id — admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    logger.error("deleteCoupon failed", { message: err.message });
    res.status(500).json({ message: "Failed to delete coupon" });
  }
};

// POST /api/coupons/validate — public
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ message: "code is required" });

    const orderAmount = Number(cartTotal) || 0;

    if (orderAmount < 5000) {
      return res.status(400).json({
        message: `Minimum order amount of Rs. 5000 required to use coupons. Your cart total is Rs. ${orderAmount}.`,
        currentAmount: orderAmount,
        minimumRequired: 5000,
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });

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

    let discountAmount =
      coupon.discountType === "percentage"
        ? (orderAmount * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discountAmount),
    });
  } catch (err) {
    logger.error("validateCoupon failed", { message: err.message });
    res.status(500).json({ message: "Failed to validate coupon" });
  }
};

// POST /api/coupons/apply — protected
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "code is required" });

    const coupon = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    res.json({ message: "Coupon applied" });
  } catch (err) {
    logger.error("applyCoupon failed", { message: err.message });
    res.status(500).json({ message: "Failed to apply coupon" });
  }
};
