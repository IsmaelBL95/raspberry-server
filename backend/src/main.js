import logger from "./logger.js";
import { PORT } from "./env.js";
import app from "./app.js";
import { startServer, closeServer } from "./server.js";
import { startMongoManager, stopMongoManager } from "./db/mongoManager.js";

const main = async () => {
  logger.info("Booting server...");

  try {
    await startServer(app, PORT);
    logger.success(`Server listening on port ${PORT}.`);
  } catch (err) {
    logger.fatal("Failed to start server");
    process.exit(1);
  }

  // Inicia conexión a Mongo en background (sin bloquear el puerto)
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
};

export default main;