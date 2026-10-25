import logger from "../config/logger.js";
import { sanitizeForLog } from "../utils/validate.js";

export const errorHandler = (err, req, res, next) => {
  // Scrub any sensitive fields before writing to logs
  const safeMeta = sanitizeForLog({
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
    body: sanitizeForLog(req.body),
  });

  logger.error(err.message, {
    stack: err.stack,
    ...safeMeta,
  });

  // err.statusCode takes priority; fall back to the response status if it has
  // already been set to something other than 200; otherwise default to 500.
  const statusCode = err.statusCode ?? (res.statusCode !== 200 ? res.statusCode : 500);

  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    // Never leak raw internal error messages to clients in production
    message:
      isProduction && statusCode >= 500
        ? "Internal Server Error"
        : err.message || "Internal Server Error",
    ...(!isProduction && { stack: err.stack }),
  });
};
