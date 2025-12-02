import mongoose from "mongoose";
import Testimonial from "../models/Testimonial.js";
import Category from "../models/Category.js";
import FeaturedProduct from "../models/FeaturedProduct.js";
import Banner from "../models/Banner.js";
import Stats from "../models/Stats.js";
import dotenv from "dotenv";

dotenv.config();

const testimonials = [
  {
    name: "Anna",
    role: "Founder of Eva Jane Beauty",
    imageUrl:
      "https://static.wikia.nocookie.net/disney/images/0/0f/Profile_-_Anna.jpeg/revision/latest?cb=20200319054431",
    quote:
      "As an entrepreneur who is deeply involved in the Beauty industry, I have been very devoted to creating my original products. This furniture store has been my trusted partner in this process.",
    rating: 5,
  },
  {
    name: "Elsa",
    role: "CEO of Frost Inc.",
    imageUrl:
      "https://static.wikia.nocookie.net/disney/images/a/a4/Profile_-_Elsa.jpeg/revision/latest?cb=20200319054430",
    quote:
      "This furniture store has empowered our business to scale internationally. The quality and support are unmatched.",
    rating: 5,
  },
  {
    name: "Olaf",
    role: "Marketing Head at Summer Corp",
    quote:
      "Using this store, we have furnished many valuable spaces, growing our network and satisfaction tremendously.",
    imageUrl:
      "https://static.wikia.nocookie.net/disney/images/7/7f/Profile_-_Olaf.jpeg/revision/latest?cb=20200319054435",
    rating: 5,
  },
  {
    name: "Kristoff",
    role: "Product Manager at Northern Lights",
    imageUrl:
      "https://static.wikia.nocookie.net/disney/images/1/13/Profile_-_Kristoff.jpeg/revision/latest?cb=20200319054433",
    quote:
      "This store offers a seamless shopping experience that helps us deliver quality furniture to our customers faster.",
    rating: 4,
  },
];

const categories = [
  {
    name: "Chair",
    description: "Comfortable and stylish chairs",
    image: "/img/chair.png",
  },
  {
    name: "Table",
    description: "Elegant wooden tables",
    image: "/img/table.png",
  },
  {
    name: "Sofa",
    description: "Luxurious sofas for your living room",
    image: "/img/sofa.png",
  },
  {
    name: "Bed",
    description: "Comfortable beds for better sleep",
    image: "/img/bed.png",
  },
  {
    name: "Cabinet",
    description: "Storage solutions for your home",
    image: "/img/cabinet.png",
  },
  {
    name: "Desk",
    description: "Perfect desks for your workspace",
    image: "/img/desk.png",
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Testimonial.deleteMany({});
    await Category.deleteMany({});
    await FeaturedProduct.deleteMany({});
    await Banner.deleteMany({});
    await Stats.deleteMany({});
    console.log("Cleared existing data");

    // Insert testimonials
    await Testimonial.insertMany(testimonials);
    console.log("Testimonials seeded successfully");

    // Insert categories
    await Category.insertMany(categories);
    console.log("Categories seeded successfully");

    // Insert featured products
    await FeaturedProduct.insertMany(featuredProducts);
    console.log("Featured products seeded successfully");

    // Insert banners
    await Banner.insertMany(banners);
    console.log("Banners seeded successfully");

    // Insert stats
    await Stats.insertMany(stats);
    console.log("Stats seeded successfully");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();

const featuredProducts = [
  {
    title: "Modern Sofa Set",
    description: "Luxurious 3-seater sofa with premium fabric",
    image: "/img/sofa-featured.png",
    price: 45000,
    originalPrice: 55000,
    discount: 18,
    category: "Sofa",
    order: 1,
  },
  {
    title: "Wooden Dining Table",
    description: "Elegant 6-seater dining table",
    image: "/img/table-featured.png",
    price: 35000,
    originalPrice: 42000,
    discount: 17,
    category: "Table",
    order: 2,
  },
  {
    title: "King Size Bed",
    description: "Comfortable king size bed with storage",
    image: "/img/bed-featured.png",
    price: 55000,
    originalPrice: 65000,
    discount: 15,
    category: "Bed",
    order: 3,
  },
  {
    title: "Office Chair",
    description: "Ergonomic office chair with lumbar support",
    image: "/img/chair-featured.png",
    price: 12000,
    originalPrice: 15000,
    discount: 20,
    category: "Chair",
    order: 4,
  },
];

const banners = [
  {
    title: "Welcome to Our Furniture Store",
    subtitle: "Quality Furniture for Your Home",
    description:
      "Discover our exclusive collection of modern and traditional furniture",
    image: "/img/banner-hero.jpg",
    buttonText: "Shop Now",
    buttonLink: "/products",
    position: "hero",
    order: 1,
  },
  {
    title: "Summer Sale",
    subtitle: "Up to 50% Off",
    description: "Limited time offer on selected items",
    image: "/img/banner-sale.jpg",
    buttonText: "View Deals",
    buttonLink: "/products",
    position: "secondary",
    order: 2,
  },
];

const stats = [
  {
    label: "Happy Customers",
    value: 1000,
    suffix: "+",
    order: 1,
  },
  {
    label: "Products Available",
    value: 500,
    suffix: "+",
    order: 2,
  },
  {
    label: "Categories",
    value: 50,
    suffix: "+",
    order: 3,
  },
  {
    label: "5-Star Reviews",
    value: 100,
    suffix: "%",
    order: 4,
  },
];
