// server.js
import { createApp } from './app.js'
import { connectDb } from './db.js'
import state from './state.js'
import { PORT } from './config.js'

async function start() {
  const app = createApp()

  await connectDb() // ajusta state.db/state.mode en caso de error

  // Aún no decidimos NORMAL vs BOOTSTRAP; lo haremos en el siguiente paso.
  if (state.mode !== 'ERROR') state.mode = 'BOOTING'

  console.log('Estado inicial:', state)

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
  })
}

start()