import express from "express";
import multer from "multer";
import {
  addVariant,
  updateVariant,
  deleteVariant,
  getProductVariants,
  deleteVariantImage,
} from "../controllers/variantController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all variants of a product
router.get("/:productId", getProductVariants);

// Add variant to product (admin only) - max 4 images per variant
router.post("/:productId", auth, isAdmin, upload.array("images", 4), addVariant);

// Update variant (admin only) - max 4 images per variant
router.put("/:productId/:variantId", auth, isAdmin, upload.array("images", 4), updateVariant);

// Delete variant (admin only)
router.delete("/:productId/:variantId", auth, isAdmin, deleteVariant);

// Delete variant image (admin only)
router.delete("/:productId/:variantId/image", auth, isAdmin, deleteVariantImage);

export default router;
