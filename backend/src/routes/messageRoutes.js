import express from "express";
import {
  sendMessage,
  getInbox,
  getSentMessages,
  getStarredMessages,
  getDraftMessages,
  getTrashMessages,
  getMessage,
  markAsRead,
  deleteMessage,
  toggleStar,
  saveDraft,
  sendDraft,
  permanentlyDeleteMessage,
  restoreMessage,
  getUnreadCount,
  getAdmins,
} from "../controllers/messageController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.post("/", auth, sendMessage);
router.post("/draft", auth, saveDraft);
router.get("/inbox", auth, getInbox);
router.get("/sent", auth, getSentMessages);
router.get("/starred", auth, getStarredMessages);
router.get("/drafts", auth, getDraftMessages);
router.get("/trash", auth, getTrashMessages);
router.get("/unread/count", auth, getUnreadCount);
router.get("/admins", auth, getAdmins);
router.get("/:id", auth, getMessage);
router.put("/:id/read", auth, markAsRead);
router.put("/:id/star", auth, toggleStar);
router.put("/:id/send", auth, sendDraft);
router.put("/:id/restore", auth, restoreMessage);
router.delete("/:id", auth, deleteMessage);
router.delete("/:id/permanent", auth, permanentlyDeleteMessage);

export default router;
