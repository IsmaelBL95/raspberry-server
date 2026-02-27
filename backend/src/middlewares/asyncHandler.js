/**
 * Envoltorio para manejar errores en funciones asíncronas. Cualquier
 * excepción o promesa rechazada se enviará automáticamente al
 * middleware de error de Express mediante `next`.
 *
 * @param {Function} fn - controlador o middleware asíncrono
 * @returns {Function} función con manejo de errores integrado
 */
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}