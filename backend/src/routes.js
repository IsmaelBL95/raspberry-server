// src/routes.js
import { Router } from 'express'

const router = Router()

// GET /api/ping
router.get('/ping', (req, res) => {
  res.json({ mensaje: 'pong' })
})

// GET /api/saludo/Isma  -> { saludo: "Hola, Isma" }
router.get('/saludo/:nombre', (req, res) => {
  const nombre = req.params.nombre
  res.json({ saludo: `Hola, ${nombre}` })
})

export default router