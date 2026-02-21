import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// Helper function to upload buffer to cloudinary
const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "product-variants" },
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

// Add variant to product
export const addVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { color, size, sku, price, stock } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Upload variant images if provided
    let variantImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer);
        variantImages.push(result.secure_url);
      }
    }

    // Create variant
    const variant = {
      color: color || "Default",
      size: size || "",
      sku: sku || `${product.sku || product._id}-${color}`,
      price: price || product.price,
      stock: stock || 0,
      images: variantImages,
      isActive: true,
    };

    product.variants.push(variant);
    await product.save();

    res.json({
      message: "Variant added successfully",
      variant: product.variants[product.variants.length - 1],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update variant
export const updateVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { color, size, sku, price, stock, isActive } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Update variant fields
    if (color !== undefined) variant.color = color;
    if (size !== undefined) variant.size = size;
    if (sku !== undefined) variant.sku = sku;
    if (price !== undefined) variant.price = price;
    if (stock !== undefined) variant.stock = stock;
    if (isActive !== undefined) variant.isActive = isActive;

    // Upload new images if provided
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer);
        newImages.push(result.secure_url);
      }
      variant.images = [...variant.images, ...newImages];
    }

    await product.save();

    res.json({
      message: "Variant updated successfully",
      variant,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete variant
export const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Delete variant images from cloudinary
    if (variant.images && variant.images.length > 0) {
      for (const imageUrl of variant.images) {
        try {
          await deleteFromCloudinary(imageUrl);
        } catch (err) {
          console.error("Failed to delete image:", err);
        }
      }
    }

    product.variants.pull(variantId);
    await product.save();

    res.json({ message: "Variant deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all variants of a product
export const getProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product.variants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete variant image
export const deleteVariantImage = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { imageUrl } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Remove image from variant
    variant.images = variant.images.filter((img) => img !== imageUrl);
    await product.save();

    // Delete from cloudinary
    try {
      await deleteFromCloudinary(imageUrl);
    } catch (err) {
      console.error("Failed to delete from cloudinary:", err);
    }

    res.json({ message: "Image deleted successfully", variant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
