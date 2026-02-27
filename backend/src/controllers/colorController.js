/**
 * ========================================
 * COLOR CONTROLLER
 * Handles predefined color operations
 * ========================================
 */

import { getAllColors } from "../utils/colorValidator.js";
import { HTTP_STATUS } from "../constants/index.js";

/**
 * @desc    Get all predefined colors
 * @route   GET /api/colors
 * @access  Public
 */
export const getColors = async (req, res) => {
  try {
    const colors = getAllColors();
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: colors.length,
      data: colors,
    });
  } catch (error) {
    console.error("Get colors error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch colors",
      error: error.message,
    });
  }
};

export default {
  getColors,
};
