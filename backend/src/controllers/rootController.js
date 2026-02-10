import cookie from "cookie";
import {
  validateRootKey,
  generateJWT,
  verifyJWT,
  isBlocked,
  getSecondsUntilUnblock,
  recordFailedAttempt,
  resetFailedAttempts,
} from "../services/rootAuthService.js";
import logger from "../logger.js";

const JWT_EXPIRATION_SECONDS = 5 * 60; // 5 minutos

export function checkRootSession(req, res) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.root_session;

  if (!token) {
    return res.status(401).json({ session: "invalid" });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({ session: "invalid" });
  }

  return res.status(200).json({ session: "valid" });
}

export function authRoot(req, res) {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }

  // Verificar si está bloqueado globalmente
  if (isBlocked()) {
    const secondsRemaining = getSecondsUntilUnblock();
    res.setHeader("Retry-After", secondsRemaining);
    return res.status(429).json({ error: "Too many attempts. Try again later." });
  }

  // Validar clave
  if (!validateRootKey(key)) {
    recordFailedAttempt();

    // Si se acaba de bloquear, responder 429 en lugar de 401
    if (isBlocked()) {
      const secondsRemaining = getSecondsUntilUnblock();
      res.setHeader("Retry-After", secondsRemaining);
      return res.status(429).json({ error: "Too many attempts. Try again later." });
    }

    return res.status(401).json({ error: "Invalid key" });
  }

  // Clave correcta: resetear intentos
  resetFailedAttempts();

  // Generar JWT
  const token = generateJWT();

  // Configurar cookie HttpOnly
  const cookieOptions = cookie.serialize("root_session", token, {
    httpOnly: true,
    secure: false, // false en desarrollo
    sameSite: "lax",
    path: "/",
    maxAge: JWT_EXPIRATION_SECONDS,
  });

  res.setHeader("Set-Cookie", cookieOptions);
  logger.success("Root authenticated successfully.");
  return res.status(200).json({ session: "valid" });
}
