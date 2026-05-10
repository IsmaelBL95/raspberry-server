// src/controllers/identityController.js

import config from "../config/index.js";
import Identity from "../models/identity.model.js";

import {
  registerIdentity,
  authenticateIdentity,
  getIdentityPublicById,
  getIdentityPublicByNickname,
  updateIdentityById,
} from "../services/identity.service.js";

import {
  generateIdentityJWT,
} from "../services/identityAuth.service.js";

const COOKIE_NAME = "identity_session";

/**
 * Configuración de cookie según entorno.
 */
function getCookieOptions(maxAgeSeconds) {
  const isProd = config.nodeEnv === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
    maxAge: maxAgeSeconds * 1000,
  };
}

/**
 * Validación centralizada de usuario.
 */
function validateUsername(user) {
  if (!user || typeof user !== "string") {
    return "Username is required";
  }

  const cleanUser = user.trim();

  if (cleanUser.length < 3 || cleanUser.length > 30) {
    return "Username must be between 3 and 30 characters";
  }

  if (!/^[a-zA-Z0-9]+$/.test(cleanUser)) {
    return "Username must be alphanumeric";
  }

  return null;
}

/**
 * Validación centralizada de contraseña.
 */
function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  return null;
}

/**
 * Listado de identidades (admin).
 */
export async function listIdentities(req, res) {
  try {
    const identities = await Identity.find(
      {},
      "nickname status createdAt"
    );

    return res.status(200).json({
      success: true,
      identities,
    });

  } catch (error) {
    console.error("Error en listIdentities:", error);

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

/**
 * Registro simplificado:
 * user + password + password_confirmation
 */
export async function register(req, res) {
  const { user, password, password_confirmation } = req.body;

  if (!user || !password || !password_confirmation) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
    });
  }

  const usernameError = validateUsername(user);

  if (usernameError) {
    return res.status(400).json({
      success: false,
      error: usernameError,
    });
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    return res.status(400).json({
      success: false,
      error: passwordError,
    });
  }

  if (password !== password_confirmation) {
    return res.status(400).json({
      success: false,
      error: "Passwords do not match",
    });
  }

  try {
    const identity = await registerIdentity({
      nickname: user.trim(),
      password,
    });

    return res.status(201).json({
      success: true,
      identity,
    });

  } catch (error) {
    console.error("Error en register:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Username already exists",
      });
    }

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

/**
 * Login:
 * user + password
 */
export async function login(req, res) {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
    });
  }

  try {
    const identity = await authenticateIdentity({
      nickname: user.trim(),
      password,
    });

    if (!identity) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const token = generateIdentityJWT(identity._id);

    res.cookie(
      COOKIE_NAME,
      token,
      getCookieOptions(7 * 24 * 60 * 60)
    );

    return res.status(200).json({
      success: true,
      session: "valid",
    });

  } catch (error) {
    console.error("Error en login:", error);

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

/**
 * Sesión actual.
 */
export async function me(req, res) {
  try {
    const identity = await getIdentityPublicById(
      req.identityAuth.identityId
    );

    if (!identity) {
      return res.status(401).json({
        success: false,
        session: "invalid",
      });
    }

    return res.status(200).json({
      success: true,
      identity,
    });

  } catch (error) {
    console.error("Error en me:", error);

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

/**
 * Cierre de sesión.
 */
export function logout(req, res) {
  const isProd = config.nodeEnv === "production";

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    session: "invalid",
  });
}

/**
 * Actualización de perfil opcional.
 */
export async function updateMe(req, res) {
  let { firstName, lastName, birthDate } = req.body;

  if (firstName !== undefined) {
    if (typeof firstName !== "string" || !firstName.trim()) {
      return res.status(400).json({
        success: false,
        error: "Invalid firstName",
      });
    }

    firstName = firstName.trim();
  }

  if (lastName !== undefined) {
    if (typeof lastName !== "string" || !lastName.trim()) {
      return res.status(400).json({
        success: false,
        error: "Invalid lastName",
      });
    }

    lastName = lastName.trim();
  }

  if (birthDate !== undefined) {
    if (birthDate === "" || birthDate === null) {
      birthDate = null;
    } else {
      const parsedDate = new Date(birthDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: "Invalid birthDate",
        });
      }

      birthDate = parsedDate;
    }
  }

  try {
    const updated = await updateIdentityById(
      req.identityAuth.identityId,
      {
        firstName,
        lastName,
        birthDate,
      }
    );

    if (!updated) {
      return res.status(401).json({
        success: false,
        session: "invalid",
      });
    }

    return res.status(200).json({
      success: true,
      identity: updated,
    });

  } catch (error) {
    console.error("Error en updateMe:", error);

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

export async function getProfileByNickname(req, res) {
  const { nickname } = req.params;

  if (!nickname) {
    return res.status(400).json({
      success: false,
      error: "Nickname is required",
    });
  }

  try {
    const identity = await getIdentityPublicByNickname(nickname);

    if (!identity) {
      return res.status(404).json({
        success: false,
        error: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      identity,
    });
  } catch (error) {
    console.error("Error en getProfileByNickname:", error);

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}
