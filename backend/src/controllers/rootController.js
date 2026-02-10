import cookie from "cookie";
import { validateRootKey, generateJWT, verifyJWT } from "../services/rootAuthService.js";
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

  if (!validateRootKey(key)) {
    return res.status(401).json({ error: "Invalid key" });
  }

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
