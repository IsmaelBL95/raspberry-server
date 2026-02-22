import express from "express";
import rootRoutes from "./rootRoutes.js";
import dbRoutes from "./dbRoutes.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Mount root-related routes under /root
router.use("/root", rootRoutes);

// Mount DB management endpoints under /db
router.use("/db", dbRoutes);

export default router;
