import express from 'express';
import { getAppState } from '../core/state.js';

export default function createApp() {
  const app = express();

  app.use(express.json());

  // Liveness probe
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'UP' });
  });

  // Readiness probe
  app.get('/ready', (_req, res) => {
    const appState = getAppState();

    if (appState === 'READY') {
      return res.status(200).json({ status: appState });
    }

    return res.status(503).json({ status: appState });
  });

  return app;
}