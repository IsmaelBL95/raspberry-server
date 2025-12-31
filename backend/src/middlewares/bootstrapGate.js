// backend/src/middlewares/bootstrapGate.js

import { getBootstrapStatus, BootstrapStatus } from '../state.js';

/**
 * Permite el acceso solo si el sistema YA ha sido bootstrapped
 */
export function requireBootstrapped(_req, res, next) {
  const status = getBootstrapStatus();

  if (status !== BootstrapStatus.DONE) {
    return res.status(503).json({
      ok: false,
      bootstrap: status,
      message: 'Service not bootstrapped',
    });
  }

  next();
}

/**
 * Permite el acceso solo si el sistema AÚN NO ha sido bootstrapped
 */
export function requireNotBootstrapped(_req, res, next) {
  const status = getBootstrapStatus();

  if (status === BootstrapStatus.DONE) {
    return res.status(403).json({
      ok: false,
      bootstrap: status,
      message: 'Service already bootstrapped',
    });
  }

  next();
}