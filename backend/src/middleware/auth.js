import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ─── Core authentication ───────────────────────────────────────────────────
// Centralises: token extraction, JWT verification, user loading,
// blocked-user check, and all invalid/expired token responses.
// Every protected route uses this as its first middleware.

export const auth = async (req, res, next) => {
  try {
    // Support both cookie-based sessions and Bearer tokens (API clients)
    const token =
      req.cookies.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
        sessionExpired: true,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
          sessionExpired: true,
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
        sessionExpired: true,
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
        sessionExpired: true,
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account has been blocked. Contact support.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
      sessionExpired: true,
    });
  }
};

// ─── Optional authentication ───────────────────────────────────────────────
// Sets req.user if a valid token is present, but never blocks the request.
// Used on public routes that behave differently for authenticated users
// (e.g. GET /products applies adminOnly filter when req.user is an admin).

export const optionalAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user && !user.isBlocked) req.user = user;
  } catch {
    // Silently ignore invalid/expired tokens on optional routes
  }
  next();
};

// ─── Role authorization ────────────────────────────────────────────────────
// These must come AFTER `auth` in the middleware chain.
// They only check req.user — they never touch tokens or the database.

export const isAdmin = (req, res, next) => {
  if (req.user?.isAdmin || req.user?.isSuperAdmin) return next();
  res.status(403).json({ success: false, message: "Access denied. Admin only." });
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user?.isSuperAdmin) return next();
  res.status(403).json({ success: false, message: "Access denied. Super Admin only." });
};

export const isVerified = (req, res, next) => {
  if (req.user?.isVerified) return next();
  res.status(403).json({ success: false, message: "Please verify your email first." });
};

// Role-string based guard — used by multi-vendor routes.
// Usage: authorize("admin", "super-admin")
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required: ${roles.join(" or ")}. Yours: ${req.user.role}`,
    });
  }
  next();
};

// ─── Composite guards (convenience arrays for route files) ─────────────────
export const requireAdmin      = [auth, authorize("admin", "super-admin")];
export const requireSuperAdmin = [auth, authorize("super-admin")];
export const requireSeller     = [auth, authorize("seller")];
export const requireApprovedSeller = [
  auth,
  (req, res, next) => {
    if (req.user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller role required." });
    }
    if (!req.user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Seller account pending approval.",
        isPending: true,
      });
    }
    next();
  },
];
