// src/http/server.js

import { validateEnv } from '../core/env.js';

export default async function startServer(app) {
  const { PORT } = validateEnv();

  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      resolve({ server, port: PORT });
    });

    server.on('error', reject);
  });
}
