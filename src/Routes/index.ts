import { Express } from "express";
import authRoutes from "./auth.route.js";
import organizationRoutes from "./organization.route.js";

export default (app: Express) => {
  app.use("/", authRoutes);
  app.use("/organization", organizationRoutes);
};
