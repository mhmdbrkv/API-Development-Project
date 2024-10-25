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

router.use(guard, allowedTo("admin"));
router.post("/organization", createOne);
router.get("/organization", getMany);
router.get("/organization/:organization_id", getOne);
router.put("/organization/:organization_id", updateOne);
router.delete("/organization/:organization_id", deleteOne);
router.post("/organization/:organization_id/invite", inviteMember);

export default router;
