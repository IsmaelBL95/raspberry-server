import mongoose from "mongoose";
import logger from "../utils/logger.js";

let isAttached = false;

function stateName(readyState) {
  switch (readyState) {
    case 0: return "disconnected";
    case 1: return "connected";
    case 2: return "connecting";
    case 3: return "disconnecting";
    default: return "unknown";
  }
}

export function attachMongoMonitor() {
  if (isAttached) return;
  isAttached = true;

  const conn = mongoose.connection;

  conn.on("connecting", () => {
    logger.info("MongoDB state: connecting.");
  });

  conn.on("connected", () => {
    logger.success("MongoDB connected successfully.");
  });

  // Driver reconnected (según versión/driver puede disparar 'reconnected')
  conn.on("reconnected", () => {
    logger.success("MongoDB reconnected.");
  });

  conn.on("disconnected", () => {
    logger.warning("MongoDB disconnected.");
  });

  conn.on("close", () => {
    logger.warning("MongoDB connection closed.");
  });

  conn.on("error", (err) => {
    logger.error(`MongoDB error: ${err?.message || String(err)}`);
  });

  // Log inicial (útil al arrancar)
  logger.info(`MongoDB initial state: ${stateName(conn.readyState)}.`);
}