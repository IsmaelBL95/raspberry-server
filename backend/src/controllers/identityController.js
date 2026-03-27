// src/controllers/identityController.js
import config from "../config/index.js";
import {
  registerIdentity,
  authenticateIdentity,
  getIdentityPublicById,
} from "../services/identity.service.js";
import {
  generateIdentityJWT,
  CONFIG as IDENTITY_AUTH_CONFIG,
} from "../services/identityAuth.service.js";

const COOKIE_NAME = "identity_session";

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

export async function register(req, res) {
  const { nickname, password, firstName, lastName, birthDate } = req.body;

  if (!nickname || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const identity = await registerIdentity({
      nickname,
      password,
      firstName,
      lastName,
      birthDate,
    });

    return res.status(201).json(identity);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Nickname already exists" });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function login(req, res) {
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const identity = await authenticateIdentity({ nickname, password });

    if (!identity) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateIdentityJWT(identity._id);

    res.cookie(
      COOKIE_NAME,
      token,
      getCookieOptions(IDENTITY_AUTH_CONFIG.JWT_EXPIRATION)
    );

    return res.status(200).json({ session: "valid" });
  } catch {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function me(req, res) {
  try {
    const identity = await getIdentityPublicById(req.identityAuth.identityId);

    if (!identity) {
      return res.status(401).json({ session: "invalid" });
    }

    return res.status(200).json(identity);
  } catch {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, getCookieOptions(0));
  return res.status(200).json({ session: "invalid" });
}