import express from "express";
import * as testimonialController from "../controllers/testimonialController.js";

const router = express.Router();

// Public routes
router.get("/", testimonialController.getAllTestimonials);
router.get("/:id", testimonialController.getTestimonialById);

// Admin routes (add auth middleware later)
router.post("/", testimonialController.createTestimonial);
router.put("/:id", testimonialController.updateTestimonial);
router.delete("/:id", testimonialController.deleteTestimonial);

export default router;
