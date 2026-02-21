import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import logger from "./config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// Create required directories
const dirs = ["uploads", "logs"];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
});

// Error handlers
process.on("uncaughtException", (err) => {
  logger.error("❌ Uncaught Exception:", { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("❌ Unhandled Rejection:", { message: err.message, stack: err.stack });
  process.exit(1);
});

try {
  const appModule = await import("./app.js");
  const app = appModule.default;

  const dbModule = await import("./config/db.js");
  const { connectDB } = dbModule;

  await connectDB();

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
} catch (err) {
  logger.error("❌ Server startup failed:", { message: err.message, stack: err.stack });
  process.exit(1);
} process.exit(1);

