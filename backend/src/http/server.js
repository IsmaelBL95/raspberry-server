// src/http/server.js

import http from 'http';
import createApp from './app.js';
import { validateEnv } from '../core/env.js';
import logger from '../core/logger.js';

const STATES = Object.freeze({
  OFF: 'OFF',
  ON: 'ON',
});

let serverState = STATES.OFF;
let server = null;

export async function start() {

  /*logger.error('Not implemented yet');
  throw new Error('Not implemented yet');*/

  if (serverState === STATES.ON) return;

  const { PORT } = validateEnv();
  const app = createApp();

  await new Promise((resolve, reject) => {
    server = http.createServer(app);
    server.listen(PORT, resolve);
    server.on('error', reject);
  });

  serverState = STATES.ON;
  logger.success(`Server listening on port ${PORT}`);
}

export async function stop() {
  if (serverState === STATES.OFF || !server) return;

  await new Promise(resolve => server.close(resolve));

  serverState = STATES.OFF;
  server = null;
  logger.warn('Server stopped');
}

export function getState() {
  return serverState;
}

export { STATES as SERVER_STATES };