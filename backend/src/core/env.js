// src/core/env.js

export function validateEnv() {
  const PORT = Number(process.env.PORT ?? 3000);
  const MONGO_URI = process.env.MONGO_URI;

  if (!Number.isInteger(PORT) || PORT <= 0) {
    throw new Error('Invalid PORT environment variable');
  }

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  return { PORT, MONGO_URI };
}