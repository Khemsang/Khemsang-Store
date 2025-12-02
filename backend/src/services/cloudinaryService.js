import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "furniture-products",
      resource_type: "auto",
    });

    // Delete temporary file after successful upload
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Delete temporary file even if upload fails
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new Error("Failed to upload image");
  }
};

export const uploadMultipleToCloudinary = async (files) => {
  try {
    const uploadPromises = files.map((file) => uploadToCloudinary(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error("Failed to upload images");
  }
};

export const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithExtension.split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    // Don't throw error, just log it - we still want to delete the product from DB
  }
};

export const deleteMultipleFromCloudinary = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map((url) => deleteFromCloudinary(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Failed to delete images from Cloudinary:", error);
  }
};
