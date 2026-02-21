import Product from "../models/Product.js";
import {
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
} from "../services/cloudinaryService.js";

export const getProducts = async (req, res) => {
  try {
    const { category, search, adminOnly } = req.query;
    const filter = {};

    // Super Admin can VIEW all products but not edit/delete
    // Regular admin sees only their own products
    if (adminOnly === "true" && req.user?.isAdmin) {
      // Super Admin can view all for monitoring, but filter for regular admin
      if (!req.user?.isSuperAdmin) {
        filter.createdBy = req.user._id;
      }
    }

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

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body;

    console.log("Creating product:", title);
    console.log("Files received:", req.files?.length || 0);

    // Upload images
    let imageUrls = [];
    if (req.files?.length) {
      console.log("Uploading images to Cloudinary...");
      imageUrls = await uploadMultipleToCloudinary(req.files);
      console.log("Images uploaded:", imageUrls.length);
    } else {
      console.warn("No images provided for product:", title);
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

    console.log("Product created with images:", product.images.length);
    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: err.message });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Both Super Admin and regular admin can only update their OWN products
    if (
      req.user.isAdmin &&
      product.createdBy.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You can only update your own products" });
    }

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

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Both Super Admin and regular admin can only delete their OWN products
    if (
      req.user.isAdmin &&
      product.createdBy.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own products" });
    }

    if (product.images?.length) {
      await deleteMultipleFromCloudinary(product.images);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
