import express from "express";
import multer from "multer";
import * as featuredProductController from "../controllers/featuredProductController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get("/", featuredProductController.getAllFeaturedProducts);
router.get("/:id", featuredProductController.getFeaturedProductById);

// Admin routes
router.post(
  "/",
  auth,
  isAdmin,
  upload.single("image"),
  featuredProductController.createFeaturedProduct
);
router.put(
  "/:id",
  auth,
  isAdmin,
  upload.single("image"),
  featuredProductController.updateFeaturedProduct
);
router.delete(
  "/:id",
  auth,
  isAdmin,
  featuredProductController.deleteFeaturedProduct
);

export default router;
