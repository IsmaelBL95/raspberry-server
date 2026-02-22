import { getStatus, connectDb, disconnectDb } from "../services/dbService.js";
import logger from "../logger.js";

export function getDbStatusHandler(req, res) {
  try {
    const status = getStatus();
    return res.status(200).json(status);
  } catch (err) {
    logger.error(`Failed to get DB status: ${err.message}`);
    return res.status(500).json({ error: "Could not get DB status" });
  }
}

export async function connectDbHandler(req, res) {
  try {
    const status = getStatus();
    if (status.connected) {
      return res.status(200).json({ message: "Already connected", ...status });
    }

    logger.info(`DB connect requested by root (${req.root?.jti ?? "unknown"})`);
    await connectDb();
    const newStatus = getStatus();
    return res.status(200).json({ message: "Connected", ...newStatus });
  } catch (err) {
    logger.error(`DB connect failed: ${err.message}`);
    return res.status(500).json({ error: err.message || "Connection failed" });
  }
}

export async function disconnectDbHandler(req, res) {
  try {
    const status = getStatus();
    if (!status.connected) {
      return res.status(200).json({ message: "Already disconnected", ...status });
    }

    logger.info(`DB disconnect requested by root (${req.root?.jti ?? "unknown"})`);
    await disconnectDb();
    const newStatus = getStatus();
    return res.status(200).json({ message: "Disconnected", ...newStatus });
  } catch (err) {
    logger.error(`DB disconnect failed: ${err.message}`);
    return res.status(500).json({ error: err.message || "Disconnection failed" });
  }
}
