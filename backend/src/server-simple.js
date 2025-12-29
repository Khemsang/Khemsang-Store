import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("🚀 Starting simple backend server...");
console.log("   PORT:", process.env.PORT || 4000);
console.log("   NODE_ENV:", process.env.NODE_ENV);

try {
  // Import simplified app
  const appModule = await import("./app-simple.js");
  const app = appModule.default;
  console.log("✅ App imported successfully");

  // Import database connection
  const dbModule = await import("./config/db.js");
  const { connectDB } = dbModule;
  console.log("✅ Database module imported");

  // Connect to database
  await connectDB();
  console.log("✅ Database connected");

  // Start server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`✅ Simple server running on port ${PORT}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🔐 Auth Login: http://localhost:${PORT}/api/auth/login`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log("\n🎉 Backend is ready!");
  });

} catch (err) {
  console.error("❌ Server startup error:", err.message);
  console.error("Full error:", err);
  process.exit(1);
}