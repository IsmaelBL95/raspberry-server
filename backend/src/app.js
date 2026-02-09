// src/app.js
// Construye la app Express. No gestiona ciclo de vida.

import express from "express";
import { createHealthRouter } from "./routes/health.js";

export function createApp({ config, deps }) {
  const app = express();

  app.use(express.json());

  app.use("/health", createHealthRouter({ deps }));

  app.get("/", (req, res) => {
    res.json({ ok: true, service: config.serviceName });
  });

  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("[http] error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}