// src/routes/identityRoutes.js
import express from "express";
import {
  register,
  login,
  me,
  logout,
} from "../controllers/identityController.js";
import { requireMongo } from "../middlewares/requireMongo.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validateIdentityToken } from "../middlewares/identityAuth.js";

const router = express.Router();

router.post("/register", requireMongo, asyncHandler(register));
router.post("/login", requireMongo, asyncHandler(login));
router.get("/me", requireMongo, validateIdentityToken, asyncHandler(me));
router.post("/logout", asyncHandler(logout));

export default router;