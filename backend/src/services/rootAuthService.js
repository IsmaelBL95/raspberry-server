import jwt from "jsonwebtoken";
import { ROOT_KEY, JWT_ROOT_SECRET } from "../env.js";

const JWT_EXPIRATION = 5 * 60; // 5 minutos en segundos

export function validateRootKey(key) {
  return key === ROOT_KEY;
}

export function generateJWT() {
  const payload = { root: true };
  const token = jwt.sign(payload, JWT_ROOT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
  return token;
}

export function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, JWT_ROOT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}
