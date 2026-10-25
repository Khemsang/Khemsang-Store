import express from "express";
import * as statsController from "../controllers/statsController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// ── Admin-only named routes ── must be declared BEFORE /:id ──────────────────
router.get("/users",         auth, isAdmin, statsController.getAllUsers);
router.get("/analytics",     auth, isAdmin, statsController.getAnalytics);
router.get("/notifications", auth, isAdmin, statsController.getNotifications);
router.post("/",             auth, isAdmin, statsController.createStat);
router.put("/:id",           auth, isAdmin, statsController.updateStat);
router.delete("/:id",        auth, isAdmin, statsController.deleteStat);

// ── Public routes ── /:id last so it cannot shadow named routes above ─────────
router.get("/", statsController.getAllStats);
router.get("/:id", statsController.getStatById);

export default router;
