import { verifyJWT } from "../services/rootAuth.service.js";

const COOKIE_NAME = "root_session";

export function requireRootSession(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ session: "invalid" });
  }

  const decoded = verifyJWT(token);

  if (!decoded) {
    return res.status(401).json({ session: "invalid" });
  }

  // Opcional: dejar información disponible para futuros usos
  req.isRoot = true;
  req.root = {
    jti: decoded.jti,
    iat: decoded.iat,
    exp: decoded.exp,
  };

  next();
}