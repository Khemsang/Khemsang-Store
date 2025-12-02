import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { testEmailConnection } from "./config/email.js";
import fs from "fs";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, "../.env") });

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Test email connection
testEmailConnection();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
