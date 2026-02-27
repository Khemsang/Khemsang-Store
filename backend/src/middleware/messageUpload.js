import multer from "multer";
import path from "path";
import crypto from "crypto";
import logger from "../config/logger.js";

/**
 * ========================================
 * MESSAGE ATTACHMENT UPLOAD MIDDLEWARE
 * Supports documents, images, and other files
 * ========================================
 */

// Allowed file types for message attachments
const ALLOWED_FILE_TYPES = {
  // Images
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  
  // Documents
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "text/plain": [".txt"],
  "text/csv": [".csv"],
  
  // Archives
  "application/zip": [".zip"],
  "application/x-rar-compressed": [".rar"],
  "application/x-7z-compressed": [".7z"],
};

const ALLOWED_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".gif", ".webp",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx",
  ".ppt", ".pptx", ".txt", ".csv",
  ".zip", ".rar", ".7z"
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const randomName = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();

  logger.info(`📎 Attachment upload: ${file.originalname} (${file.mimetype})`);

  if (!ALLOWED_EXTENSIONS.includes(extname)) {
    logger.warn(`Rejected attachment: Invalid extension ${extname}`);
    return cb(
      new Error(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`),
      false
    );
  }

  // Security check for suspicious filenames
  const filename = file.originalname.toLowerCase();
  const suspiciousPatterns = [".exe", ".sh", ".bat", ".cmd", ".js", ".html", ".htm", ".php"];
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  
  if (suspiciousPatterns.some(pattern => nameWithoutExt.includes(pattern))) {
    logger.warn(`Rejected attachment: Suspicious filename ${filename}`);
    return cb(new Error("Suspicious file name detected"), false);
  }

  logger.info(`✅ Attachment accepted: ${file.originalname}`);
  cb(null, true);
};

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB per file",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 5 attachments",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  
  if (err) {
    logger.error("Attachment upload error:", { message: err.message });
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }
  
  next();
};

export const messageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5, // Maximum 5 files
  },
});

export const messageUploadErrorHandler = handleMulterError;

export const uploadMessageAttachments = [
  messageUpload.array("attachments", 5),
  handleMulterError
];
