import {
  validateRootKey,
  generateJWT,
  verifyJWT,
  isBlocked,
  getSecondsUntilUnblock,
  recordFailedAttempt,
  resetFailedAttempts,
  CONFIG
} from "../services/rootAuthService.js";
import logger from "../logger.js";

const COOKIE_NAME = "root_session";

/**
 * Extrae la IP del cliente considerando posibles proxies.
 */
function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    const firstIp = Array.isArray(xff) ? xff[0] : xff.split(",")[0];
    return firstIp.trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
}

/**
 * Genera el objeto de configuración para las cookies de Express.
 */
function getCookieOptions(maxAgeSeconds) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds * 1000, // Express requiere milisegundos
  };
}

/**
 * Gestiona la respuesta en caso de bloqueo por fuerza bruta.
 */
function handleLockout(res, ip) {
  const seconds = getSecondsUntilUnblock(ip);
  res.setHeader("Retry-After", seconds);
  return res.status(429).json({ error: "Too many attempts. Try again later." });
}

export function checkRootSession(req, res) {
  const token = req.cookies[COOKIE_NAME];

  if (token && verifyJWT(token)) {
    return res.status(200).json({ session: "valid" });
  }

  return res.status(401).json({ session: "invalid" });
}

export function authRoot(req, res) {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "Missing key" });

  const ip = getClientIp(req);

  if (isBlocked(ip)) {
    return handleLockout(res, ip);
  }

  if (!validateRootKey(key)) {
    recordFailedAttempt(ip);
    if (isBlocked(ip)) {
      return handleLockout(res, ip);
    }
    return res.status(401).json({ error: "Invalid key" });
  }

  // Autenticación exitosa
  resetFailedAttempts(ip);
  const token = generateJWT();
  
  // Uso de res.cookie de Express
  res.cookie(COOKIE_NAME, token, getCookieOptions(CONFIG.JWT_EXPIRATION));
  
  logger.success(`Root authenticated successfully from IP ${ip}.`);
  return res.status(200).json({ session: "valid" });
}

export function logoutRoot(req, res) {
  // Uso de res.clearCookie de Express
  res.clearCookie(COOKIE_NAME, getCookieOptions(0));
  return res.status(200).json({ session: "invalid" });
}