// src/main.js

import createApp from './http/app.js';
import * as server from './http/server.js';
import * as mongo from './db/mongo.js';
import { validateEnv } from './core/env.js';
import logger from './core/logger.js';

export default async function main() {
  const { PORT, MONGO_URI } = validateEnv();
  const app = createApp();

  logger.info('Starting HTTP server.');
  server.start(app, PORT);

  logger.info('Connecting to MongoDB.');
  mongo.start(MONGO_URI);


  process.on('SIGINT', async () => {
    logger.info('SIGINT received: closing HTTP server.');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received: closing HTTP server.');
    await server.stop();
    process.exit(0);
  });
}
