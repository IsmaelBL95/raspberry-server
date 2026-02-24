import { verifyJWT } from "../services/rootAuthService.js";

const COOKIE_NAME = "root_session";

export function validateRootToken(req, res, next) {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ session: "invalid" });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({ session: "invalid" });
  }

  // Inyección de datos de sesión en el objeto request
  req.isRoot = true;
  req.root = { 
    jti: decoded.jti, 
    iat: decoded.iat, 
    exp: decoded.exp 
  };

  return next();
}