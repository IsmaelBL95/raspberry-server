import cookie from "cookie";
import { verifyJWT } from "../services/rootAuthService.js";

const COOKIE_NAME = "root_session";

export function validateRootToken(req, res, next) {
  const rawCookie = req.headers.cookie;
  if (!rawCookie) {
    return res.status(401).json({ session: "invalid" });
  }

  const cookies = cookie.parse(rawCookie);
  const token = cookies[COOKIE_NAME];

  // Validación rápida de string vacío
  if (!token) {
    return res.status(401).json({ session: "invalid" });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({ session: "invalid" });
  }

  req.isRoot = true;
  // Solo pasamos datos útiles y seguros
  req.root = { jti: decoded.jti, iat: decoded.iat, exp: decoded.exp };

  return next();
}