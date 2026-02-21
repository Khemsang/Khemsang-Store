import crypto from "crypto";
import logger from "../config/logger.js";
import { ApiResponse } from "../utils/apiResponse.js";

/**
 * ========================================
 * CSRF PROTECTION MIDDLEWARE
 * Double Submit Cookie Pattern
 * ========================================
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate CSRF token
 */
export const generateCsrfToken = () => {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
};

/**
 * Set CSRF token cookie
 */
export const setCsrfCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
};

/**
 * Generate and set CSRF token
 */
export const generateAndSetCsrfToken = (req, res, next) => {
  // Only generate if not already present
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateCsrfToken();
    setCsrfCookie(res, token);
    req.csrfToken = token;
  } else {
    req.csrfToken = req.cookies[CSRF_COOKIE_NAME];
  }
  next();
};

/**
 * Validate CSRF token
 */
export const validateCsrfToken = (req, res, next) => {
  // Skip CSRF for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip CSRF for public endpoints (customize as needed)
  const publicPaths = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/verify-email",
    "/api/auth/verify-otp",
    "/api/orders/esewa/verify", // Payment callbacks
    "/api/orders/esewa/failure",
  ];

  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] || req.body._csrf;

  if (!cookieToken || !headerToken) {
    logger.warn(`CSRF validation failed: Missing token from IP ${req.ip} on ${req.path}`);
    return ApiResponse.forbidden(res, "CSRF token missing");
  }

  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
    logger.warn(`CSRF validation failed: Token mismatch from IP ${req.ip} on ${req.path}`);
    return ApiResponse.forbidden(res, "Invalid CSRF token");
  }

  next();
};

/**
 * Endpoint to get CSRF token
 */
export const getCsrfToken = (req, res) => {
  const token = generateCsrfToken();
  setCsrfCookie(res, token);
  
  res.json({
    success: true,
    csrfToken: token,
  });
};

/**
 * Middleware to attach CSRF token to response
 */
export const attachCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken || req.cookies[CSRF_COOKIE_NAME];
  next();
};

export default {
  generateCsrfToken,
  setCsrfCookie,
  generateAndSetCsrfToken,
  validateCsrfToken,
  getCsrfToken,
  attachCsrfToken,
};
