import express from "express";
import { getAbout, updateAbout } from "../controllers/aboutController.js";
import { auth, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAbout);

// Super Admin only routes
router.put("/", auth, isSuperAdmin, updateAbout);

export default router;
