import express from "express";
import { getAbout, updateAbout } from "../controllers/aboutController.js";
import { auth, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAbout);
router.put("/", auth, isAdmin, updateAbout);

export default router;
