import express from "express";
import * as contactController from "../controllers/contactController.js";
import { auth, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/settings", contactController.getContactSettings);
router.post("/message", contactController.submitContactMessage);

// Super Admin only routes
router.put(
  "/settings",
  auth,
  isSuperAdmin,
  contactController.updateContactSettings
);
router.get("/messages", auth, isSuperAdmin, contactController.getAllMessages);
router.put(
  "/messages/:id",
  auth,
  isSuperAdmin,
  contactController.updateMessageStatus
);
router.delete(
  "/messages/:id",
  auth,
  isSuperAdmin,
  contactController.deleteMessage
);

export default router;
