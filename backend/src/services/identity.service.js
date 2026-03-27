// src/services/identity.service.js
import Identity from "../models/identity.model.js";

function sanitizeIdentity(identity) {
  const identityObject = identity.toObject();

  delete identityObject.passwordHash;

  return identityObject;
}

export async function registerIdentity(data) {
  const { nickname, password, firstName, lastName, birthDate } = data;

  const identity = new Identity({
    nickname,
    nicknameCanonical: nickname.toLowerCase(),
    firstName,
    lastName,
    birthDate: birthDate || null,
  });

  await identity.setPassword(password);
  await identity.save();

  return sanitizeIdentity(identity);
}