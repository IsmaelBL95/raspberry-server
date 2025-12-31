// backend/src/server.js

import app from './app.js';
import {
  setServerStatus,
  setBootstrapStatus,
  setDbStatus,
  ServerStatus,
  BootstrapStatus,
  DbStatus,
} from './state.js';

const PORT = process.env.PORT || 5000;

/**
 * Estados iniciales del proceso
 */
setServerStatus(ServerStatus.BOOTING);
setBootstrapStatus(BootstrapStatus.PENDING);
setDbStatus(DbStatus.DISCONNECTED);

/**
 * Arranque del servidor HTTP
 */
app.listen(PORT, () => {
  setServerStatus(ServerStatus.RUNNING);
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// bootstrap()
// connectToDatabase()