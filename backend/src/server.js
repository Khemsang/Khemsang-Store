import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Error handlers
process.on("uncaughtException", (err) => {
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
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
    console.log(` Server running on port ${PORT}`);
  });
} catch (err) {
  console.error(" Server startup failed:", err.message);
  process.exit(1);
}
