import http from "node:http";
import { createApp } from "./app.js";
import logger from "./utils/logger.js";

export async function startServer(port) {
  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(port, resolve));
  logger.success(`Server listening on port ${port}.`);

  return server;
}

export async function closeServer(server) {
  if (!server) return;

  await new Promise((resolve) => server.close(resolve));
  logger.info("Server closed.");
}