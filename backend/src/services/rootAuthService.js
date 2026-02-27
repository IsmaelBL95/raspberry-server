import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/index.js";
import logger from "../utils/logger.js";

/*
 * Servicio de autenticación para el usuario raíz. Encapsula la lógica de
 * generación y verificación de JWT, así como un mecanismo rudimentario de
 * protección contra fuerza bruta basado en la IP.
 */

// Configuración de límites y expiraciones
export const CONFIG = {
  /**
   * Tiempo en segundos que dura un JWT válido.
   */
  JWT_EXPIRATION: 5 * 60, // 5 minutos

  /**
   * Duración en milisegundos del bloqueo tras exceder los intentos fallidos.
   */
  LOCKOUT_DURATION: 20 * 60 * 1000, // 20 minutos

  /**
   * Número máximo de intentos fallidos antes de aplicar un bloqueo.
   */
  MAX_FAILED_ATTEMPTS: 3,

  /**
   * Máximo de IPs que se mantienen en memoria. Se emplea una estructura
   * tipo LRU para descartar las menos recientes.
   */
  MAX_IP_ENTRIES: 2000,

  /**
   * TTL en milisegundos para expirar entradas antiguas, evitando crecimiento
   * indefinido de la estructura.
   */
  ENTRY_TTL: 6 * 60 * 60 * 1000, // 6 horas

  JWT_ISSUER: "rasp-server",
  JWT_AUDIENCE: "root",
};

// Pre-cálculo del buffer de la clave para evitar costes repetidos y garantizar
// una comparación temporalmente constante con timingSafeEqual.
const ROOT_KEY_BUF = Buffer.from(typeof config.rootKey === "string" ? config.rootKey : "");

// Mapa que almacena el estado de cada IP. Se mantiene en orden de uso
// (LRU) reinser­tando cada vez que se accede a una IP. Al alcanzar el
// límite se descarta la entrada más antigua.
const stateByIp = new Map();

function nowMs() {
  return Date.now();
}

/**
 * Obtiene o inicializa el estado de una IP en el mapa LRU. Actualiza
 * automáticamente la marca de último acceso y descarta entradas antiguas.
 */
function getState(ip) {
  let st = stateByIp.get(ip);
  const now = nowMs();
  if (st) {
    stateByIp.delete(ip);
    // Comprobación de TTL
    if (st.lastSeen < now - CONFIG.ENTRY_TTL) {
      st = { failedAttempts: 0, blockedUntil: null, lastSeen: now };
    } else {
      st.lastSeen = now;
    }
    stateByIp.set(ip, st);
    return st;
  }
  // LRU: eliminar la entrada más antigua si superamos el límite
  if (stateByIp.size >= CONFIG.MAX_IP_ENTRIES) {
    const oldestKey = stateByIp.keys().next().value;
    stateByIp.delete(oldestKey);
  }
  const created = { failedAttempts: 0, blockedUntil: null, lastSeen: now };
  stateByIp.set(ip, created);
  return created;
}

/**
 * Comprueba si la clave raíz suministrada coincide con la almacenada
 * de forma constante en memoria. Utiliza `timingSafeEqual` para evitar
 * ataques de timing. Si la longitud de la clave no coincide, se devuelve
 * inmediatamente `false` para evitar lanzar excepciones.
 */
export function validateRootKey(key) {
  if (typeof key !== "string" || ROOT_KEY_BUF.length === 0) return false;
  const keyBuf = Buffer.from(key);
  if (keyBuf.length !== ROOT_KEY_BUF.length) return false;
  return crypto.timingSafeEqual(keyBuf, ROOT_KEY_BUF);
}

/**
 * Genera un JWT para la sesión raíz. Incluye un identificador único
 * (jti) y establece la expiración según la configuración.
 */
export function generateJWT() {
  return jwt.sign({ root: true }, config.jwtRootSecret, {
    expiresIn: CONFIG.JWT_EXPIRATION,
    issuer: CONFIG.JWT_ISSUER,
    audience: CONFIG.JWT_AUDIENCE,
    jwtid: crypto.randomUUID(),
  });
}

/**
 * Verifica un JWT recibido. Devuelve el objeto decodificado si es válido
 * y pertenece a la sesión de raíz; de lo contrario devuelve `null`.
 */
export function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, config.jwtRootSecret, {
      issuer: CONFIG.JWT_ISSUER,
      audience: CONFIG.JWT_AUDIENCE,
    });
    return decoded && decoded.root === true ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * Indica si la IP se encuentra actualmente bloqueada.
 */
export function isBlocked(ip) {
  const st = getState(ip);
  if (st.blockedUntil === null) return false;
  if (nowMs() < st.blockedUntil) return true;
  // Si el bloqueo ha expirado, reseteamos el estado
  st.blockedUntil = null;
  st.failedAttempts = 0;
  return false;
}

/**
 * Devuelve los segundos restantes hasta que la IP se desbloquee. Se
 * emplea `stateByIp.get()` para no alterar el orden LRU en operaciones de
 * sólo lectura.
 */
export function getSecondsUntilUnblock(ip) {
  const st = stateByIp.get(ip);
  if (!st || st.blockedUntil === null) return 0;
  const remaining = Math.ceil((st.blockedUntil - nowMs()) / 1000);
  return remaining > 0 ? remaining : 0;
}

/**
 * Registra un intento fallido de autenticación. Si se supera el límite
 * de intentos definidos en la configuración, se marca la IP como
 * bloqueada durante `LOCKOUT_DURATION` milisegundos.
 */
export function recordFailedAttempt(ip) {
  const st = getState(ip);
  st.failedAttempts += 1;
  if (st.failedAttempts >= CONFIG.MAX_FAILED_ATTEMPTS) {
    st.blockedUntil = nowMs() + CONFIG.LOCKOUT_DURATION;
    logger.warning(
      `Security Alert: Blocked IP ${ip} after ${st.failedAttempts} failed root attempts.`
    );
  }
}

/**
 * Restablece el contador de intentos fallidos y elimina cualquier bloqueo
 * asociado a la IP.
 */
export function resetFailedAttempts(ip) {
  const st = getState(ip);
  st.failedAttempts = 0;
  st.blockedUntil = null;
}

/**
 * Autentica la clave raíz para una IP concreta. Lanza excepciones con
 * información contextual (status HTTP y `retryAfter`) para ser capturadas
 * por el middleware global de errores. Si la autenticación es correcta
 * devuelve un JWT válido.
 *
 * @param {string} key - clave raíz proporcionada por el cliente
 * @param {string} ip - dirección IP del cliente
 * @returns {string} token JWT si la autenticación tiene éxito
 * @throws {Error} con propiedades `status` y opcionalmente `retryAfter`
 */
export async function authenticateRoot(key, ip) {
  // Comprobar bloqueo previo
  if (isBlocked(ip)) {
    const err = new Error("Too many attempts. Try again later.");
    err.status = 429;
    err.retryAfter = getSecondsUntilUnblock(ip);
    throw err;
  }
  // Verificar clave
  if (!validateRootKey(key)) {
    recordFailedAttempt(ip);
    if (isBlocked(ip)) {
      const err = new Error("Too many attempts. Try again later.");
      err.status = 429;
      err.retryAfter = getSecondsUntilUnblock(ip);
      throw err;
    }
    const err = new Error("Invalid key");
    err.status = 401;
    throw err;
  }
  // Clave válida: resetear contador y emitir token
  resetFailedAttempts(ip);
  return generateJWT();
}