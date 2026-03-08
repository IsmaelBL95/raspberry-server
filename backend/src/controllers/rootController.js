import {
  verifyJWT,
  authenticateRoot,
  CONFIG as ROOT_AUTH_CONFIG,
} from "../services/rootAuthService.js";
import config from "../config/index.js";
import logger from "../utils/logger.js";

const COOKIE_NAME = "root_session";

/**
 * Devuelve la IP del cliente teniendo en cuenta la cabecera X-Forwarded-For.
 * Se utiliza para registrar intentos y aplicar la política de bloqueos.
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
 * Construye las opciones para establecer una cookie de sesión. Ajusta el
 * atributo `secure` en función del entorno y expresa la expiración en
 * milisegundos como exige Express. Se evita exponer la cookie a JS
 * mediante `httpOnly`.
 */
function getCookieOptions(maxAgeSeconds) {
  const isProd = config.nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds * 1000,
  };
}

/**
 * Comprueba si el token de sesión raíz enviado en cookies es válido. No
 * lanza excepciones; responde con 200 si es válido y con 401 si no lo es.
 */
export function checkRootSession(req, res) {
  const token = req.cookies[COOKIE_NAME];
  if (token && verifyJWT(token)) {
    return res.status(200).json({ session: "valid" });
  }
  return res.status(401).json({ session: "invalid" });
}

/**
 * Autentica la clave raíz proporcionada y, en caso de éxito, genera un
 * JWT que se envía al cliente en una cookie. Cualquier error se delega
 * al middleware de errores mediante throw.
 */
export async function authRoot(req, res) {
  const { key } = req.body;
  if (!key) {
    const err = new Error("Missing key");
    err.status = 400;
    throw err;
  }
  const ip = getClientIp(req);
  // Ejecuta autenticación. Esta función lanza para errores controlados
  const token = await authenticateRoot(key, ip);
  // Establece cookie con la duración configurada
  res.cookie(
    COOKIE_NAME,
    token,
    getCookieOptions(ROOT_AUTH_CONFIG.JWT_EXPIRATION)
  );
  logger.success(`Root authenticated successfully from IP ${ip}.`);
  return res.status(200).json({ session: "valid" });
}

/**
 * Elimina la cookie de sesión raíz. Siempre responde con 200 para no
 * revelar información adicional.
 */
export function logoutRoot(req, res) {
  res.clearCookie(COOKIE_NAME, getCookieOptions(0));
  return res.status(200).json({ session: "invalid" });
}