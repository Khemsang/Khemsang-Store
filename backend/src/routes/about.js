import express from "express";
import { getAbout, updateAbout } from "../controllers/aboutController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// About routes
router.get("/", getAbout);                  // Get about content
router.put("/", auth, isAdmin, updateAbout); // Update about content (Admin only)

export default router;
