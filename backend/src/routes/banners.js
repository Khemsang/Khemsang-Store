import express from "express";
import * as bannerController from "../controllers/bannerController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", bannerController.getAllBanners);
router.get("/:id", bannerController.getBannerById);

// Admin routes
router.post("/", auth, isAdmin, bannerController.createBanner);
router.put("/:id", auth, isAdmin, bannerController.updateBanner);
router.delete("/:id", auth, isAdmin, bannerController.deleteBanner);

export default router;
