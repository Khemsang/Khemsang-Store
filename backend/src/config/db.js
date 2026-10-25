import mongoose from "mongoose";
import logger from "./logger.js";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
    family: 4,
  };

  await mongoose.connect(process.env.MONGO_URI, options);
  isConnected = true;

  const { host, name } = mongoose.connection;
  logger.info(`MongoDB connected: ${host} / ${name}`);

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error", { message: err.message });
    isConnected = false;
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
    isConnected = false;
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
    isConnected = true;
  });
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.connection.close();
  isConnected = false;
  logger.info("MongoDB connection closed");
};
