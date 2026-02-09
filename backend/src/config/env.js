// src/config/env.js
// Configuración centralizada

export function loadConfig() {
  const serviceName = process.env.SERVICE_NAME || "express-service";
  const host = process.env.HOST || "0.0.0.0";

  const portRaw = process.env.PORT || "5000";
  const port = Number(portRaw);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`PORT inválido: ${portRaw}`);
  }

  return {
    serviceName,
    host,
    port,
    env: process.env.NODE_ENV || "development",
  };
}