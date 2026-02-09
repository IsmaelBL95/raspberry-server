// src/routes/health.js
// Health checks para orquestador

import express from "express";

export function createHealthRouter({ deps }) {
  const router = express.Router();

  router.get("/live", (req, res) => {
    res.json({ ok: true });
  });

  router.get("/ready", (req, res) => {
    const ready = Boolean(deps?.readiness?.ready);
    res.status(ready ? 200 : 503).json({ ready });
  });

  return router;
}