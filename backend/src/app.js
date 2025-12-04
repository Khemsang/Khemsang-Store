import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Route imports
import authRoutes from "./routes/authRoutes.js";
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

// Middleware imports
import { errorHandler } from "./middleware/errorHandler.js";

/**
 * ========================================
 * EXPRESS APP CONFIGURATION
 * ========================================
 */

const app = express();

// ==========================================
// MIDDLEWARE SETUP
// ==========================================
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==========================================
// API ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
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

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// ==========================================
// ERROR HANDLER (must be last)
// ==========================================
app.use(errorHandler);

export default app;
