import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        message: "Not authorized, no token",
        sessionExpired: true 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ 
        message: "User not found",
        sessionExpired: true 
      });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Session expired. Please login again.",
        sessionExpired: true 
      });
    }
    res.status(401).json({ 
      message: "Not authorized, token failed",
      sessionExpired: true 
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.user.isSuperAdmin)) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.isSuperAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Super Admin only." });
  }
};

export const isVerified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(403).json({ message: "Please verify your email first" });
  }
};

// Optional auth - doesn't fail if no token, just sets req.user if available
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    }
    next();
  } catch {
    // Token invalid, continue without user
    next();
  }
};
