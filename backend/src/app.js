// src/app.js
import express from 'express'
import router from './routes.js'

const app = express()

// Middleware para poder leer JSON en el body
app.use(express.json())

// Montamos todas las rutas bajo /api
app.use('/api', router)

export default app