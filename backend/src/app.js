// src/app.js
import express from 'express'
import state from './state.js'

export function createApp() {
  const app = express()

  app.get('/healthz', (req, res) => {
    res.status(200).json({ ok: true })
  })

  app.get('/readyz', (req, res) => {
    const ready = state.mode === 'NORMAL'
    res.status(ready ? 200 : 503).json({
      ready,
      mode: state.mode,
      db: state.db,
      dbError: state.dbError,
    })
  })

  return app
}