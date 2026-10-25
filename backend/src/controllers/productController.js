import Product from "../models/Product.js";
import logger from "../config/logger.js";
import { requireFields, isPositiveNumber, isNonNegativeNumber } from "../utils/validate.js";
import {
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
} from "../services/cloudinaryService.js";
import {
  notifyNewProduct,
  notifyProductOutOfStock,
  notifyProductLowStock,
  notifyProductDeleted,
} from "../services/notificationService.js";

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, search, adminOnly, page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};

    if (adminOnly === "true" && req.user?.isAdmin) {
      filter.createdBy = req.user._id;
    }
    if (category) filter.category = category;
    if (search) {
      // Use the text index when present, fall back to regex for partial matches
      filter.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page:  pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, discount } = req.body;

    const missing = requireFields(req.body, ["title", "description", "price", "category", "stock"]);
    if (missing) return res.status(400).json({ message: missing });

    if (!isPositiveNumber(price)) {
      return res.status(400).json({ message: "price must be a positive number" });
    }
    if (!isNonNegativeNumber(stock)) {
      return res.status(400).json({ message: "stock must be 0 or greater" });
    }
    if (discount !== undefined && discount !== null && discount !== "") {
      const d = Number(discount);
      if (!Number.isFinite(d) || d < 0 || d > 100) {
        return res.status(400).json({ message: "discount must be between 0 and 100" });
      }
    }

    let imageUrls = [];
    if (req.files?.length) {
      imageUrls = await uploadMultipleToCloudinary(req.files);
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      stock,
      discount: discount || 0,
      images: imageUrls,
      createdBy: req.user._id,
    });

    notifyNewProduct(product).catch((err) =>
      logger.warn("Failed to send new-product notification", { message: err.message })
    );

    res.status(201).json(product);
  } catch (err) {
    logger.error("createProduct failed", { message: err.message });
    res.status(500).json({ message: "Failed to create product" });
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, discount } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.user.isAdmin && product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own products" });
    }

    if (price !== undefined && !isPositiveNumber(price)) {
      return res.status(400).json({ message: "price must be a positive number" });
    }
    if (stock !== undefined && !isNonNegativeNumber(stock)) {
      return res.status(400).json({ message: "stock must be 0 or greater" });
    }
    if (discount !== undefined && discount !== null && discount !== "") {
      const d = Number(discount);
      if (!Number.isFinite(d) || d < 0 || d > 100) {
        return res.status(400).json({ message: "discount must be between 0 and 100" });
      }
    }

    if (req.files?.length) {
      const newImages = await uploadMultipleToCloudinary(req.files);
      product.images = [...(product.images || []), ...newImages];
    }

    if (title       !== undefined) product.title       = title;
    if (description !== undefined) product.description = description;
    if (price       !== undefined) product.price       = price;
    if (category    !== undefined) product.category    = category;
    if (stock       !== undefined) product.stock       = stock;
    if (discount    !== undefined) product.discount    = discount;

    const updated = await product.save();

    if (updated.stock === 0) {
      notifyProductOutOfStock(updated).catch((err) =>
        logger.warn("Failed to send out-of-stock notification", { message: err.message })
      );
    } else if (updated.stock <= 10) {
      notifyProductLowStock(updated, 10).catch((err) =>
        logger.warn("Failed to send low-stock notification", { message: err.message })
      );
    }

    res.json(updated);
  } catch (err) {
    logger.error("updateProduct failed", { message: err.message });
    res.status(500).json({ message: "Failed to update product" });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.user.isAdmin && product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own products" });
    }

    if (product.images?.length) {
      await deleteMultipleFromCloudinary(product.images).catch((err) =>
        logger.warn("Failed to delete product images from Cloudinary", { message: err.message })
      );
    }

    notifyProductDeleted(product).catch((err) =>
      logger.warn("Failed to send product-deleted notification", { message: err.message })
    );

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    logger.error("deleteProduct failed", { message: err.message });
    res.status(500).json({ message: "Failed to delete product" });
  }
};

// GET /api/products/top-selling
export const getTopSellingProducts = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));

    const topProducts = await Product.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "items.product",
          as: "orders",
        },
      },
      { $addFields: { totalOrders: { $size: "$orders" } } },
      { $match: { stock: { $gt: 0 } } },
      { $sort: { totalOrders: -1, createdAt: -1 } },
      { $limit: limit },
      { $project: { orders: 0 } },
    ]);

    res.json(topProducts);
  } catch (err) {
    logger.error("getTopSellingProducts failed", { message: err.message });
    res.status(500).json({ message: "Failed to fetch top-selling products" });
  }
};
