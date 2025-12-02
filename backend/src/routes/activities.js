import express from "express";
import {
  getUserActivities,
  createActivity,
} from "../controllers/activityController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", auth, getUserActivities);
router.post("/", auth, createActivity);

export default router;
