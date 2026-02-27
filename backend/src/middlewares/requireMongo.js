import { isMongoReady } from "../db/mongoManager.js";

export function requireMongo(req, res, next) {
  if (!isMongoReady()) {
    return res.status(503).json({ error: "DB unavailable" });
  }
  return next();
}