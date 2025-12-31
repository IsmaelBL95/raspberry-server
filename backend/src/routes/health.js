// backend/src/routes/health.js

import { Router } from 'express';
import { getHealthState } from '../state.js';

const router = Router();

router.get('/health', (_req, res) => {
  const { server, bootstrap, db } = getHealthState();

  res.json({
    server,
    bootstrap,
    db,
    timestamp: new Date().toISOString(),
  });
});

export default router;