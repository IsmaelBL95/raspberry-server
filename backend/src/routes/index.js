// backend/src/routes/index.js

import { Router } from 'express';

import healthRoutes from './health.js';
//import bootstrapRoutes from './bootstrap/index.js';
//import privateRoutes from './private/index.js';

import {
  requireBootstrapped,
  requireNotBootstrapped,
} from '../middlewares/bootstrapGate.js';

const router = Router();

/**
 * Rutas siempre accesibles
 */
router.use(healthRoutes);

/**
 * Rutas de bootstrap
 * Solo accesibles si el sistema NO está bootstrapped
 */
/*router.use(
  '/bootstrap',
  requireNotBootstrapped,
  bootstrapRoutes
);*/

/**
 * Rutas operativas
 * Solo accesibles si el sistema SÍ está bootstrapped
 */
/*router.use(
  '/',
  requireBootstrapped,
  privateRoutes
);*/

export default router;