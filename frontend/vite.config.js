import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Todas las peticiones que empiecen por /api se redirigirán al backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Opcional: elimina "/api" de la ruta antes de enviarla al servidor
        rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
})