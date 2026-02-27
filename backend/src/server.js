let server = null;

/**
 * Arranca el servidor HTTP de Express sobre el puerto indicado. Devuelve una
 * promesa que se resuelve cuando el servidor comienza a escuchar.
 */
export function startServer(app, port) {
  return new Promise((resolve) => {
    server = app.listen(port, () => {
      resolve(server);
    });
  });
}

/**
 * Cierra el servidor HTTP si está activo. Devuelve una promesa que se
 * resuelve cuando el cierre se completa.
 */
export function closeServer() {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
}