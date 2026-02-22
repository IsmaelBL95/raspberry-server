import { Router } from "express";
import { authRoot, checkRootSession } from "../controllers/root.controller.js";

const router = Router();

router.get("/session", checkRootSession);
router.post("/auth", authRoot);

export default router;