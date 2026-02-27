import express from "express";
import rootRoutes from "./rootRoutes.js";
import { isMongoReady } from "../db/mongoManager.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.get("/ready", (req, res) => {
  if (!isMongoReady()) {
    return res.status(503).json({
      status: "degraded",
      mongo: "down",
    });
  }

  return res.status(200).json({
    status: "ok",
    mongo: "up",
  });
});

router.use("/root", rootRoutes);

export default router;