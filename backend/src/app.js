import express from "express";

const app = express();

// Middleware básico
app.use(express.json());

export default app;
