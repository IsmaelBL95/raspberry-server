// src/services/identityAuth.service.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/index.js";

export const CONFIG = {
  JWT_EXPIRATION: 7 * 24 * 60 * 60,
  JWT_ISSUER: "rasp-server",
  JWT_AUDIENCE: "identity",
};

export function generateIdentityJWT(identityId) {
  return jwt.sign(
    {
      sub: String(identityId),
      identity: true,
    },
    config.jwtIdentitySecret,
    {
      expiresIn: CONFIG.JWT_EXPIRATION,
      issuer: CONFIG.JWT_ISSUER,
      audience: CONFIG.JWT_AUDIENCE,
      jwtid: crypto.randomUUID(),
    }
  );
}

export function verifyIdentityJWT(token) {
  try {
    const decoded = jwt.verify(token, config.jwtIdentitySecret, {
      issuer: CONFIG.JWT_ISSUER,
      audience: CONFIG.JWT_AUDIENCE,
    });

    if (!decoded || decoded.identity !== true || !decoded.sub) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}