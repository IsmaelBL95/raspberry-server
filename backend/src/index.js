// src/index.js
// Punto de entrada mínimo: delega el ciclo de vida en main.js

import "dotenv/config"; // carga .env automáticamente al arrancar

import { run } from "./main.js";
run();