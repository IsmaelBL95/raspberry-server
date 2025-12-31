// backend/src/state.js

/* =========================
 * Enumeraciones de estado
 * ========================= */

export const ServerStatus = Object.freeze({
  BOOTING: 'BOOTING',
  RUNNING: 'RUNNING',
  ERROR: 'ERROR',
});

export const BootstrapStatus = Object.freeze({
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  FAILED: 'FAILED',
});

export const DbStatus = Object.freeze({
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  READY: 'READY',
  ERROR: 'ERROR',
});

/* =========================
 * Estado interno
 * ========================= */

let serverStatus = ServerStatus.BOOTING;
let bootstrapStatus = BootstrapStatus.PENDING;
let dbStatus = DbStatus.DISCONNECTED;

/* =========================
 * Getters
 * ========================= */

export function getServerStatus() {
  return serverStatus;
}

export function getBootstrapStatus() {
  return bootstrapStatus;
}

export function getDbStatus() {
  return dbStatus;
}

/* =========================
 * Setters (controlados)
 * ========================= */

export function setServerStatus(status) {
  if (!Object.values(ServerStatus).includes(status)) {
    throw new Error(`ServerStatus inválido: ${status}`);
  }
  serverStatus = status;
}

export function setBootstrapStatus(status) {
  if (!Object.values(BootstrapStatus).includes(status)) {
    throw new Error(`BootstrapStatus inválido: ${status}`);
  }
  bootstrapStatus = status;
}

export function setDbStatus(status) {
  if (!Object.values(DbStatus).includes(status)) {
    throw new Error(`DbStatus inválido: ${status}`);
  }
  dbStatus = status;
}

/* =========================
 * Helper agregado (health)
 * ========================= */

export function getHealthState() {
  return {
    server: serverStatus,
    bootstrap: bootstrapStatus,
    db: dbStatus,
  };
}