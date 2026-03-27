// src/controllers/identityController.js
import { registerIdentity } from "../services/identity.service.js";

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