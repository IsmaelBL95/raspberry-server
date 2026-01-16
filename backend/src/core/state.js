// src/core/state.js

// Estados de infraestructura
export const SERVER_STATES = Object.freeze({
  OFF: 'OFF',
  ON: 'ON',
});

// Estados de persistencia
export const MONGO_STATES = Object.freeze({
  DISCONNECTED: 'DISCONNECTED',
  CONNECTED: 'CONNECTED',
});

// Estados de configuración
export const BOOTSTRAP_STATES = Object.freeze({
  NOT_BOOTSTRAPPED: 'NOT_BOOTSTRAPPED',
  NEEDS_BOOTSTRAP: 'NEEDS_BOOTSTRAP',
  BOOTSTRAPPED: 'BOOTSTRAPPED',
});

// Estados lógicos derivados
export const APP_STATES = Object.freeze({
  UNRESPONSIVE: 'UNRESPONSIVE',
  UNREADY: 'UNREADY',
  NEEDS_BOOTSTRAP: 'NEEDS_BOOTSTRAP',
  READY: 'READY',
  INCONSISTENT: 'INCONSISTENT',
});

// ─────────────────────────────────────────────
// Estado interno (fuente de verdad)
// ─────────────────────────────────────────────

let serverState = SERVER_STATES.OFF;
let mongoState = MONGO_STATES.DISCONNECTED;
let bootstrapState = BOOTSTRAP_STATES.NOT_BOOTSTRAPPED;

// ─────────────────────────────────────────────
// Setters (eventos del sistema)
// ─────────────────────────────────────────────

export function setServerState(state) {
  // Validate state
  if (!Object.values(SERVER_STATES).includes(state)) {
    throw new Error(`Invalid server state: ${state}`);
  }
  serverState = state;
}

export function setMongoState(state) {
  // Validate state
  if (!Object.values(MONGO_STATES).includes(state)) {
    throw new Error(`Invalid mongo state: ${state}`);
  }
  mongoState = state;
}

export function setBootstrapState(state) {
  // Validate state
  if (!Object.values(BOOTSTRAP_STATES).includes(state)) {
    throw new Error(`Invalid bootstrap state: ${state}`);
  }
  bootstrapState = state;
}

// ─────────────────────────────────────────────
// Getters (observabilidad)
// ─────────────────────────────────────────────

export function getServerState() {
  return serverState;
}

export function getMongoState() {
  return mongoState;
}

export function getBootstrapState() {
  return bootstrapState;
}

// ─────────────────────────────────────────────
// Estado lógico derivado (función pura)
// ─────────────────────────────────────────────

export function getAppState() {
  if (serverState === SERVER_STATES.OFF) {
    return APP_STATES.UNRESPONSIVE;
  }

  if (serverState === SERVER_STATES.ON && mongoState === MONGO_STATES.DISCONNECTED) {
    return APP_STATES.UNREADY;
  }

  if (
    serverState === SERVER_STATES.ON &&
    mongoState === MONGO_STATES.CONNECTED &&
    bootstrapState === BOOTSTRAP_STATES.NEEDS_BOOTSTRAP
  ) {
    return APP_STATES.NEEDS_BOOTSTRAP;
  }

  if (
    serverState === SERVER_STATES.ON &&
    mongoState === MONGO_STATES.CONNECTED &&
    bootstrapState === BOOTSTRAP_STATES.BOOTSTRAPPED
  ) {
    return APP_STATES.READY;
  }

  return APP_STATES.INCONSISTENT;
}