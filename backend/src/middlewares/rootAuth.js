import { verifyJWT } from "../services/rootAuthService.js";

const COOKIE_NAME = "root_session";

/**
 * Middleware que valida el token de sesión de la raíz. Extrae el JWT de
 * las cookies y lo verifica utilizando el servicio de autenticación. En
 * caso de éxito, adjunta información básica de la sesión al objeto `req`.
 */
export function validateRootToken(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ session: "invalid" });
  }
  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({ session: "invalid" });
  }
  // Inyección de datos de sesión para uso posterior
  req.isRoot = true;
  req.root = {
    jti: decoded.jti,
    iat: decoded.iat,
    exp: decoded.exp,
  };
  return next();
}