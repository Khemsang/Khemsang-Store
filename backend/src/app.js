import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import multiVendorAuthRoutes from "./routes/multiVendorAuthRoutes.js";
import sellerManagementRoutes from "./routes/sellerManagementRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import testimonialRoutes from "./routes/testimonials.js";
import categoryRoutes from "./routes/categories.js";
import featuredProductRoutes from "./routes/featuredProducts.js";
import bannerRoutes from "./routes/banners.js";
import statsRoutes from "./routes/stats.js";
import reviewRoutes from "./routes/reviews.js";
import aboutRoutes from "./routes/about.js";
import contactRoutes from "./routes/contact.js";
import featureRoutes from "./routes/features.js";
import uploadRoutes from "./routes/upload.js";
import activityRoutes from "./routes/activities.js";
import brandRoutes from "./routes/brands.js";
import couponRoutes from "./routes/coupons.js";
import adminManagementRoutes from "./routes/adminManagement.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes); // Legacy auth routes
app.use("/api/auth", multiVendorAuthRoutes); // New multi-vendor auth routes
app.use("/api/admin/sellers", sellerManagementRoutes); // Seller management
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/featured-products", featuredProductRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin-management", adminManagementRoutes);

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.use(errorHandler);

export default app;
