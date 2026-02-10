let server = null;

const startServer = (app, port) => {
  return new Promise((resolve) => {
    server = app.listen(port, () => {
      resolve(server);
    });
  });
};

const closeServer = () => {
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
};

export { startServer, closeServer };
