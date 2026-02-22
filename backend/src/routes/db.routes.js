import { Router } from "express";
import { requireRootSession } from "../middleware/rootAuth.middleware.js";
import { status, connect, disconnect } from "../controllers/db.controller.js";

const router = Router();

router.use(requireRootSession);

router.get("/status", status);
router.post("/connect", connect);
router.post("/disconnect", disconnect);

export default router;