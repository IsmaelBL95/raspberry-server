// src/core/env.js

export function validateEnv() {
  const PORT = Number(process.env.PORT ?? 3000);
  const NODE_ENV = process.env.NODE_ENV ?? 'development';

  if (Number.isNaN(PORT) || PORT <= 0) {
    throw new Error('Invalid PORT environment variable');
  }

  return { PORT, NODE_ENV };
}