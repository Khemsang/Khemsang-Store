/**
 * ========================================
 * COLOR ROUTES
 * Routes for predefined colors
 * ========================================
 */

import express from "express";
import { getColors } from "../controllers/colorController.js";

const router = express.Router();

/**
 * @route   GET /api/colors
 * @desc    Get all predefined colors
 * @access  Public
 */
router.get("/", getColors);

export default router;
