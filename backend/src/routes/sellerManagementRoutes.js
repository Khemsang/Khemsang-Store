import express from "express";
import {
  getAllSellers,
  getSellerDetails,
  approveSeller,
  rejectSeller,
  suspendSeller,
  reactivateSeller,
  getSellerStats
} from "../controllers/sellerManagementController.js";
import { 
  requireAdmin,
  logAdminAction
} from "../middleware/roleAuth.js";

const router = express.Router();

/**
 * Seller Management Routes
 * Admin and Super Admin can manage seller accounts
 */

// GET ALL SELLERS (with filtering and pagination)
router.get("/", ...requireAdmin, getAllSellers);

// GET SELLER STATISTICS
router.get("/stats", ...requireAdmin, getSellerStats);

// GET SELLER DETAILS
router.get("/:sellerId", ...requireAdmin, getSellerDetails);

// APPROVE SELLER
router.put(
  "/:sellerId/approve", 
  ...requireAdmin,
  logAdminAction("approve_seller"),
  approveSeller
);

// REJECT SELLER
router.put(
  "/:sellerId/reject", 
  ...requireAdmin,
  logAdminAction("reject_seller"),
  rejectSeller
);

// SUSPEND SELLER
router.put(
  "/:sellerId/suspend", 
  ...requireAdmin,
  logAdminAction("suspend_seller"),
  suspendSeller
);

// REACTIVATE SELLER
router.put(
  "/:sellerId/reactivate", 
  ...requireAdmin,
  logAdminAction("reactivate_seller"),
  reactivateSeller
);

export default router;