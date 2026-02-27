import logger from "./utils/logger.js";
import config from "./config/index.js";
import app from "./app.js";
import { startServer, closeServer } from "./server.js";
import { startMongoManager, stopMongoManager } from "./db/mongoManager.js";

/**
 * Función principal que arranca el servidor y la conexión a la base de datos.
 * Maneja las señales de terminación para cerrar recursos limpiamente.
 */
export default async function main() {
  logger.info("Booting server...");
  try {
    await startServer(app, config.port);
    logger.success(`Server listening on port ${config.port}.`);
  } catch (_err) {
    logger.fatal("Failed to start server");
    process.exit(1);
  }
  // Iniciar gestor de Mongo en segundo plano
  startMongoManager();
  process.on("SIGINT", async () => {
    logger.info("SIGINT received, shutting down...");
    await stopMongoManager();
    await closeServer();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down...");
    await stopMongoManager();
    await closeServer();
    process.exit(0);
  });
}