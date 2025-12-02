import express from "express";
import * as statsController from "../controllers/statsController.js";

const router = express.Router();

// Public routes
router.get("/", statsController.getAllStats);
router.get("/:id", statsController.getStatById);

// Admin routes
router.post("/", statsController.createStat);
router.put("/:id", statsController.updateStat);
router.delete("/:id", statsController.deleteStat);

export default router;
