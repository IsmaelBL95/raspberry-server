// src/core/state.js

export const SERVER_STATES = Object.freeze({
  OFF: 'OFF',
  ON: 'ON',
});

export const MONGO_STATES = Object.freeze({
  DISCONNECTED: 'DISCONNECTED',
  CONNECTED: 'CONNECTED',
});

let serverState = SERVER_STATES.OFF;
let mongoState = MONGO_STATES.DISCONNECTED;

export function setServerState(state) {
  serverState = state;
}

export function setMongoState(state) {
  mongoState = state;
}

export function getAppState() {
  if (serverState === SERVER_STATES.OFF) {
    return 'OFF';
  }

  if (
    serverState === SERVER_STATES.ON &&
    mongoState === MONGO_STATES.DISCONNECTED
  ) {
    return 'UNREADY';
  }

  if (
    serverState === SERVER_STATES.ON &&
    mongoState === MONGO_STATES.CONNECTED
  ) {
    return 'READY';
  }

  return 'INCONSISTENT';
}