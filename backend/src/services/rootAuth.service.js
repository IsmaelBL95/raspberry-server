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
}