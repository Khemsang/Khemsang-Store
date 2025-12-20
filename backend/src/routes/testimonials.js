import express from "express";
import * as testimonialController from "../controllers/testimonialController.js";
import { auth, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", testimonialController.getAllTestimonials);
router.get("/:id", testimonialController.getTestimonialById);

// Super Admin only routes
router.post("/", auth, isSuperAdmin, testimonialController.createTestimonial);
router.put("/:id", auth, isSuperAdmin, testimonialController.updateTestimonial);
router.delete(
  "/:id",
  auth,
  isSuperAdmin,
  testimonialController.deleteTestimonial
);

export default router;
