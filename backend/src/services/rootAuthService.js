import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ROOT_KEY, JWT_ROOT_SECRET } from "../env.js";
import logger from "../logger.js";

// Constantes centralizadas
export const CONFIG = {
  JWT_EXPIRATION: 5 * 60, // 5 minutos
  LOCKOUT_DURATION: 20 * 60 * 1000, // 20 minutos
  MAX_FAILED_ATTEMPTS: 3,
  MAX_IP_ENTRIES: 2000,
  ENTRY_TTL: 6 * 60 * 60 * 1000, // 6 horas
  JWT_ISSUER: "rasp-server",
  JWT_AUDIENCE: "root"
};

// Pre-cálculo del Buffer de la clave raíz para evitar coste en runtime y asegurar consistencia
const ROOT_KEY_BUF = Buffer.from(typeof ROOT_KEY === "string" ? ROOT_KEY : "");

// Estado: Map mantiene el orden de inserción.
// Las claves se reinsertan al usarse para mantener las más recientes al final.
const stateByIp = new Map();

function nowMs() {
  return Date.now();
}

/**
 * Obtiene el estado de una IP y gestiona la caché LRU (O(1)).
 */
function getState(ip) {
  let st = stateByIp.get(ip);
  const now = nowMs();

  // Si existe, lo borramos y reinsertamos para marcarlo como "reciente" (LRU)
  if (st) {
    stateByIp.delete(ip);
    // Verificar TTL
    if (st.lastSeen < now - CONFIG.ENTRY_TTL) {
      st = { failedAttempts: 0, blockedUntil: null, lastSeen: now };
    } else {
      st.lastSeen = now;
    }
    stateByIp.set(ip, st);
    return st;
  }

  // Si no existe, comprobamos límite de capacidad
  if (stateByIp.size >= CONFIG.MAX_IP_ENTRIES) {
    // El iterador de keys() devuelve primero el elemento más antiguo insertado
    const oldestKey = stateByIp.keys().next().value;
    stateByIp.delete(oldestKey);
  }

  // Crear nuevo estado
  const created = { failedAttempts: 0, blockedUntil: null, lastSeen: now };
  stateByIp.set(ip, created);
  return created;
}

export function validateRootKey(key) {
  if (typeof key !== "string" || ROOT_KEY_BUF.length === 0) return false;
  
  const keyBuf = Buffer.from(key);
  
  // timingSafeEqual lanza error si las longitudes no coinciden
  if (keyBuf.length !== ROOT_KEY_BUF.length) return false;
  
  return crypto.timingSafeEqual(keyBuf, ROOT_KEY_BUF);
}

export function generateJWT() {
  return jwt.sign({ root: true }, JWT_ROOT_SECRET, {
    expiresIn: CONFIG.JWT_EXPIRATION,
    issuer: CONFIG.JWT_ISSUER,
    audience: CONFIG.JWT_AUDIENCE,
    jwtid: crypto.randomUUID(),
  });
}

export function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, JWT_ROOT_SECRET, {
      issuer: CONFIG.JWT_ISSUER,
      audience: CONFIG.JWT_AUDIENCE,
    });
    // Verificación estricta de tipo y propiedad
    return (decoded && decoded.root === true) ? decoded : null;
  } catch {
    return null;
  }
}

export function isBlocked(ip) {
  const st = getState(ip);
  if (st.blockedUntil === null) return false;

  if (nowMs() < st.blockedUntil) return true;

  // Bloqueo expirado
  st.blockedUntil = null;
  st.failedAttempts = 0;
  return false;
}

export function getSecondsUntilUnblock(ip) {
  const st = stateByIp.get(ip); // Acceso directo sin alterar orden LRU para lectura simple
  if (!st || st.blockedUntil === null) return 0;
  
  const remaining = Math.ceil((st.blockedUntil - nowMs()) / 1000);
  return remaining > 0 ? remaining : 0;
}

export function recordFailedAttempt(ip) {
  const st = getState(ip); // Actualiza LRU
  st.failedAttempts += 1;

  if (st.failedAttempts >= CONFIG.MAX_FAILED_ATTEMPTS) {
    st.blockedUntil = nowMs() + CONFIG.LOCKOUT_DURATION;
    logger.warning(`Security Alert: Blocked IP ${ip} after ${st.failedAttempts} failed root attempts.`);
  }
}

export function resetFailedAttempts(ip) {
  const st = getState(ip); // Actualiza LRU
  st.failedAttempts = 0;
  st.blockedUntil = null;
}