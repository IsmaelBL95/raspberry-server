import mongoose from "mongoose";
import logger from "../logger.js";
import { MONGO_URI } from "../env.js";

let ready = false;
let started = false;

// evita reintentos paralelos
let loopPromise = null;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(ms, maxJitterMs = 250) {
  return ms + Math.floor(Math.random() * maxJitterMs);
}

export function isMongoReady() {
  return ready;
}

/**
 * Inicia:
 * - listeners de estado (connected/disconnected)
 * - bucle de conexión con backoff exponencial (con tope)
 *
 * Política:
 * - reintentos "rápidos" con backoff hasta X intentos
 * - si no conecta, entra en "degraded" (ready=false) y reintenta cada 3 minutos indefinidamente
 */
export function startMongoManager({
  fastMaxAttempts = 8,
  baseDelayMs = 500,
  maxDelayMs = 30_000,
  degradedIntervalMs = 180_000, // 3 minutos
} = {}) {
  if (started) return;
  started = true;

  if (!MONGO_URI) {
    logger.error("MONGO_URI is not set. Mongo will stay in degraded mode.");
    ready = false;
    // aun así: reintentos indefinidos cada 3 min por si config llega por env en runtime (poco común)
  }

  mongoose.connection.on("connected", () => {
    if (!ready) logger.success("Mongo connected.");
    ready = true;
  });

  mongoose.connection.on("disconnected", () => {
    if (ready) logger.error("Mongo down.");
    ready = false;
  });

  mongoose.connection.on("error", (err) => {
    // no siempre implica disconnect, pero es señal de problema
    logger.warning(`Mongo error: ${err?.message || err}`);
  });

  loopPromise = connectionLoop({ fastMaxAttempts, baseDelayMs, maxDelayMs, degradedIntervalMs });
}

async function tryConnectOnce() {
  logger.info("Attempting Mongo connection...");
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 5_000,
  });
}

async function connectionLoop({ fastMaxAttempts, baseDelayMs, maxDelayMs, degradedIntervalMs }) {
  // Fase rápida: backoff exponencial con tope
  for (let attempt = 1; attempt <= fastMaxAttempts; attempt++) {
    try {
      await tryConnectOnce();
      return; // listeners ya gestionan ready=true
    } catch (err) {
      ready = false;
      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      logger.warning("Mongo connection failed. Retrying Mongo connection...");
      await sleep(jitter(delay));
    }
  }

  // Entramos en degradado "de forma explícita"
  logger.error("Mongo connection failed. Entering degraded mode.");

  // Fase degradada: reintento fijo cada 3 min indefinido
  while (true) {
    try {
      await tryConnectOnce();
      return;
    } catch (err) {
      ready = false;
      logger.warning("Mongo connection failed. Retrying Mongo connection...");
      await sleep(jitter(degradedIntervalMs, 1000));
    }
  }
}

export async function stopMongoManager() {
  // Detener el bucle no es trivial si está en sleep: en este diseño, simplemente desconectamos.
  // El proceso normalmente muere tras SIGINT/SIGTERM, así que es suficiente.
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
}