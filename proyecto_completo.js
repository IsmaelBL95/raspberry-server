// FILE: ./frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "^/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
-e 

// FILE: ./backend/src/index.js
import "dotenv/config";
import { main } from "./main.js";

main();-e 

// FILE: ./backend/src/routes/index.js
import { Router } from "express";
import rootRoutes from "./root.routes.js";
import dbRoutes from "./db.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/root", rootRoutes);
router.use("/db", dbRoutes);

export default router;-e 

// FILE: ./backend/src/routes/root.routes.js
import { Router } from "express";
import { authRoot, checkRootSession } from "../controllers/root.controller.js";

const router = Router();

router.get("/session", checkRootSession);
router.post("/auth", authRoot);

export default router;-e 

// FILE: ./backend/src/routes/db.routes.js
import { Router } from "express";
import { requireRootSession } from "../middleware/rootAuth.middleware.js";
import { status, connect, disconnect } from "../controllers/db.controller.js";

const router = Router();

router.use(requireRootSession);

router.get("/status", status);
router.post("/connect", connect);
router.post("/disconnect", disconnect);

export default router;-e 

// FILE: ./backend/src/app.js
import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Cookie parsing (req.cookies)
  app.use(cookieParser());

  // Mount all routes
  app.use(routes);

  return app;
}-e 

// FILE: ./backend/src/controllers/db.controller.js
import { getStatus, connectDB, disconnectDB } from "../services/db.service.js";

export function status(req, res) {
  try {
    return res.status(200).json(getStatus());
  } catch {
    return res.status(500).json({ error: "Could not get DB status" });
  }
}

export async function connect(req, res) {
  try {
    const payload = await connectDB();
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export async function disconnect(req, res) {
  try {
    const payload = await disconnectDB();
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}-e 

// FILE: ./backend/src/controllers/root.controller.js
import {
  validateRootKey,
  generateJWT,
  verifyJWT,
  isBlocked,
  getSecondsUntilUnblock,
  recordFailedAttempt,
  resetFailedAttempts,
  CONFIG,
} from "../services/rootAuth.service.js";
import { env } from "../config/env.js";
import logger from "../utils/logger.js";

const COOKIE_NAME = "root_session";

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    const firstIp = Array.isArray(xff) ? xff[0] : xff.split(",")[0];
    return firstIp.trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: CONFIG.JWT_EXPIRATION * 1000, // Express espera ms
  };
}

function handleLockout(res, ip) {
  const seconds = getSecondsUntilUnblock(ip);
  res.setHeader("Retry-After", seconds);
  return res.status(429).json({ error: "Too many attempts. Try again later." });
}

export function checkRootSession(req, res) {
  const token = req.cookies?.[COOKIE_NAME];

  if (token && verifyJWT(token)) {
    return res.status(200).json({ session: "valid" });
  }

  return res.status(401).json({ session: "invalid" });
}

export function authRoot(req, res) {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }

  const ip = getClientIp(req);

  if (isBlocked(ip)) {
    return handleLockout(res, ip);
  }

  if (!validateRootKey(key)) {
    recordFailedAttempt(ip);

    // si el intento provoca bloqueo inmediato
    if (isBlocked(ip)) {
      return handleLockout(res, ip);
    }

    return res.status(401).json({ error: "Invalid key" });
  }

  // éxito
  resetFailedAttempts(ip);
  const token = generateJWT();

  res.cookie(COOKIE_NAME, token, getCookieOptions());

  logger.success(`Root session correctly authenticated (ip=${ip}).`);

  return res.status(200).json({ session: "valid" });
}-e 

// FILE: ./backend/src/main.js
import { startServer, closeServer } from "./server.js";
import { env } from "./config/env.js";
import logger from "./utils/logger.js";
import { attachMongoMonitor } from "./services/mongoMonitor.js";

export async function main() {
  attachMongoMonitor();
  logger.info("Booting server...");

  const server = await startServer(env.PORT);

  const shutdown = async (signal) => {
    logger.warning(`Received ${signal}, shutting down...`);
    await closeServer(server);
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}-e 

// FILE: ./backend/src/server.js
import http from "node:http";
import { createApp } from "./app.js";
import logger from "./utils/logger.js";

export async function startServer(port) {
  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(port, resolve));
  logger.success(`Server listening on port ${port}.`);

  return server;
}

export async function closeServer(server) {
  if (!server) return;

  await new Promise((resolve) => server.close(resolve));
  logger.info("Server closed.");
}-e 

// FILE: ./backend/src/services/rootAuth.service.js
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";

/**
 * Config equivalente al backend original.
 */
export const CONFIG = Object.freeze({
  JWT_EXPIRATION: 5 * 60, // segundos (5 min)
  LOCKOUT_DURATION: 20 * 60 * 1000, // ms (20 min)
  MAX_FAILED_ATTEMPTS: 3,

  MAX_IP_ENTRIES: 2000,
  ENTRY_TTL: 6 * 60 * 60 * 1000, // ms (6h)

  JWT_ISSUER: "rasp-server",
  JWT_AUDIENCE: "root",
});

const ROOT_KEY_BUF = Buffer.from(typeof env.ROOT_KEY === "string" ? env.ROOT_KEY : "");

// LRU: Map mantiene orden de inserción; reinserción para marcar reciente
const stateByIp = new Map(); // ip -> { failedAttempts, blockedUntil, lastSeen }

function nowMs() {
  return Date.now();
}

function getState(ip) {
  const key = String(ip || "unknown");
  let st = stateByIp.get(key);
  const now = nowMs();

  if (st) {
    stateByIp.delete(key);

    // TTL
    if (st.lastSeen < now - CONFIG.ENTRY_TTL) {
      st = { failedAttempts: 0, blockedUntil: null, lastSeen: now };
    } else {
      st.lastSeen = now;
    }

    stateByIp.set(key, st);
    return st;
  }

  // Capacidad
  if (stateByIp.size >= CONFIG.MAX_IP_ENTRIES) {
    const oldestKey = stateByIp.keys().next().value;
    stateByIp.delete(oldestKey);
  }

  const created = { failedAttempts: 0, blockedUntil: null, lastSeen: now };
  stateByIp.set(key, created);
  return created;
}

export function validateRootKey(key) {
  if (typeof key !== "string" || ROOT_KEY_BUF.length === 0) return false;

  const keyBuf = Buffer.from(key);

  if (keyBuf.length !== ROOT_KEY_BUF.length) return false;

  return crypto.timingSafeEqual(keyBuf, ROOT_KEY_BUF);
}

export function generateJWT() {
  return jwt.sign({ root: true }, env.JWT_ROOT_SECRET, {
    expiresIn: CONFIG.JWT_EXPIRATION,
    issuer: CONFIG.JWT_ISSUER,
    audience: CONFIG.JWT_AUDIENCE,
    jwtid: crypto.randomUUID(),
  });
}

export function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_ROOT_SECRET, {
      issuer: CONFIG.JWT_ISSUER,
      audience: CONFIG.JWT_AUDIENCE,
    });

    return decoded && decoded.root === true ? decoded : null;
  } catch {
    return null;
  }
}

export function isBlocked(ip) {
  const st = getState(ip);

  if (st.blockedUntil === null) return false;

  if (nowMs() < st.blockedUntil) return true;

  // bloqueo expirado
  st.blockedUntil = null;
  st.failedAttempts = 0;
  return false;
}

export function getSecondsUntilUnblock(ip) {
  const key = String(ip || "unknown");
  const st = stateByIp.get(key); // lectura sin tocar LRU
  if (!st || st.blockedUntil === null) return 0;

  const remaining = Math.ceil((st.blockedUntil - nowMs()) / 1000);
  return remaining > 0 ? remaining : 0;
}

export function recordFailedAttempt(ip) {
  const st = getState(ip);
  st.failedAttempts += 1;

  if (st.failedAttempts >= CONFIG.MAX_FAILED_ATTEMPTS) {
    st.blockedUntil = nowMs() + CONFIG.LOCKOUT_DURATION;
  }
}

export function resetFailedAttempts(ip) {
  const st = getState(ip);
  st.failedAttempts = 0;
  st.blockedUntil = null;
}-e 

// FILE: ./backend/src/services/db.service.js
import mongoose from "mongoose";
import { env } from "../config/env.js";
import logger from "../utils/logger.js";

function mapState(readyState) {
  switch (readyState) {
    case 0: return "disconnected";
    case 1: return "connected";
    case 2: return "connecting";
    case 3: return "disconnecting";
    default: return "unknown";
  }
}

export function getStatus() {
  const readyState = mongoose.connection.readyState;
  return {
    readyState,
    state: mapState(readyState),
    connected: readyState === 1,
  };
}

export async function connectDB() {
  if (getStatus().connected) {
    return { message: "Already connected", ...getStatus() };
  }

  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  logger.info("Attempting to connect to MongoDB...");

  try {
    // Opciones para:
    // - fallar rápido si Mongo no está disponible
    // - detectar caídas antes (heartbeat más frecuente)
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,  // cuánto esperar para encontrar un servidor
      connectTimeoutMS: 4000,          // timeout del socket al conectar
      heartbeatFrequencyMS: 2000,      // detección más rápida de caída (default suele ser 10s)
    });

    // El "connected" se loguea por el monitor también, pero lo dejamos por claridad:
    logger.success("MongoDB connected successfully.");

    return { message: "Connected", ...getStatus() };
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err?.message || String(err)}`);
    throw err;
  }
}

export async function disconnectDB() {
  if (!getStatus().connected) {
    return { message: "Already disconnected", ...getStatus() };
  }

  logger.info("Disconnecting from MongoDB...");

  try {
    await mongoose.disconnect();
    logger.success("MongoDB disconnected.");
    return { message: "Disconnected", ...getStatus() };
  } catch (err) {
    logger.error(`MongoDB disconnect failed: ${err?.message || String(err)}`);
    throw err;
  }
}-e 

// FILE: ./backend/src/services/mongoMonitor.js
import mongoose from "mongoose";
import logger from "../utils/logger.js";

let isAttached = false;

function stateName(readyState) {
  switch (readyState) {
    case 0: return "disconnected";
    case 1: return "connected";
    case 2: return "connecting";
    case 3: return "disconnecting";
    default: return "unknown";
  }
}

export function attachMongoMonitor() {
  if (isAttached) return;
  isAttached = true;

  const conn = mongoose.connection;

  conn.on("connecting", () => {
    logger.info("MongoDB state: connecting.");
  });

  conn.on("connected", () => {
    logger.success("MongoDB connected successfully.");
  });

  // Driver reconnected (según versión/driver puede disparar 'reconnected')
  conn.on("reconnected", () => {
    logger.success("MongoDB reconnected.");
  });

  conn.on("disconnected", () => {
    logger.warning("MongoDB disconnected.");
  });

  conn.on("close", () => {
    logger.warning("MongoDB connection closed.");
  });

  conn.on("error", (err) => {
    logger.error(`MongoDB error: ${err?.message || String(err)}`);
  });

  // Log inicial (útil al arrancar)
  logger.info(`MongoDB initial state: ${stateName(conn.readyState)}.`);
}-e 

// FILE: ./backend/src/utils/logger.js
const logger = {
  info: (message) => console.log(`🔵 ${message}`),
  success: (message) => console.log(`🟢 ${message}`),
  warning: (message) => console.log(`🟠 ${message}`),
  error: (message) => console.log(`🔴 ${message}`),
  fatal: (message) => console.log(`⚫ ${message}`),
  debug: (message) => console.log(`⚪ ${message}`),
};

export default logger;-e 

// FILE: ./backend/src/config/env.js
function getEnv(name, fallback = undefined) {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  return value;
}

export const env = Object.freeze({
  PORT: Number(getEnv("PORT", "3000")),
  NODE_ENV: getEnv("NODE_ENV", "development"),

  ROOT_KEY: getEnv("ROOT_KEY", "0123456789abcdef"),
  JWT_ROOT_SECRET: getEnv("JWT_ROOT_SECRET", "my-secret-key"),

  MONGODB_URI: getEnv("MONGODB_URI", "")
});-e 

// FILE: ./backend/src/middleware/rootAuth.middleware.js
import { verifyJWT } from "../services/rootAuth.service.js";

const COOKIE_NAME = "root_session";

export function requireRootSession(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ session: "invalid" });
  }

  const decoded = verifyJWT(token);

  if (!decoded) {
    return res.status(401).json({ session: "invalid" });
  }

  // Opcional: dejar información disponible para futuros usos
  req.isRoot = true;
  req.root = {
    jti: decoded.jti,
    iat: decoded.iat,
    exp: decoded.exp,
  };

  next();
}-e 

// FILE: ./proyecto_completo.js
-e 

