import FeaturedProduct from "../models/FeaturedProduct.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// Helper function to upload buffer to cloudinary
const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "featured-products" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};

// Helper function to delete from cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithExtension.split(".")[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

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
    
    let imageUrl = "";
    
    // Upload image if provided
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    } else {
    }

    const productData = {
      ...req.body,
      image: imageUrl,
    };

    const product = new FeaturedProduct(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Create featured product error:", err);
    console.error("Error details:", err.message);
    res.status(400).json({ message: "Error creating product", error: err.message });
  }
};

// Update featured product (admin)
export const updateFeaturedProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Upload new image if provided
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      updateData.image = result.secure_url;
      
      // Delete old image
      const oldProduct = await FeaturedProduct.findById(req.params.id);
      if (oldProduct && oldProduct.image) {
        await deleteFromCloudinary(oldProduct.image);
      }
    }

    const product = await FeaturedProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Update featured product error:", err);
    res.status(400).json({ message: "Error updating product", error: err.message });
  }
};

// Delete featured product (admin)
export const deleteFeaturedProduct = async (req, res) => {
  try {
    const product = await FeaturedProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    // Delete image from cloudinary
    if (product.image) {
      await deleteFromCloudinary(product.image);
    }
    
    await FeaturedProduct.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete featured product error:", err);
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};
