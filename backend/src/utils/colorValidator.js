/**
 * ========================================
 * COLOR VALIDATOR UTILITY
 * Validates color names and codes
 * ========================================
 */

import { PREDEFINED_COLORS } from "../constants/index.js";

/**
 * Check if color name is valid
 * @param {string} colorName - Color name to validate
 * @returns {boolean} - True if valid
 */
export const isValidColorName = (colorName) => {
  return PREDEFINED_COLORS.some(
    (color) => color.name.toLowerCase() === colorName.toLowerCase()
  );
};

/**
 * Get color code from color name
 * @param {string} colorName - Color name
 * @returns {string|null} - Color code or null if not found
 */
export const getColorCode = (colorName) => {
  const color = PREDEFINED_COLORS.find(
    (c) => c.name.toLowerCase() === colorName.toLowerCase()
  );
  return color ? color.code : null;
};

/**
 * Get all predefined colors
 * @returns {Array} - Array of color objects
 */
export const getAllColors = () => {
  return PREDEFINED_COLORS;
};

/**
 * Validate and normalize color data
 * @param {string} colorName - Color name
 * @returns {Object|null} - Normalized color object or null
 */
export const validateAndNormalizeColor = (colorName) => {
  const color = PREDEFINED_COLORS.find(
    (c) => c.name.toLowerCase() === colorName.toLowerCase()
  );
  
  if (!color) {
    return null;
  }
  
  return {
    colorName: color.name,
    colorCode: color.code,
  };
};

export default {
  isValidColorName,
  getColorCode,
  getAllColors,
  validateAndNormalizeColor,
};
