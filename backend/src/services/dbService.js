import mongoose from "mongoose";
import logger from "../logger.js";

const STATE_MAP = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export function getStatus() {
  const readyState = mongoose.connection.readyState;
  const state = STATE_MAP[readyState] ?? "unknown";
  const connected = readyState === 1;
  return { readyState, state, connected };
}

export async function connectDb() {
  const status = getStatus();
  if (status.connected) {
    return getStatus();
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const err = new Error("MONGODB_URI is not configured");
    logger.error(err.message);
    throw err;
  }

  try {
    logger.info("Attempting to connect to MongoDB...");
    await mongoose.connect(uri);
    logger.success("MongoDB connected.");
    return getStatus();
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw err;
  }
}

export async function disconnectDb() {
  const status = getStatus();
  if (!status.connected) {
    return getStatus();
  }

  try {
    logger.info("Disconnecting from MongoDB...");
    await mongoose.disconnect();
    logger.success("MongoDB disconnected.");
    return getStatus();
  } catch (err) {
    logger.error(`MongoDB disconnection error: ${err.message}`);
    throw err;
  }
}
