// src/server.js
// Encapsula el servidor HTTP: start/stop

import http from "http";

export function createServer({ app, config }) {
  const server = http.createServer(app);

  return {
    start() {
      return new Promise((resolve, reject) => {
        server.listen(config.port, config.host, () => {
          console.log(`[server] escuchando en http://${config.host}:${config.port}`);
          resolve();
        });

        server.on("error", reject);
      });
    },

    stop() {
      return new Promise((resolve, reject) => {
        console.log("[server] cerrando servidor...");
        server.close((err) => {
          if (err) return reject(err);
          console.log("[server] servidor cerrado");
          resolve();
        });
      });
    },
  };
}