// src/middlewares/identityAuth.js
import { verifyIdentityJWT } from "../services/identityAuth.service.js";

const COOKIE_NAME = "identity_session";

export function validateIdentityToken(req, res, next) {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ session: "invalid" });
  }

  const decoded = verifyIdentityJWT(token);

  if (!decoded) {
    return res.status(401).json({ session: "invalid" });
  }

  req.identityAuth = {
    identityId: decoded.sub,
    jti: decoded.jti,
    iat: decoded.iat,
    exp: decoded.exp,
  };

  return next();
}