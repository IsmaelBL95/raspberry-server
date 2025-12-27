// src/config.js
import 'dotenv/config'

export const PORT = Number(process.env.PORT) || 5000
export const MONGODB_URI = process.env.MONGODB_URI

export default {
  PORT,
  MONGODB_URI,
}