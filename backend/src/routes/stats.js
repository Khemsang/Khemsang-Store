import express from "express";
import * as statsController from "../controllers/statsController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", statsController.getAllStats);

// Admin routes
router.get("/users", auth, isAdmin, statsController.getAllUsers);
router.get("/analytics", auth, isAdmin, statsController.getAnalytics);
router.get("/notifications", auth, isAdmin, statsController.getNotifications);
router.get("/:id", statsController.getStatById);
router.post("/", statsController.createStat);
router.put("/:id", statsController.updateStat);
router.delete("/:id", statsController.deleteStat);

export default router;
