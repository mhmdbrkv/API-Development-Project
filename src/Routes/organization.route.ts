import express from "express";
const router = express.Router();

import {
  createOne,
  getMany,
  getOne,
  updateOne,
  deleteOne,
  inviteMember,
} from "../Controllers/organization.controller.js";
import { allowedTo, guard } from "../Middleware/auth.middleware.js";

router.use(guard);
router.post("/organization", allowedTo("admin"), createOne);
router.get("/organization", getMany);
router.get("/organization/:organization_id", getOne);
router.put("/organization/:organization_id", allowedTo("admin"), updateOne);
router.delete("/organization/:organization_id", allowedTo("admin"), deleteOne);
router.post(
  "/organization/:organization_id/invite",
  allowedTo("admin"),
  inviteMember
);

export default router;
