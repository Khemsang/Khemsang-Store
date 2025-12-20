import FeaturedProduct from "../models/FeaturedProduct.js";

export const getAllFeaturedProducts = async (req, res) => {
  try {
    const filter = {};
    if (!req.query.admin) {
      filter.isActive = true;
      filter.isFeatured = true;
    }
    const products = await FeaturedProduct.find(filter).sort({
      order: 1,
      createdAt: -1,
    });
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Error fetching featured products",
        error: err.message,
      });
  }
};

// Get single featured product
export const getFeaturedProductById = async (req, res) => {
  try {
    const product = await FeaturedProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: err.message });
  }
};

// Create featured product (admin)
export const createFeaturedProduct = async (req, res) => {
  try {
    const product = new FeaturedProduct(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating product", error: err.message });
  }
};

// Update featured product (admin)
export const updateFeaturedProduct = async (req, res) => {
  try {
    const product = await FeaturedProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error updating product", error: err.message });
  }
};

// Delete featured product (admin)
export const deleteFeaturedProduct = async (req, res) => {
  try {
    const product = await FeaturedProduct.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: err.message });
  }
};
