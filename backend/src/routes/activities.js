import express from "express";
import { getUserActivities, createActivity } from "../controllers/activityController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Activity routes
router.get("/", auth, getUserActivities);  // Get user's activities
router.post("/", auth, createActivity);    // Create a new activity

export default router;
