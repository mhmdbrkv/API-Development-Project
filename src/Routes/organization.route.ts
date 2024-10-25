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
router.post("/", allowedTo("admin"), createOne);
router.get("/", getMany);
router.get("/:organization_id", getOne);
router.put("/:organization_id", allowedTo("admin"), updateOne);
router.delete("/:organization_id", allowedTo("admin"), deleteOne);
router.post("/:organization_id/invite", allowedTo("admin"), inviteMember);

export default router;
