import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";

import logger from "./config/logger.js";
import { helmetConfig, sanitizeData, apiLimiter } from "./middleware/security.js";

import authRoutes from "./routes/authRoutes.js";
import multiVendorAuthRoutes from "./routes/multiVendorAuthRoutes.js";
import sellerManagementRoutes from "./routes/sellerManagementRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import variantRoutes from "./routes/variantRoutes.js";
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
import messageRoutes from "./routes/messageRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Security Middleware
app.use(helmetConfig);
app.use(sanitizeData);

// CORS Configuration
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

// Body Parser & Cookie Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Compression
app.use(compression());

// HTTP Request Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// Rate Limiting for all API routes
app.use("/api", apiLimiter);

// API Routes
app.use("/api/auth", authRoutes); // Legacy auth routes
app.use("/api/admin/sellers", sellerManagementRoutes); // Seller management
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
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
app.use("/api/messages", messageRoutes);

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
