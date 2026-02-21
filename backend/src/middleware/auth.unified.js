import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../config/logger.js";
import { ApiResponse } from "../utils/apiResponse.js";

/**
 * ========================================
 * UNIFIED AUTHENTICATION MIDDLEWARE
 * Consolidates auth.js + roleAuth.js
 * ========================================
 */

// ============ TOKEN UTILITIES ============

/**
 * Generate Access Token (15 minutes)
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

/**
 * Generate Refresh Token (7 days)
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Set token cookies
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Access token cookie (15 minutes)
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token cookie (7 days)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth/refresh", // Only sent to refresh endpoint
  });
};

/**
 * Clear auth cookies
 */
export const clearAuthCookies = (res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0), path: "/api/auth/refresh" });
};

// ============ AUTHENTICATION MIDDLEWARE ============

/**
 * Base authentication - validates JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      logger.warn(`Authentication failed: No token provided - IP: ${req.ip}`);
      return ApiResponse.unauthorized(res, "Not authorized, no token");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        logger.info(`Token expired for request to ${req.path}`);
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
          sessionExpired: true,
          code: "TOKEN_EXPIRED"
        });
      }
      throw error;
    }

    // Verify token type
    if (decoded.type !== "access") {
      logger.warn(`Invalid token type: ${decoded.type}`);
      return ApiResponse.unauthorized(res, "Invalid token type");
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      logger.warn(`User not found for token: ${decoded.id}`);
      return ApiResponse.unauthorized(res, "User not found");
    }

    // Check if user is blocked
    if (user.isBlocked) {
      logger.warn(`Blocked user attempted access: ${user.email}`);
      return ApiResponse.forbidden(res, "Account has been blocked. Contact support.");
    }

    // Check if admin is suspended
    if (user.isAdmin && user.adminStatus === "suspended") {
      logger.warn(`Suspended admin attempted access: ${user.email}`);
      return ApiResponse.forbidden(res, "Admin account suspended. Contact Super Admin.");
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Authentication error:", { message: error.message, stack: error.stack });
    return ApiResponse.unauthorized(res, "Not authorized, token failed");
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    }
    next();
  } catch (error) {
    // Token invalid, continue without user
    next();
  }
};

// ============ AUTHORIZATION MIDDLEWARE ============

/**
 * Role-based authorization factory
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, "Authentication required");
    }

    const userRole = req.user.role || (req.user.isSuperAdmin ? "super-admin" : req.user.isAdmin ? "admin" : "customer");

    if (!allowedRoles.includes(userRole)) {
      logger.warn(`Unauthorized access attempt by ${req.user.email} (${userRole}) to ${req.path}`);
      return ApiResponse.forbidden(res, `Access denied. Required role: ${allowedRoles.join(" or ")}`);
    }

    next();
  };
};

/**
 * Admin-only access (includes super-admin)
 */
export const requireAdmin = [authenticate, authorize("admin", "super-admin")];

/**
 * Super admin-only access
 */
export const requireSuperAdmin = [authenticate, authorize("super-admin")];

/**
 * Customer access
 */
export const requireCustomer = [authenticate, authorize("customer")];

/**
 * Seller access
 */
export const requireSeller = [authenticate, authorize("seller")];

/**
 * Approved seller only
 */
export const requireApprovedSeller = [
  authenticate,
  (req, res, next) => {
    if (req.user.role !== "seller") {
      return ApiResponse.forbidden(res, "Seller role required");
    }
    if (!req.user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Seller account pending approval",
        isPending: true
      });
    }
    next();
  }
];

/**
 * Admin or approved seller
 */
export const requireAdminOrApprovedSeller = [
  authenticate,
  (req, res, next) => {
    const userRole = req.user.role || (req.user.isSuperAdmin ? "super-admin" : req.user.isAdmin ? "admin" : "customer");
    
    if (["admin", "super-admin"].includes(userRole)) {
      return next();
    }
    
    if (userRole === "seller" && req.user.isApproved) {
      return next();
    }
    
    return ApiResponse.forbidden(res, "Admin or approved seller required");
  }
];

/**
 * Email verification check
 */
export const requireVerified = [
  authenticate,
  (req, res, next) => {
    if (!req.user.isVerified) {
      return ApiResponse.forbidden(res, "Please verify your email first");
    }
    next();
  }
];

// ============ LEGACY COMPATIBILITY ============

/**
 * Legacy middleware names for backward compatibility
 */
export const auth = authenticate;
export const isAdmin = authorize("admin", "super-admin");
export const isSuperAdmin = authorize("super-admin");
export const isVerified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    ApiResponse.forbidden(res, "Please verify your email first");
  }
};

// ============ RESOURCE OWNERSHIP ============

/**
 * Check if user owns the resource
 */
export const requireOwnership = (resourceField = "user") => {
  return (req, res, next) => {
    const userRole = req.user.role || (req.user.isSuperAdmin ? "super-admin" : req.user.isAdmin ? "admin" : "customer");
    
    // Super admins and admins can access everything
    if (["super-admin", "admin"].includes(userRole)) {
      return next();
    }
    
    // Mark that ownership check is required
    req.checkOwnership = true;
    req.ownershipField = resourceField;
    next();
  };
};

// ============ ADMIN ACTION LOGGING ============

/**
 * Log admin actions for audit trail
 */
export const logAdminAction = (action) => {
  return (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.isSuperAdmin)) {
      logger.info(`Admin Action: ${action}`, {
        admin: req.user.email,
        adminId: req.user._id,
        action,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
    }
    next();
  };
};

// ============ EXPORTS ============

export default {
  // Token utilities
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  
  // Authentication
  authenticate,
  optionalAuth,
  auth, // Legacy
  
  // Authorization
  authorize,
  requireAdmin,
  requireSuperAdmin,
  requireCustomer,
  requireSeller,
  requireApprovedSeller,
  requireAdminOrApprovedSeller,
  requireVerified,
  
  // Legacy
  isAdmin,
  isSuperAdmin,
  isVerified,
  
  // Utilities
  requireOwnership,
  logAdminAction
};
