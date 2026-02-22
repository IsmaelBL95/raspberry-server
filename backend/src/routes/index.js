import { Router } from "express";
import rootRoutes from "./root.routes.js";
import dbRoutes from "./db.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/root", rootRoutes);
router.use("/db", dbRoutes);

export default router;