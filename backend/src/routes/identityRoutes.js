// src/routes/identityRoutes.js
import express from "express";
import { register } from "../controllers/identityController.js";
import { requireMongo } from "../middlewares/requireMongo.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = express.Router();

router.post("/register", requireMongo, asyncHandler(register));

export default router;