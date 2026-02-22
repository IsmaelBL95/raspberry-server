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
}