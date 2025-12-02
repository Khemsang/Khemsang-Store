import FeaturedProduct from "../models/FeaturedProduct.js";

// Get all featured products
export const getAllFeaturedProducts = async (req, res) => {
  try {
    const products = await FeaturedProduct.find({
      isActive: true,
      isFeatured: true,
    }).sort({ order: 1, createdAt: -1 });
    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching featured products",
        error: error.message,
      });
  }
};

// Get single featured product
export const getFeaturedProductById = async (req, res) => {
  try {
    const product = await FeaturedProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// Create featured product (admin)
export const createFeaturedProduct = async (req, res) => {
  try {
    const product = new FeaturedProduct(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating product", error: error.message });
  }
};

// Update featured product (admin)
export const updateFeaturedProduct = async (req, res) => {
  try {
    const product = await FeaturedProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating product", error: error.message });
  }
};

// Delete featured product (admin)
export const deleteFeaturedProduct = async (req, res) => {
  try {
    const product = await FeaturedProduct.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};
