import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import { validateAndNormalizeColor } from "../utils/colorValidator.js";

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

// Add color variant to product
export const addVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { colorName, colorCode, sku, price, stock } = req.body;


    const product = await Product.findById(productId);
    if (!product) {
      console.error("Product not found:", productId);
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate images (1-4 required)
    if (!req.files || req.files.length < 1 || req.files.length > 4) {
      console.error("Invalid image count:", req.files?.length || 0);
      console.error("req.files:", req.files);
      return res.status(400).json({ 
        message: "Please upload 1-4 images for the color variant" 
      });
    }

    // Validate and normalize color
    const normalizedColor = validateAndNormalizeColor(colorName);
    if (!normalizedColor) {
      console.error("Invalid color name:", colorName);
      return res.status(400).json({ 
        message: `Invalid color name: "${colorName}". Please use one of the predefined colors: Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Gray, Navy` 
      });
    }


    // Upload variant images
    let variantImages = [];
    try {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer);
        variantImages.push(result.secure_url);
      }
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({ 
        message: "Failed to upload images to cloud storage",
        error: uploadError.message 
      });
    }


    // Check if color already exists
    const existingVariant = product.colorVariants?.find(
      v => v.colorName.toLowerCase() === normalizedColor.colorName.toLowerCase()
    );
    
    if (existingVariant) {
      console.error("Color already exists:", normalizedColor.colorName);
      return res.status(400).json({ 
        message: `Color variant "${normalizedColor.colorName}" already exists for this product` 
      });
    }

    // Create color variant with normalized color data
    const variant = {
      colorName: normalizedColor.colorName,
      colorCode: normalizedColor.colorCode,
      sku: sku || `${product._id}-${normalizedColor.colorName.replace(/\s+/g, '-').toLowerCase()}`,
      price: price || undefined,
      stock: stock || 0,
      images: variantImages,
      isActive: true,
    };

    if (!product.colorVariants) {
      product.colorVariants = [];
    }
    product.colorVariants.push(variant);
    
    try {
      await product.save();
    } catch (saveError) {
      console.error("Database save error:", saveError);
      return res.status(500).json({ 
        message: "Failed to save variant to database",
        error: saveError.message 
      });
    }

    res.json({
      message: "Color variant added successfully",
      variant: product.colorVariants[product.colorVariants.length - 1],
    });
  } catch (err) {
    console.error("=== ADD VARIANT ERROR ===");
    console.error("Error:", err);
    console.error("Stack:", err.stack);
    res.status(500).json({ 
      message: err.message || "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Update color variant
export const updateVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { colorName, colorCode, sku, price, stock, isActive } = req.body;

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

// Delete color variant
export const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.colorVariants.id(variantId);
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

    product.colorVariants.pull(variantId);
    await product.save();

    res.json({ message: "Variant deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all color variants of a product
export const getProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product.colorVariants || []);
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

    const variant = product.colorVariants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Ensure at least 1 image remains
    if (variant.images.length <= 1) {
      return res.status(400).json({ 
        message: "Cannot delete the last image. Each variant must have at least 1 image." 
      });
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
