// src/http/server.js

import logger from '../core/logger.js';
import { setServerState, SERVER_STATES } from '../core/state.js';

let server = null;

export function start(app, port) {
  // Iniciamos el servidor (no bloquea)
  server = app.listen(port);

  // El puerto ya está escuchando
  server.on('listening', () => {
    setServerState(SERVER_STATES.ON);
    logger.success(`HTTP server listening on port ${port}.`);
  });

  // Error al arrancar o durante la ejecución
  server.on('error', err => {
    setServerState(SERVER_STATES.OFF);
    logger.fatal(`HTTP server error: ${err.message}`);
  });

  // Cierre del servidor
  server.on('close', () => {
    setServerState(SERVER_STATES.OFF);
    logger.success('HTTP server closed.');
  });
}

export function stop() {
  if (!server) return;

  server.close();
  server = null;
}