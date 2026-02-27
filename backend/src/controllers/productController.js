import Product from "../models/Product.js";
import {
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
} from "../services/cloudinaryService.js";
import {
  notifyNewProduct,
  notifyProductOutOfStock,
  notifyProductLowStock,
  notifyProductUpdated,
  notifyProductDeleted,
} from "../services/notificationService.js";

export const getProducts = async (req, res) => {
  try {
    const { category, search, adminOnly } = req.query;
    const filter = {};

    // ALL admins (including Super Admin) see only their OWN products
    if (adminOnly === "true" && req.user?.isAdmin) {
      filter.createdBy = req.user._id;
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
    const { title, description, price, category, stock, discount } = req.body;


    // Validate discount
    if (discount !== undefined && discount !== null && discount !== '') {
      const discountValue = Number(discount);
      if (discountValue < 0 || discountValue > 100) {
        return res.status(400).json({ 
          message: "Discount must be between 0 and 100" 
        });
      }
    }

    // Upload images
    let imageUrls = [];
    if (req.files?.length) {
      imageUrls = await uploadMultipleToCloudinary(req.files);
    } else {
      console.warn("No images provided for product:", title);
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

    
    // Send notification to admins
    try {
      await notifyNewProduct(product);
    } catch (notifError) {
      console.error("❌ Failed to send product notification:", notifError.message);
    }
    
    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: err.message });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, discount } = req.body;

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

    // Validate discount
    if (discount !== undefined && discount !== null && discount !== '') {
      const discountValue = Number(discount);
      if (discountValue < 0 || discountValue > 100) {
        return res.status(400).json({ 
          message: "Discount must be between 0 and 100" 
        });
      }
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
    product.discount = discount !== undefined ? discount : product.discount;
    product.images = imageUrls;

    const updatedProduct = await product.save();
    
    // Check for low stock or out of stock
    try {
      if (updatedProduct.stock === 0) {
        await notifyProductOutOfStock(updatedProduct);
      } else if (updatedProduct.stock <= 10 && updatedProduct.stock > 0) {
        await notifyProductLowStock(updatedProduct, 10);
      }
    } catch (notifError) {
      console.error("❌ Failed to send stock notification:", notifError.message);
    }
    
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

    // Send notification before deleting
    try {
      await notifyProductDeleted(product);
    } catch (notifError) {
      console.error("❌ Failed to send deletion notification:", notifError.message);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getTopSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;

    // Aggregate products with their order counts
    const topProducts = await Product.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "items.product",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalOrders: { $size: "$orders" },
        },
      },
      {
        $match: {
          stock: { $gt: 0 }, // Only in-stock products
        },
      },
      {
        $sort: { totalOrders: -1, createdAt: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          orders: 0, // Remove orders array from response
        },
      },
    ]);

    res.json(topProducts);
  } catch (err) {
    console.error("Error fetching top selling products:", err);
    res.status(500).json({ message: err.message });
  }
};
