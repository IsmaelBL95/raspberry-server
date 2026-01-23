// src/main.js
import logger from './core/logger.js';
import { start as startServer, stop as stopServer } from './http/server.js';
import {
  connect as connectDB,
  disconnect as disconnectDB,
  enableRuntimeMonitoring,
} from './db/mongo.js';

const MAX_TRIES = 3;

async function boot() {
  // ---- SERVER (obligatorio) ----
  logger.info('Starting server');

  let serverStarted = false;
  for (let i = 0; i < MAX_TRIES; i++) {
    try {
      await startServer();
      serverStarted = true;
      break;
    } catch {}
  }

  if (!serverStarted) {
    process.exit(1);
  }

  // ---- MONGO (opcional) ----
  logger.info('Connecting to database');

  let mongoConnected = false;
  for (let i = 0; i < MAX_TRIES; i++) {
    try {
      await connectDB();
      mongoConnected = true;
      break;
    } catch {}
  }

  if (!mongoConnected) {
    logger.error('Failed to connect to MongoDB after all retries.');
    return; // app viva sin DB
  }

  // ---- RUNTIME MONITORING ----
  enableRuntimeMonitoring();
}

async function shutdown() {
  logger.info('Shutting down application');
  await disconnectDB();
  await stopServer();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default boot;