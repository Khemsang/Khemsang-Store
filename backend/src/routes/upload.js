import express from "express";
import { upload } from "../middleware/upload.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Single image upload — admin only
router.post("/", auth, isAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = await uploadToCloudinary(req.file);
    res.json({ url: imageUrl });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading image", error: error.message });
  }
});

export default router;
