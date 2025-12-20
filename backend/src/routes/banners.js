import express from "express";
import * as bannerController from "../controllers/bannerController.js";
import { auth, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes - anyone can view banners
router.get("/", bannerController.getAllBanners);
router.get("/:id", bannerController.getBannerById);

// Super Admin only routes - CRUD operations
router.post("/", auth, isSuperAdmin, bannerController.createBanner);
router.put("/:id", auth, isSuperAdmin, bannerController.updateBanner);
router.delete("/:id", auth, isSuperAdmin, bannerController.deleteBanner);

export default router;
