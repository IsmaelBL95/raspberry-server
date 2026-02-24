import express from "express";
import routes from "./routes/index.js";
import cookieParser from "cookie-parser";

const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Registrar rutas
app.use(routes);

export default app;
