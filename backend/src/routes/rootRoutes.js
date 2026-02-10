import express from "express";
import { checkRootSession, authRoot } from "../controllers/rootController.js";

const router = express.Router();

// GET /root/session
router.get("/session", checkRootSession);

// POST /root/auth
router.post("/auth", authRoot);

export default router;
