import express from "express";
import {
  getBrands,
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { auth, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getBrands);

// Super Admin only routes
router.get("/all", auth, isSuperAdmin, getAllBrands);
router.post("/", auth, isSuperAdmin, createBrand);
router.put("/:id", auth, isSuperAdmin, updateBrand);
router.delete("/:id", auth, isSuperAdmin, deleteBrand);

export default router;
