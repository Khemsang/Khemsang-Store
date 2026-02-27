import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Enhanced Authentication Middleware for Multi-Vendor Platform
 * Provides role-based access control with detailed security checks
 */

// Base authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Access denied. No token provided." 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token. User not found." 
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false,
        message: "Account has been blocked. Contact support." 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ 
      success: false,
      message: "Invalid token." 
    });
  }
};

// Role-based authorization middleware factory
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required." 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Specific role middlewares
export const requireCustomer = [authenticate, authorize("customer")];
export const requireSeller = [authenticate, authorize("seller")];
export const requireAdmin = [authenticate, authorize("admin", "super-admin")];
export const requireSuperAdmin = [authenticate, authorize("super-admin")];

// Seller-specific middleware (must be approved)
export const requireApprovedSeller = [
  authenticate,
  (req, res, next) => {
    if (req.user.role !== "seller") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Seller role required." 
      });
    }

    if (!req.user.isApproved) {
      return res.status(403).json({ 
        success: false,
        message: "Seller account pending approval. Please wait for admin approval.",
        isPending: true
      });
    }

    next();
  }
];

// Admin or approved seller (for product management)
export const requireAdminOrApprovedSeller = [
  authenticate,
  (req, res, next) => {
    const user = req.user;
    
    // Allow admins and super-admins
    if (user.role === "admin" || user.role === "super-admin") {
      return next();
    }
    
    // Allow approved sellers
    if (user.role === "seller" && user.isApproved) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Admin or approved seller required." 
    });
  }
];

// Middleware to check if user can manage specific resource
export const requireResourceOwnership = (resourceField = "user") => {
  return (req, res, next) => {
    const user = req.user;
    
    // Super admins can access everything
    if (user.role === "super-admin") {
      return next();
    }
    
    // Admins can access most things
    if (user.role === "admin") {
      return next();
    }
    
    // For sellers and customers, check ownership
    // This will be implemented in individual route handlers
    req.checkOwnership = true;
    next();
  };
};

// Middleware to log admin actions
export const logAdminAction = (action) => {
  return (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "super-admin")) {
      // Log the action (implement logging service)
    }
    next();
  };
};

// Rate limiting for sensitive operations
export const rateLimitSensitive = (req, res, next) => {
  // Implement rate limiting logic here
  // For now, just pass through
  next();
};

export default {
  authenticate,
  authorize,
  requireCustomer,
  requireSeller,
  requireAdmin,
  requireSuperAdmin,
  requireApprovedSeller,
  requireAdminOrApprovedSeller,
  requireResourceOwnership,
  logAdminAction,
  rateLimitSensitive
};