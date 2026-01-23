// src/db/mongo.js
import mongoose from 'mongoose';
import { validateEnv } from '../core/env.js';
import logger from '../core/logger.js';

const STATES = Object.freeze({
  DISCONNECTED: 'DISCONNECTED',
  CONNECTED: 'CONNECTED',
});

let dbState = STATES.DISCONNECTED;
let runtimeListenersEnabled = false;

export async function connect() {
  if (dbState === STATES.CONNECTED) return;

  const { MONGO_URI } = validateEnv();

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
    });

    dbState = STATES.CONNECTED;
    logger.success('MongoDB connected');
  } catch (err) {
    dbState = STATES.DISCONNECTED;
    logger.error(`MongoDB error: ${err.message}`);

    try { await mongoose.disconnect(); } catch {}
    throw err; // permite reintento en main.js
  }
}

export function enableRuntimeMonitoring() {
  if (runtimeListenersEnabled) return;
  runtimeListenersEnabled = true;

  mongoose.connection.on('connected', () => {
    if (dbState !== STATES.CONNECTED) {
      dbState = STATES.CONNECTED;
      logger.success('MongoDB connected');
    }
  });

  mongoose.connection.on('disconnected', () => {
    if (dbState !== STATES.DISCONNECTED) {
      dbState = STATES.DISCONNECTED;
      logger.warn('MongoDB disconnected');
    }
  });

  mongoose.connection.on('error', err => {
    logger.error(`MongoDB error: ${err.message}`);
  });
}

export async function disconnect() {
  if (dbState === STATES.DISCONNECTED) return;

  await mongoose.disconnect();
  dbState = STATES.DISCONNECTED;
}

export function getState() {
  return dbState;
}

export { STATES as DB_STATES };