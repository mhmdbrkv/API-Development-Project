import { Express } from "express";
import authRoutes from "./auth.route.js";

export default (app: Express) => {
  app.use("/api/auth", authRoutes);
};
