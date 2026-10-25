import mongoose from "mongoose";

/**
 * Assert that every key listed in `fields` is present and non-empty on `obj`.
 * Returns an error message string, or null if all fields are present.
 *
 * @param {object} obj    - The source object (req.body, etc.)
 * @param {string[]} fields - Field names that are required
 * @returns {string|null}
 */
export const requireFields = (obj, fields) => {
  const missing = fields.filter(
    (f) => obj[f] === undefined || obj[f] === null || obj[f] === ""
  );
  if (missing.length === 0) return null;
  return `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`;
};

/**
 * Returns true if the string is a valid e-mail address.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) =>
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/**
 * Returns true if the value is a valid MongoDB ObjectId.
 * @param {*} id
 * @returns {boolean}
 */
export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Returns true if the value is a finite number greater than zero.
 * @param {*} value
 * @returns {boolean}
 */
export const isPositiveNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
};

/**
 * Returns true if the value is a finite number >= 0.
 * @param {*} value
 * @returns {boolean}
 */
export const isNonNegativeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
};

/**
 * Returns true if value is a number within [min, max] (inclusive).
 * @param {*} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export const isInRange = (value, min, max) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
};

/**
 * Returns true if value is one of the allowed enum strings.
 * @param {*} value
 * @param {string[]} allowed
 * @returns {boolean}
 */
export const isOneOf = (value, allowed) => allowed.includes(value);

/**
 * Strips a list of sensitive keys from an object (deep clone).
 * Used before logging request bodies or error metadata.
 *
 * @param {object} obj
 * @param {string[]} [keys]
 * @returns {object}
 */
export const sanitizeForLog = (
  obj,
  keys = [
    "password",
    "confirmPassword",
    "currentPassword",
    "newPassword",
    "token",
    "resetPasswordToken",
    "verificationToken",
    "refreshToken",
    "otp",
    "secret",
    "apiKey",
    "apiSecret",
    "creditCard",
    "cardNumber",
    "cvv",
  ]
) => {
  if (!obj || typeof obj !== "object") return obj;
  const clone = { ...obj };
  for (const key of keys) {
    if (key in clone) clone[key] = "[REDACTED]";
  }
  return clone;
};
