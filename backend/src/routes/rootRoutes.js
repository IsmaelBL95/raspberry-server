import express from "express";
import { checkRootSession } from "../controllers/rootController.js";

const router = express.Router();

// GET /root/session
router.get("/session", checkRootSession);

export default router;
