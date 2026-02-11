import cookie from "cookie";
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

function getClientIp(req) {
  // Verificación defensiva básica del header
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    const firstIp = Array.isArray(xff) ? xff[0] : xff.split(",")[0];
    return firstIp.trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function getCookieOptions(maxAge) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: maxAge, // Segundos
  };
}

// Handler auxiliar para respuestas de bloqueo
function handleLockout(res, ip) {
  const seconds = getSecondsUntilUnblock(ip);
  res.setHeader("Retry-After", seconds);
  return res.status(429).json({ error: "Too many attempts. Try again later." });
}

export function checkRootSession(req, res) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];

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
    // Verificamos si este intento provocó el bloqueo inmediato
    if (isBlocked(ip)) {
      return handleLockout(res, ip);
    }
    return res.status(401).json({ error: "Invalid key" });
  }

  // Éxito
  resetFailedAttempts(ip);
  const token = generateJWT();
  
  res.setHeader("Set-Cookie", cookie.serialize(COOKIE_NAME, token, getCookieOptions(CONFIG.JWT_EXPIRATION)));
  
  logger.success(`Root authenticated successfully from IP ${ip}.`);
  return res.status(200).json({ session: "valid" });
}

export function logoutRoot(req, res) {
  res.setHeader("Set-Cookie", cookie.serialize(COOKIE_NAME, "", getCookieOptions(0)));
  return res.status(200).json({ session: "invalid" });
}