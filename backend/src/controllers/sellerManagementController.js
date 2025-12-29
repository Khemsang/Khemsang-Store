import User from "../models/User.js";
import { createActivity } from "./activityController.js";
import { sendSellerApprovalEmail, sendSellerRejectionEmail } from "../services/emailService.js";

/**
 * Seller Management Controller
 * Handles seller approval, rejection, and management by admins
 */

// GET ALL SELLERS (Admin/Super Admin only)
export const getAllSellers = async (req, res) => {
  try {
    const { 
      status = "all", // all, pending, approved, rejected
      page = 1, 
      limit = 10,
      search = ""
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { role: "seller" };

    // Filter by approval status
    if (status === "pending") {
      query.isApproved = false;
      query.rejectedAt = { $exists: false };
    } else if (status === "approved") {
      query.isApproved = true;
    } else if (status === "rejected") {
      query.rejectedAt = { $exists: true };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "businessInfo.businessName": { $regex: search, $options: "i" } }
      ];
    }

    const sellers = await User.find(query)
      .select("-password")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        sellers,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error("Get sellers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching sellers"
    });
  }
};

// GET SELLER DETAILS (Admin/Super Admin only)
export const getSellerDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findOne({ _id: sellerId, role: "seller" })
      .select("-password")
      .populate("approvedBy", "name email")
      .populate("createdBy", "name email");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    res.json({
      success: true,
      data: { seller }
    });
  } catch (error) {
    console.error("Get seller details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching seller details"
    });
  }
};

// APPROVE SELLER (Admin/Super Admin only)
export const approveSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { approvalNote } = req.body;

    const seller = await User.findOne({ _id: sellerId, role: "seller" });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    if (seller.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Seller is already approved"
      });
    }

    // Approve seller
    seller.isApproved = true;
    seller.approvedBy = req.user._id;
    seller.approvedAt = new Date();
    seller.rejectedAt = undefined;
    seller.rejectionReason = undefined;
    await seller.save();

    // Send approval email
    try {
      await sendSellerApprovalEmail(
        seller.email, 
        seller.name, 
        seller.businessInfo.businessName,
        approvalNote
      );
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    // Log activity
    await createActivity(
      req.user._id,
      "seller_approved",
      `Approved seller: ${seller.businessInfo.businessName}`,
      { 
        sellerId: seller._id,
        sellerEmail: seller.email,
        businessName: seller.businessInfo.businessName,
        approvalNote
      }
    );

    res.json({
      success: true,
      message: "Seller approved successfully",
      data: {
        seller: {
          id: seller._id,
          name: seller.name,
          email: seller.email,
          businessName: seller.businessInfo.businessName,
          isApproved: seller.isApproved,
          approvedAt: seller.approvedAt,
          approvedBy: req.user.name
        }
      }
    });
  } catch (error) {
    console.error("Approve seller error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving seller"
    });
  }
};

// REJECT SELLER (Admin/Super Admin only)
export const rejectSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }

    const seller = await User.findOne({ _id: sellerId, role: "seller" });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    if (seller.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Cannot reject an already approved seller"
      });
    }

    // Reject seller
    seller.isApproved = false;
    seller.rejectedAt = new Date();
    seller.rejectionReason = rejectionReason;
    seller.approvedBy = undefined;
    seller.approvedAt = undefined;
    await seller.save();

    // Send rejection email
    try {
      await sendSellerRejectionEmail(
        seller.email,
        seller.name,
        seller.businessInfo.businessName,
        rejectionReason
      );
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    // Log activity
    await createActivity(
      req.user._id,
      "seller_rejected",
      `Rejected seller: ${seller.businessInfo.businessName}`,
      {
        sellerId: seller._id,
        sellerEmail: seller.email,
        businessName: seller.businessInfo.businessName,
        rejectionReason
      }
    );

    res.json({
      success: true,
      message: "Seller rejected successfully",
      data: {
        seller: {
          id: seller._id,
          name: seller.name,
          email: seller.email,
          businessName: seller.businessInfo.businessName,
          isApproved: seller.isApproved,
          rejectedAt: seller.rejectedAt,
          rejectionReason: seller.rejectionReason
        }
      }
    });
  } catch (error) {
    console.error("Reject seller error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting seller"
    });
  }
};

// SUSPEND SELLER (Admin/Super Admin only)
export const suspendSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { suspensionReason, duration } = req.body; // duration in days

    const seller = await User.findOne({ _id: sellerId, role: "seller" });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    // Suspend seller
    seller.isBlocked = true;
    seller.suspendedAt = new Date();
    seller.suspendReason = suspensionReason;
    
    if (duration && duration > 0) {
      const suspendUntil = new Date();
      suspendUntil.setDate(suspendUntil.getDate() + parseInt(duration));
      seller.suspendedUntil = suspendUntil;
    }

    await seller.save();

    // Log activity
    await createActivity(
      req.user._id,
      "seller_suspended",
      `Suspended seller: ${seller.businessInfo.businessName}`,
      {
        sellerId: seller._id,
        sellerEmail: seller.email,
        businessName: seller.businessInfo.businessName,
        suspensionReason,
        duration
      }
    );

    res.json({
      success: true,
      message: "Seller suspended successfully",
      data: {
        seller: {
          id: seller._id,
          name: seller.name,
          businessName: seller.businessInfo.businessName,
          isBlocked: seller.isBlocked,
          suspendedAt: seller.suspendedAt,
          suspendedUntil: seller.suspendedUntil,
          suspendReason: seller.suspendReason
        }
      }
    });
  } catch (error) {
    console.error("Suspend seller error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while suspending seller"
    });
  }
};

// REACTIVATE SELLER (Admin/Super Admin only)
export const reactivateSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findOne({ _id: sellerId, role: "seller" });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    // Reactivate seller
    seller.isBlocked = false;
    seller.suspendedAt = undefined;
    seller.suspendedUntil = undefined;
    seller.suspendReason = undefined;
    await seller.save();

    // Log activity
    await createActivity(
      req.user._id,
      "seller_reactivated",
      `Reactivated seller: ${seller.businessInfo.businessName}`,
      {
        sellerId: seller._id,
        sellerEmail: seller.email,
        businessName: seller.businessInfo.businessName
      }
    );

    res.json({
      success: true,
      message: "Seller reactivated successfully",
      data: {
        seller: {
          id: seller._id,
          name: seller.name,
          businessName: seller.businessInfo.businessName,
          isBlocked: seller.isBlocked
        }
      }
    });
  } catch (error) {
    console.error("Reactivate seller error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reactivating seller"
    });
  }
};

// GET SELLER STATISTICS (Admin/Super Admin only)
export const getSellerStats = async (req, res) => {
  try {
    const totalSellers = await User.countDocuments({ role: "seller" });
    const approvedSellers = await User.countDocuments({ 
      role: "seller", 
      isApproved: true 
    });
    const pendingSellers = await User.countDocuments({ 
      role: "seller", 
      isApproved: false,
      rejectedAt: { $exists: false }
    });
    const rejectedSellers = await User.countDocuments({ 
      role: "seller", 
      rejectedAt: { $exists: true }
    });
    const suspendedSellers = await User.countDocuments({ 
      role: "seller", 
      isBlocked: true 
    });

    res.json({
      success: true,
      data: {
        stats: {
          total: totalSellers,
          approved: approvedSellers,
          pending: pendingSellers,
          rejected: rejectedSellers,
          suspended: suspendedSellers,
          approvalRate: totalSellers > 0 ? ((approvedSellers / totalSellers) * 100).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    console.error("Get seller stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching seller statistics"
    });
  }
};

export default {
  getAllSellers,
  getSellerDetails,
  approveSeller,
  rejectSeller,
  suspendSeller,
  reactivateSeller,
  getSellerStats
};