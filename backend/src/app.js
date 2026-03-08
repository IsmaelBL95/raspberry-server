import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

/**
 * Configuración inicial de la aplicación Express. Aquí se registran
 * middlewares globales de seguridad, parseo de peticiones y rutas.
 */
const app = express();

// Cabeceras de seguridad recomendadas (X-DNS-Prefetch-Control, X-Frame-Options, etc.)
app.use(helmet());

// Parseo de JSON y formularios URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Rutas de la API
app.use(routes);

// Manejador para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Middleware global de error al final de la cadena
app.use(errorHandler);

export default app;