// src/core/state.js

import { getState as getServerState, SERVER_STATES } from '../http/server.js';
import { getState as getMongoState, DB_STATES } from '../db/mongo.js';

const APP_STATES = Object.freeze({
    OFF: 'OFF',
    UNREADY: 'UNREADY',
    READY: 'READY',
});

export function getAppState() {
    const serverState = getServerState();
    const mongoState = getMongoState();

    if (serverState === SERVER_STATES.OFF) {
        return APP_STATES.OFF;
    }

    if (
        serverState === SERVER_STATES.ON &&
        mongoState === DB_STATES.DISCONNECTED
    ) {
        return APP_STATES.UNREADY;
    }

    if (
        serverState === SERVER_STATES.ON &&
        mongoState === DB_STATES.CONNECTED
    ) {
        return APP_STATES.READY;
    }

    // Estado imposible por diseño, pero seguro por defecto
    return APP_STATES.OFF;
}

export { APP_STATES };