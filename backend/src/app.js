import express from "express";
import routes from "./routes/index.js";

const app = express();

// Middleware básico
app.use(express.json());

// Registrar rutas
app.use(routes);

export default app;
