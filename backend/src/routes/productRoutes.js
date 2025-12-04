import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { auth, isAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin routes
router.post("/", auth, isAdmin, upload.array("images", 5), createProduct);
router.put("/:id", auth, isAdmin, upload.array("images", 5), updateProduct);
router.delete("/:id", auth, isAdmin, deleteProduct);

export default router;
