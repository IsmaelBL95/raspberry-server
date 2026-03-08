/**
 * Utilidad para logging consistente en toda la aplicación. Los métodos
 * simplemente envuelven `console.log` con emojis para una diferenciación
 * rápida del tipo de mensaje. En un entorno real se podría sustituir por
 * un logger con niveles configurables y salida a ficheros.
 */
const logger = {
  info: (message) => console.log(`🔵 ${message}`),
  success: (message) => console.log(`🟢 ${message}`),
  warning: (message) => console.warn(`🟠 ${message}`),
  error: (message) => console.error(`🔴 ${message}`),
  fatal: (message) => console.error(`⚫ ${message}`),
  debug: (message) => console.debug(`⚪ ${message}`),
};

export default logger;