// src/config/index.js
/**
 * Extrae una variable de entorno requerida. Falla inmediatamente si no existe.
 */
const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Error de configuración: Variable de entorno ${key} no definida.`);
  }
  return value;
};

const isProduction = process.env.NODE_ENV === "production";

/**
 * Configuración centralizada e inmutable.
 */
export const config = Object.freeze({
  port: Number(process.env.PORT ?? 5000),

  // En producción, estas variables DEBEN estar en el entorno.
  // En desarrollo, se permiten valores por defecto para facilitar el setup.
  rootKey: isProduction
    ? getRequiredEnv("ROOT_KEY")
    : (process.env.ROOT_KEY ?? "0123456789abcdef"),

  jwtRootSecret: isProduction
    ? getRequiredEnv("JWT_ROOT_SECRET")
    : (process.env.JWT_ROOT_SECRET ?? "my-secret-key"),

  jwtIdentitySecret: isProduction
    ? getRequiredEnv("JWT_IDENTITY_SECRET")
    : (process.env.JWT_IDENTITY_SECRET ?? "my-identity-secret-key"),

  // MONGO_URI es crítica en cualquier entorno.
  mongoUri: getRequiredEnv("MONGO_URI"),

  nodeEnv: process.env.NODE_ENV ?? "development",
});

export default config;