/**
 * ========================================
 * APPLICATION CONSTANTS
 * Centralized constants for consistency
 * ========================================
 */

// ============ USER ROLES ============
export const USER_ROLES = {
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
  SUPER_ADMIN: "super-admin",
};

// ============ ORDER STATUS ============
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

// ============ PAYMENT STATUS ============
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

// ============ ADMIN STATUS ============
export const ADMIN_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  PENDING: "pending",
};

// ============ HTTP STATUS CODES ============
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// ============ TOKEN EXPIRY ============
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: "15m",
  REFRESH_TOKEN: "7d",
  EMAIL_VERIFICATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_RESET: 15 * 60 * 1000, // 15 minutes
  PASSWORD_RESET_SUPER_ADMIN: 30 * 60 * 1000, // 30 minutes
  OTP: 15 * 60 * 1000, // 15 minutes
};

// ============ RATE LIMITS ============
export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  STRICT: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 3,
  },
};

// ============ FILE UPLOAD ============
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5,
  ALLOWED_MIME_TYPES: {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/gif": [".gif"],
  },
  SUSPICIOUS_EXTENSIONS: [".php", ".exe", ".sh", ".bat", ".cmd", ".js"],
};

// ============ PAGINATION ============
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
};

// ============ VALIDATION ============
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10}$/,
};

// ============ COOKIE OPTIONS ============
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
};

// ============ ERROR MESSAGES ============
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_NOT_VERIFIED: "Please verify your email first",
  ACCOUNT_BLOCKED: "Your account has been blocked. Contact support.",
  ADMIN_SUSPENDED: "Your admin account has been suspended. Contact Super Admin.",
  TOKEN_EXPIRED: "Session expired. Please login again.",
  INVALID_TOKEN: "Invalid or expired token",
  UNAUTHORIZED: "Not authorized to access this resource",
  FORBIDDEN: "Access forbidden",
  
  // Validation
  REQUIRED_FIELDS: "Please provide all required fields",
  INVALID_EMAIL: "Please provide a valid email address",
  INVALID_PASSWORD: "Password must be at least 6 characters",
  PASSWORD_MISMATCH: "Passwords do not match",
  
  // Resources
  USER_NOT_FOUND: "User not found",
  PRODUCT_NOT_FOUND: "Product not found",
  ORDER_NOT_FOUND: "Order not found",
  CATEGORY_NOT_FOUND: "Category not found",
  
  // General
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again.",
  SERVER_ERROR: "Internal server error",
};

// ============ SUCCESS MESSAGES ============
export const SUCCESS_MESSAGES = {
  // Authentication
  SIGNUP_SUCCESS: "Account created successfully. Please verify your email.",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logged out successfully",
  EMAIL_VERIFIED: "Email verified successfully",
  PASSWORD_CHANGED: "Password changed successfully",
  PASSWORD_RESET_SENT: "Password reset link sent to your email",
  PASSWORD_RESET_SUCCESS: "Password reset successful",
  
  // CRUD Operations
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  
  // General
  SUCCESS: "Operation completed successfully",
};

// ============ ACTIVITY TYPES ============
export const ACTIVITY_TYPES = {
  // User Activities
  USER_SIGNUP: "user_signup",
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  PROFILE_UPDATED: "profile_updated",
  PASSWORD_CHANGED: "password_changed",
  PASSWORD_RESET_REQUESTED: "password_reset_requested",
  
  // Admin Activities
  ADMIN_CREATED: "admin_created",
  ADMIN_UPDATED: "admin_updated",
  ADMIN_SUSPENDED: "admin_suspended",
  ADMIN_ACTIVATED: "admin_activated",
  
  // Product Activities
  PRODUCT_CREATED: "product_created",
  PRODUCT_UPDATED: "product_updated",
  PRODUCT_DELETED: "product_deleted",
  
  // Order Activities
  ORDER_CREATED: "order_created",
  ORDER_UPDATED: "order_updated",
  ORDER_CANCELLED: "order_cancelled",
};

// ============ PERMISSIONS ============
export const PERMISSIONS = {
  PRODUCTS: {
    CREATE: "products.create",
    EDIT: "products.edit",
    DELETE: "products.delete",
    VIEW: "products.view",
  },
  ORDERS: {
    VIEW: "orders.view",
    MANAGE: "orders.manage",
  },
  USERS: {
    VIEW: "users.view",
    BLOCK: "users.block",
    DELETE: "users.delete",
  },
  CATEGORIES: {
    CREATE: "categories.create",
    EDIT: "categories.edit",
    DELETE: "categories.delete",
  },
  BANNERS: {
    MANAGE: "banners.manage",
  },
  COUPONS: {
    MANAGE: "coupons.manage",
  },
  REVIEWS: {
    MANAGE: "reviews.manage",
  },
  PAYMENTS: {
    VIEW: "payments.view",
  },
};

// ============ PREDEFINED COLORS ============
export const PREDEFINED_COLORS = [
  { name: "Black", code: "#000000" },
  { name: "White", code: "#FFFFFF" },
  { name: "Red", code: "#FF0000" },
  { name: "Blue", code: "#0000FF" },
  { name: "Green", code: "#00FF00" },
  { name: "Yellow", code: "#FFFF00" },
  { name: "Orange", code: "#FFA500" },
  { name: "Purple", code: "#800080" },
  { name: "Pink", code: "#FFC0CB" },
  { name: "Brown", code: "#A52A2A" },
  { name: "Gray", code: "#808080" },
  { name: "Navy", code: "#000080" },
];

// ============ EXPORTS ============
export default {
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  ADMIN_STATUS,
  HTTP_STATUS,
  TOKEN_EXPIRY,
  RATE_LIMITS,
  FILE_UPLOAD,
  PAGINATION,
  VALIDATION,
  COOKIE_OPTIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ACTIVITY_TYPES,
  PERMISSIONS,
  PREDEFINED_COLORS,
};
