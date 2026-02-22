import multer from "multer";
import path from "path";
import crypto from "crypto";
import logger from "../config/logger.js";

/**
 * ========================================
 * ENHANCED FILE UPLOAD MIDDLEWARE
 * With MIME type validation & security
 * ========================================
 */

// Allowed MIME types with their extensions
const ALLOWED_FILE_TYPES = {
  // Images - Common MIME types
  "image/jpeg": [".jpg", ".jpeg", ".jpe", ".jfif"],
  "image/jpg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/bmp": [".bmp"],
  "image/svg+xml": [".svg"],
  "image/tiff": [".tiff", ".tif"],
  "image/x-icon": [".ico"],
  // Sometimes browsers send these
  "image/pjpeg": [".jpg", ".jpeg"],
  "image/x-png": [".png"],
};

// Common image extensions
const ALLOWED_EXTENSIONS = [
  ".jpg", ".jpeg", ".jpe", ".jfif",
  ".png", ".webp", ".gif", 
  ".bmp", ".svg", ".tiff", ".tif", ".ico"
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate secure random filename
    const randomName = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomName}${ext}`);
  },
});

/**
 * Enhanced file filter with MIME type validation
 */
const fileFilter = (req, file, cb) => {
  const mimetype = file.mimetype.toLowerCase();
  const extname = path.extname(file.originalname).toLowerCase();

  console.log(`📁 File upload attempt: ${file.originalname}`);
  console.log(`   MIME type: ${mimetype}`);
  console.log(`   Extension: ${extname}`);

  // Check if extension is allowed (primary check)
  if (!ALLOWED_EXTENSIONS.includes(extname)) {
    logger.warn(`Rejected file upload: Invalid extension ${extname} from IP ${req.ip}`);
    return cb(
      new Error(
        `File extension not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`
      ),
      false
    );
  }

  // Check if MIME type starts with "image/" (flexible check)
  if (!mimetype.startsWith("image/")) {
    logger.warn(`Rejected file upload: Invalid MIME type ${mimetype} from IP ${req.ip}`);
    return cb(
      new Error(
        `File type not allowed. Only image files are accepted.`
      ),
      false
    );
  }

  // Additional security: Check for double extensions and suspicious patterns
  const filename = file.originalname.toLowerCase();
  const suspiciousPatterns = [".php", ".exe", ".sh", ".bat", ".cmd", ".js", ".html", ".htm"];
  
  // Check if filename contains suspicious patterns before the image extension
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  if (suspiciousPatterns.some(pattern => nameWithoutExt.includes(pattern))) {
    logger.warn(`Rejected file upload: Suspicious filename ${filename} from IP ${req.ip}`);
    return cb(new Error("Suspicious file name detected"), false);
  }

  logger.info(`✅ File upload accepted: ${file.originalname} (${mimetype}) from IP ${req.ip}`);
  cb(null, true);
};

/**
 * Error handler for multer
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 5 files",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  
  if (err) {
    logger.error("File upload error:", { message: err.message, stack: err.stack });
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }
  
  next();
};

// Main upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // Maximum 5 files
  },
});

// Export error handler
export const uploadErrorHandler = handleMulterError;

// Specific upload configurations
export const uploadSingle = (fieldName) => [
  upload.single(fieldName),
  handleMulterError
];

export const uploadMultiple = (fieldName, maxCount = 5) => [
  upload.array(fieldName, maxCount),
  handleMulterError
];

export const uploadFields = (fields) => [
  upload.fields(fields),
  handleMulterError
];
