import express from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireMongo } from "../middlewares/requireMongo.js";
import { validateIdentityToken } from "../middlewares/identityAuth.js";
import {
  createThankController,
  listThanksController,
} from "../controllers/thankController.js";

const router = express.Router();

router.post("/", requireMongo, validateIdentityToken, asyncHandler(createThankController));
router.get("/", requireMongo, asyncHandler(listThanksController));

export default router;
