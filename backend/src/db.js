// src/db.js
import mongoose from 'mongoose'
import state from './state.js'
import { MONGODB_URI } from './config.js'

export async function connectDb() {
  try {
    if (!MONGODB_URI) throw new Error('Falta MONGODB_URI en .env')

    await mongoose.connect(MONGODB_URI)
    state.db = 'UP'
    state.dbError = null
    console.log('MongoDB conectado')
    return true
  } catch (err) {
    state.db = 'DOWN'
    state.mode = 'ERROR'
    state.dbError = err?.message || String(err)
    console.error('Error conectando a MongoDB:', state.dbError)
    return false
  }
}