import mongoose from "mongoose";
import logger from "../utils/logger.js";
import config from "../config/index.js";

let ready = false;
let started = false;
let loopPromise = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(ms, maxJitterMs = 250) {
  return ms + Math.floor(Math.random() * maxJitterMs);
}

/**
 * Devuelve un booleano indicando si la base de datos está conectada.
 */
export function isMongoReady() {
  return ready;
}

/**
 * Inicia los listeners y el bucle de conexión a MongoDB con backoff.
 * Permite configurar el número de intentos rápidos y los intervalos.
 */
export function startMongoManager({
  fastMaxAttempts = 8,
  baseDelayMs = 500,
  maxDelayMs = 30_000,
  degradedIntervalMs = 180_000,
} = {}) {
  if (started) return;
  started = true;
  if (!config.mongoUri) {
    logger.error(
      "MONGO_URI is not set. Mongo will stay in degraded mode."
    );
    ready = false;
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
    logger.warning(`Mongo error: ${err?.message || err}`);
  });
  loopPromise = connectionLoop({ fastMaxAttempts, baseDelayMs, maxDelayMs, degradedIntervalMs });
}

async function tryConnectOnce() {
  logger.info("Attempting Mongo connection...");
  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
}

async function connectionLoop({ fastMaxAttempts, baseDelayMs, maxDelayMs, degradedIntervalMs }) {
  for (let attempt = 1; attempt <= fastMaxAttempts; attempt++) {
    try {
      await tryConnectOnce();
      return;
    } catch (err) {
      ready = false;
      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      logger.warning(
        "Mongo connection failed. Retrying Mongo connection..."
      );
      await sleep(jitter(delay));
    }
  }
  logger.error("Mongo connection failed. Entering degraded mode.");
  while (true) {
    try {
      await tryConnectOnce();
      return;
    } catch (err) {
      ready = false;
      logger.warning(
        "Mongo connection failed. Retrying Mongo connection..."
      );
      await sleep(jitter(degradedIntervalMs, 1000));
    }
  }
}

export async function stopMongoManager() {
  try {
    await mongoose.disconnect();
  } catch (_err) {
    // Ignoramos errores de desconexión
  }
}