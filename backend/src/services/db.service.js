import mongoose from "mongoose";
import { env } from "../config/env.js";
import logger from "../utils/logger.js";

function mapState(readyState) {
  switch (readyState) {
    case 0: return "disconnected";
    case 1: return "connected";
    case 2: return "connecting";
    case 3: return "disconnecting";
    default: return "unknown";
  }
}

export function getStatus() {
  const readyState = mongoose.connection.readyState;
  return {
    readyState,
    state: mapState(readyState),
    connected: readyState === 1,
  };
}

export async function connectDB() {
  if (getStatus().connected) {
    return { message: "Already connected", ...getStatus() };
  }

  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  logger.info("Attempting to connect to MongoDB...");

  try {
    // Opciones para:
    // - fallar rápido si Mongo no está disponible
    // - detectar caídas antes (heartbeat más frecuente)
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,  // cuánto esperar para encontrar un servidor
      connectTimeoutMS: 4000,          // timeout del socket al conectar
      heartbeatFrequencyMS: 2000,      // detección más rápida de caída (default suele ser 10s)
    });

    // El "connected" se loguea por el monitor también, pero lo dejamos por claridad:
    logger.success("MongoDB connected successfully.");

    return { message: "Connected", ...getStatus() };
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err?.message || String(err)}`);
    throw err;
  }
}

export async function disconnectDB() {
  if (!getStatus().connected) {
    return { message: "Already disconnected", ...getStatus() };
  }

  logger.info("Disconnecting from MongoDB...");

  try {
    await mongoose.disconnect();
    logger.success("MongoDB disconnected.");
    return { message: "Disconnected", ...getStatus() };
  } catch (err) {
    logger.error(`MongoDB disconnect failed: ${err?.message || String(err)}`);
    throw err;
  }
}