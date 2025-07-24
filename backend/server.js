import express from 'express'
import mongoose from 'mongoose'

const app = express()
const port = 5000
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/raspdb'

app.use(express.json())

app.get('/api/ping', (req, res) => {
    res.json({ mensaje: '🏓 Pong desde API' })
})

mongoose.connect(mongoURL)
    .then(() => {
        console.log('✅ Conectado a MongoDB')
        app.listen(port, () => {
            console.log(`🚀 Servidor escuchando en http://localhost:${port}`)
        })
    })
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err))