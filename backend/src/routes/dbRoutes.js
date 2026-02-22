import express from "express";
import { validateRootToken } from "../middlewares/rootAuth.js";
import {
  getDbStatusHandler,
  connectDbHandler,
  disconnectDbHandler,
} from "../controllers/dbController.js";

const router = express.Router();

// All DB endpoints protected by root session (cookie JWT)
router.get("/status", validateRootToken, getDbStatusHandler);
router.post("/connect", validateRootToken, connectDbHandler);
router.post("/disconnect", validateRootToken, disconnectDbHandler);

export default router;
