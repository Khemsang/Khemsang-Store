import Product from "../models/Product.js";
import {
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
} from "../services/cloudinaryService.js";

/**
 * GET ALL PRODUCTS
 * GET /api/products
 * Public
 */
export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET SINGLE PRODUCT
 * GET /api/products/:id
 * Public
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("createdBy", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * CREATE PRODUCT
 * POST /api/products
 * Admin Only
 */
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body;

    // Upload images
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
      images: imageUrls,
      createdBy: req.user._id,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE PRODUCT
 * PUT /api/products/:id
 * Admin Only
 */
export const updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Upload new images
    let imageUrls = product.images || [];
    if (req.files?.length) {
      const newImages = await uploadMultipleToCloudinary(req.files);
      imageUrls = [...imageUrls, ...newImages];
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.images = imageUrls;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE PRODUCT
 * DELETE /api/products/:id
 * Admin Only
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.images?.length) {
      await deleteMultipleFromCloudinary(product.images);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
