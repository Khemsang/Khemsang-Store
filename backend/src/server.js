import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { testEmailConnection } from "./config/email.js";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Create uploads folder if it doesn't exist
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Connect to database
connectDB();

// Test email connection (disabled to prevent crashes with invalid credentials)
// testEmailConnection().catch((err) => {
//   console.log("⚠️  Email test skipped:", err.message);
// });
console.log("⚠️  Email test disabled - will verify on first send");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
