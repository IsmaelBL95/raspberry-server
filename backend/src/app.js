import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Cookie parsing (req.cookies)
  app.use(cookieParser());

  // Mount all routes
  app.use(routes);

  return app;
}