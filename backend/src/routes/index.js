// src/routes/index.js
import express from "express";
import rootRoutes from "./rootRoutes.js";
import identityRoutes from "./identityRoutes.js";
import thankRoutes from "./thankRoutes.js";
import { isMongoReady } from "../db/mongoManager.js";

const router = express.Router();

// Endpoint de salud simple que indica que el proceso esta corriendo
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Endpoint de readiness que indica si la base de datos esta lista
router.get("/ready", (_req, res) => {
  if (!isMongoReady()) {
    return res.status(503).json({ status: "degraded", mongo: "down" });
  }

  return res.status(200).json({ status: "ok", mongo: "up" });
});

// Prefijo para rutas de autenticacion raiz
router.use("/root", rootRoutes);

// Prefijo para rutas de identidades
router.use("/identities", identityRoutes);

// Prefijo para rutas de agradecimientos
router.use("/thanks", thankRoutes);

export default router;
