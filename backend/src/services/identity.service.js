// src/services/identity.service.js

import Identity from "../models/identity.model.js";

/**
 * Elimina campos sensibles antes de responder al cliente.
 */
function sanitizeIdentity(identity) {
  if (!identity) return null;

  const identityObject = identity.toObject();

  delete identityObject.passwordHash;
  delete identityObject.nicknameCanonical;

  return identityObject;
}

/**
 * Registro mínimo:
 * - nickname
 * - password
 */
export async function registerIdentity(data) {
  const { nickname, password } = data;

  const cleanNickname = nickname.trim();

  const identity = new Identity({
    nickname: cleanNickname,
    status: "active",
  });

  await identity.setPassword(password);
  await identity.save();

  return sanitizeIdentity(identity);
}

/**
 * Autenticación:
 * - Busca por nickname canonical
 * - Verifica contraseña
 * - Bloquea cuentas no activas
 */
export async function authenticateIdentity(data) {
  const { nickname, password } = data;

  const identity = await Identity.findByNickname(nickname);

  if (!identity) return null;

  if (identity.status !== "active") {
    return null;
  }

  const isValidPassword = await identity.comparePassword(password);

  if (!isValidPassword) {
    return null;
  }

  // Importante:
  // Devolvemos el documento original para asegurar acceso a _id
  return identity;
}

/**
 * Obtiene perfil público.
 */
export async function getIdentityPublicById(identityId) {
  const identity = await Identity.findById(identityId);

  if (!identity) return null;

  return sanitizeIdentity(identity);
}

export async function getIdentityPublicByNickname(nickname) {
  if (!nickname || typeof nickname !== "string") return null;

  const cleanNickname = nickname.trim().toLowerCase();
  const identity = await Identity.findOne({ nicknameCanonical: cleanNickname });

  if (!identity) return null;

  return sanitizeIdentity(identity);
}

/**
 * Actualización opcional de perfil.
 * No forma parte del registro.
 */
export async function updateIdentityById(identityId, updates) {
  const identity = await Identity.findById(identityId);

  if (!identity) return null;

  if (updates.firstName !== undefined) {
    identity.firstName = updates.firstName;
  }

  if (updates.lastName !== undefined) {
    identity.lastName = updates.lastName;
  }

  if (updates.birthDate !== undefined) {
    identity.birthDate = updates.birthDate;
  }

  await identity.save();

  return sanitizeIdentity(identity);
}

/**
 * Exposición controlada para otros servicios/controladores.
 */
export { sanitizeIdentity };
