import express from "express";
import * as bannerController from "../controllers/bannerController.js";

const router = express.Router();

// Public routes
router.get("/", bannerController.getAllBanners);
router.get("/:id", bannerController.getBannerById);

// Admin routes
router.post("/", bannerController.createBanner);
router.put("/:id", bannerController.updateBanner);
router.delete("/:id", bannerController.deleteBanner);

export default router;
