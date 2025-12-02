import Product from "../models/Product.js";
import {
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
} from "../services/cloudinaryService.js";

// @desc    Get all products
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product (Admin only)
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    console.log("➕ Create product request");
    console.log("📦 Request body:", req.body);
    console.log("🖼️ Files:", req.files?.length || 0);

    const { title, description, price, category, stock } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log(`📤 Uploading ${req.files.length} images...`);
      imageUrls = await uploadMultipleToCloudinary(req.files);
      console.log(`✅ Images uploaded: ${imageUrls.length}`);
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

    console.log("✅ Product created successfully:", product._id);
    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Create error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    console.log("📝 Update product request:", req.params.id);
    console.log("📦 Request body:", req.body);
    console.log("🖼️ Files:", req.files?.length || 0);

    const { title, description, price, category, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log("❌ Product not found:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("✅ Found product:", product.title);

    let imageUrls = product.images || [];
    if (req.files && req.files.length > 0) {
      console.log(`📤 Uploading ${req.files.length} new images...`);
      const newImages = await uploadMultipleToCloudinary(req.files);
      imageUrls = [...imageUrls, ...newImages];
      console.log(`✅ Total images after upload: ${imageUrls.length}`);
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.images = imageUrls;

    const updatedProduct = await product.save();
    console.log("✅ Product updated successfully:", updatedProduct._id);
    res.json(updatedProduct);
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      await deleteMultipleFromCloudinary(product.images);
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
