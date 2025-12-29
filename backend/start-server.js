import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

try {
  const { default: app } = await import("./src/app.js");
  const { connectDB } = await import("./src/config/db.js");
  
  await connectDB();
  
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {});
} catch (err) {
  process.exit(1);
}