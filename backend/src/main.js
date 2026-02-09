// src/main.js
// Orquesta el ciclo de vida: init -> start -> shutdown

import { loadConfig } from "./config/env.js";
import { createApp } from "./app.js";
import { createServer } from "./server.js";

let server; // referencia para poder cerrar en shutdown

async function init(config) {
  // Aquí crecerá la app: BD, colas, cache, etc.
  return {
    readiness: {
      ready: true,
    },
  };
}

async function start(config, deps) {
  const app = createApp({ config, deps });
  server = createServer({ app, config });

  await server.start();
}

async function shutdown(signal) {
  try {
    console.log(`[shutdown] señal recibida: ${signal}`);

    if (server) {
      await server.stop();
    }

    console.log("[shutdown] cierre limpio completado");
    process.exit(0);
  } catch (err) {
    console.error("[shutdown] error durante cierre:", err);
    process.exit(1);
  }
}

function attachSignalHandlers() {
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    console.error("[process] unhandledRejection:", reason);
  });

  process.on("uncaughtException", (err) => {
    console.error("[process] uncaughtException:", err);
    shutdown("uncaughtException");
  });
}

export async function run() {
  const config = loadConfig();
  attachSignalHandlers();

  const deps = await init(config);
  await start(config, deps);
}