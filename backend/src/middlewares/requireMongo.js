import { isMongoReady } from "../db/mongoManager.js";

/**
 * Middleware que comprueba si la conexión a MongoDB está lista. Si no lo está,
 * responde con un 503 para indicar que el servicio depende de la base de
 * datos. Permite degradar la aplicación cuando la base de datos no está
 * disponible.
 */
export function requireMongo(req, res, next) {
  if (!isMongoReady()) {
    return res.status(503).json({ error: "DB unavailable" });
  }
  return next();
}