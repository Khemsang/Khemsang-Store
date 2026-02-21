import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const Product = mongoose.model(
  "Product",
  new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    images: [String],
    category: String,
    stock: Number,
    isActive: Boolean,
  })
);

const addTestProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Sample Cloudinary image URLs (public domain images)
    const sampleImages = [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    ];

    const testProducts = [
      {
        title: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 2500,
        images: [sampleImages[0]],
        category: "Electronics",
        stock: 50,
        isActive: true,
      },
      {
        title: "Smart Watch",
        description: "Feature-rich smartwatch with fitness tracking",
        price: 3500,
        images: [sampleImages[1]],
        category: "Electronics",
        stock: 30,
        isActive: true,
      },
      {
        title: "Sunglasses",
        description: "Stylish sunglasses with UV protection",
        price: 1200,
        images: [sampleImages[2]],
        category: "Fashion",
        stock: 100,
        isActive: true,
      },
    ];

    // Check if test products already exist
    const existingCount = await Product.countDocuments({
      title: { $in: testProducts.map((p) => p.title) },
    });

    if (existingCount > 0) {
      console.log("Test products already exist. Updating them...");
      for (const product of testProducts) {
        await Product.findOneAndUpdate(
          { title: product.title },
          product,
          { upsert: true }
        );
      }
    } else {
      console.log("Creating test products...");
      await Product.insertMany(testProducts);
    }

    console.log("✅ Test products added successfully!");
    console.log(`Added ${testProducts.length} products with images`);

    // Show sample
    const products = await Product.find({ title: { $in: testProducts.map((p) => p.title) } });
    console.log("\nSample product:");
    console.log(JSON.stringify(products[0], null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

addTestProducts();
