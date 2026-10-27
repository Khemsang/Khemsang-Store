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
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

const noop = (req, res, next) => next();

router.get("/",                  ...requireAdmin, getAllSellers);
router.get("/stats",             ...requireAdmin, getSellerStats);
router.get("/:sellerId",         ...requireAdmin, getSellerDetails);
router.put("/:sellerId/approve", ...requireAdmin, approveSeller);
router.put("/:sellerId/reject",  ...requireAdmin, rejectSeller);
router.put("/:sellerId/suspend", ...requireAdmin, suspendSeller);
router.put("/:sellerId/reactivate", ...requireAdmin, reactivateSeller);

export default router;