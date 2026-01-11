// src/main.js

import createApp from './http/app.js';
import startServer from './http/server.js';
import { logger } from './core/logger.js';

export default async function main() {
  logger.info('Starting server...');

  const app = createApp();
  const { server, port } = await startServer(app);

  const shutdown = signal => {
    logger.info(`${signal} received. Shutting down...`);
    server.close(() => {
      logger.shutdown('Server shut down gracefully.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  logger.success(`Server listening on port ${port}.`);
}
