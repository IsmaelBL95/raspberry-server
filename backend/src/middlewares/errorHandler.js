import logger from "../utils/logger.js";

/**
 * Middleware global de gestión de errores. Cualquier error no controlado que
 * ocurra en las rutas o controladores será capturado aquí. Devuelve un
 * mensaje genérico en caso de errores de servidor para no exponer detalles
 * internos. Permite adjuntar información adicional en la propiedad
 * `status` de la excepción o en otros campos como `retryAfter` para
 * encabezados específicos.
 */
export function errorHandler(err, req, res, _next) {
  // Log del error para diagnóstico
  logger.error(err.message || "Unexpected error");

  // Permite al controlador definir un código de estado personalizado
  const status = err.status ?? 500;
  // Para ataques de fuerza bruta se puede incluir `retryAfter` en el error
  if (status === 429 && err.retryAfter) {
    res.setHeader("Retry-After", err.retryAfter);
  }

  // Respuesta genérica para errores de servidor
  if (status >= 500) {
    return res.status(status).json({ error: "Internal Server Error" });
  }
  return res.status(status).json({ error: err.message });
}