import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import { auth, isAdmin, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Public routes (optionalAuth for admin filtering)
router.get("/", optionalAuth, categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin routes
router.post("/", auth, isAdmin, categoryController.createCategory);
router.put("/:id", auth, isAdmin, categoryController.updateCategory);
router.delete("/:id", auth, isAdmin, categoryController.deleteCategory);

export default router;
