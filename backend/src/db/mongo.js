import mongoose from 'mongoose';
import logger from '../core/logger.js';
import { setMongoState, MONGO_STATES } from '../core/state.js';

const RETRY_DELAYS = [0, 5000, 15000, 30000, 60000]; // ms
let attempt = 0;
let connected = false;

function attemptConnection(uri) {
  const delay = RETRY_DELAYS[attempt];

  if (delay > 0) {
    setTimeout(() => connect(uri), delay);
    return;
  }

  connect(uri);
}

function connect(uri) {
  mongoose.connect(uri).catch(() => {
    if (attempt === 0) {
      logger.error('MongoDB initial connection failed. Retrying connection…');
    } else if (attempt < RETRY_DELAYS.length - 1) {
      logger.error(
        `MongoDB connection failed. Retrying in ${RETRY_DELAYS[attempt] / 1000} seconds…`
      );
    } else {
      logger.error('MongoDB connection failed.');
      return; // dejamos de reintentar
    }

    attempt++;
    attemptConnection(uri);
  });
}

export function start(uri) {
  setMongoState(MONGO_STATES.DISCONNECTED);
  attemptConnection(uri);

  mongoose.connection.on('connected', () => {
    connected = true;
    attempt = 0;
    setMongoState(MONGO_STATES.CONNECTED);
    logger.success('MongoDB connected.');
  });

  mongoose.connection.on('disconnected', () => {
    if (!connected) return;

    connected = false;
    setMongoState(MONGO_STATES.DISCONNECTED);
    logger.warn('MongoDB disconnected.');
  });

  mongoose.connection.on('error', err => {
    if (connected) {
      logger.error(`MongoDB error: ${err.message}`);
    }
  });
}
