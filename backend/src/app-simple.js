import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Only import essential routes for testing
import authRoutes from "./routes/authRoutes.js";

const app = express();

// CORS setup
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

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
console.log("🔄 Registering auth routes...");
app.use("/api/auth", authRoutes);
console.log("✅ Auth routes registered");

// Basic error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

export default app;