/**
 * Configuración centralizada de la aplicación. Las variables aquí expuestas
 * permiten configurar el comportamiento sin modificar el código fuente.
 */
const config = {
  /**
   * Puerto en el que arranca Express. Convierte a number para evitar
   * concatenaciones accidentales al tratarlo como string.
   */
  port: Number(process.env.PORT ?? 5000),

  /**
   * Clave raíz para la autenticación. Debe mantenerse secreta y configurarse
   * a través de variables de entorno en producción.
   */
  rootKey: process.env.ROOT_KEY ?? "0123456789abcdef",

  /**
   * Secreto utilizado para firmar y verificar JWTs de sesión raíz.
   */
  jwtRootSecret: process.env.JWT_ROOT_SECRET ?? "my-secret-key",

  /**
   * URI de conexión a la base de datos MongoDB.
   */
  mongoUri: process.env.MONGO_URI,

  /**
   * Entorno de ejecución (development|production). Afecta a cabeceras
   * de seguridad como el flag `secure` de las cookies.
   */
  nodeEnv: process.env.NODE_ENV ?? "development",
};

export default config;