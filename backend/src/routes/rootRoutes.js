import express from "express";
import {
  checkRootSession,
  authRoot,
  logoutRoot,
} from "../controllers/rootController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = express.Router();

// Comprobar la sesión actual (devolverá válido o inválido)
router.get("/session", asyncHandler(checkRootSession));

// Autenticar la clave raíz y generar un token
router.post("/auth", asyncHandler(authRoot));

// Finalizar la sesión raíz
router.post("/logout", asyncHandler(logoutRoot));

export default router;