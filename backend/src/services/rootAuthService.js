import jwt from "jsonwebtoken";
import { ROOT_KEY, JWT_ROOT_SECRET } from "../env.js";
import logger from "../logger.js";

const JWT_EXPIRATION = 5 * 60; // 5 minutos en segundos
const LOCKOUT_DURATION = 20 * 60 * 1000; // 20 minutos en ms
const MAX_FAILED_ATTEMPTS = 3;

// Estado global in-memory
let failedAttempts = 0;
let blockedUntil = null;

export function validateRootKey(key) {
  return key === ROOT_KEY;
}

export function generateJWT() {
  const payload = { root: true };
  const token = jwt.sign(payload, JWT_ROOT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
  return token;
}

export function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, JWT_ROOT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

// Verificar si está bloqueado
export function isBlocked() {
  if (blockedUntil === null) {
    return false;
  }

  const now = Date.now();
  if (now < blockedUntil) {
    return true; // Aún bloqueado
  }

  // El bloqueo expiró, resetear
  failedAttempts = 0;
  blockedUntil = null;
  return false;
}

// Obtener segundos restantes de bloqueo
export function getSecondsUntilUnblock() {
  if (blockedUntil === null) {
    return 0;
  }

  const now = Date.now();
  const remaining = blockedUntil - now;

  if (remaining <= 0) {
    return 0;
  }

  return Math.ceil(remaining / 1000);
}

// Registrar intento fallido
export function recordFailedAttempt() {
  failedAttempts += 1;

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    blockedUntil = Date.now() + LOCKOUT_DURATION;
    logger.warning("More than 3 failed root authentication attempts have been detected.");
  }
}

// Resetear intentos (login exitoso)
export function resetFailedAttempts() {
  failedAttempts = 0;
  blockedUntil = null;
}
