import crypto from "crypto";
import logger from "../config/logger.js";

/**
 * ========================================
 * REQUEST ID MIDDLEWARE
 * Adds unique ID to each request for tracking
 * ========================================
 */

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
};

/**
 * Add request ID to all requests
 */
export const addRequestId = (req, res, next) => {
  // Use existing request ID from header or generate new one
  req.id = req.headers["x-request-id"] || generateRequestId();
  
  // Add to response headers
  res.setHeader("X-Request-ID", req.id);
  
  // Add to logger context
  req.log = logger.child({ requestId: req.id });
  
  next();
};

/**
 * Log request details
 */
export const logRequest = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request start
  logger.info("Request started", {
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: req.user?._id,
  });

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    
    logger.info("Request completed", {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?._id,
    });
  });

  next();
};

export default {
  addRequestId,
  logRequest,
};
