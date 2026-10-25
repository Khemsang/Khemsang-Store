import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import logger from "./config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// Ensure required directories exist
for (const dir of ["uploads", "logs"]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
}

// Crash guards — log and exit so PM2 / the OS can restart cleanly
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack   = reason instanceof Error ? reason.stack  : undefined;
  logger.error("Unhandled promise rejection", { message, stack });
  process.exit(1);
});

// ── Bootstrap ────────────────────────────────────────────────────────────────
let server;

try {
  const { default: app }    = await import("./app.js");
  const { connectDB, disconnectDB } = await import("./config/db.js");

  await connectDB();

  const PORT = Number(process.env.PORT) || 4000;
  server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);

    // Stop accepting new connections
    server.close(async () => {
      try {
        await disconnectDB();
        logger.info("Shutdown complete");
        process.exit(0);
      } catch (err) {
        logger.error("Error during shutdown", { message: err.message });
        process.exit(1);
      }
    });

    // Force-kill if the server hasn't closed within 10 s
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));

} catch (err) {
  logger.error("Server startup failed", { message: err.message, stack: err.stack });
  process.exit(1);
}
