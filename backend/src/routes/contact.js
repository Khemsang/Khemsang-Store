import express from "express";
import * as contactController from "../controllers/contactController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/settings", contactController.getContactSettings);
router.post("/message", contactController.submitContactMessage);

// Admin routes
router.put("/settings", auth, isAdmin, contactController.updateContactSettings);
router.get("/messages", auth, isAdmin, contactController.getAllMessages);
router.put("/messages/:id", auth, isAdmin, contactController.updateMessageStatus);
router.delete("/messages/:id", auth, isAdmin, contactController.deleteMessage);

export default router;
