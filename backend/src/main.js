import { startServer, closeServer } from "./server.js";
import { env } from "./config/env.js";
import logger from "./utils/logger.js";
import { attachMongoMonitor } from "./services/mongoMonitor.js";

export async function main() {
  attachMongoMonitor();
  logger.info("Booting server...");

  const server = await startServer(env.PORT);

  const shutdown = async (signal) => {
    logger.warning(`Received ${signal}, shutting down...`);
    await closeServer(server);
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}