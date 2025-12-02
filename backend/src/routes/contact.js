import express from "express";
import * as contactController from "../controllers/contactController.js";

const router = express.Router();

// Public routes
router.get("/settings", contactController.getContactSettings);
router.post("/message", contactController.submitContactMessage);

// Admin routes
router.put("/settings", contactController.updateContactSettings);
router.get("/messages", contactController.getAllMessages);
router.put("/messages/:id", contactController.updateMessageStatus);
router.delete("/messages/:id", contactController.deleteMessage);

export default router;
