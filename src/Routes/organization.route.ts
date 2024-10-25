import express from "express";
const router = express.Router();

import {
  signup,
  signin,
  refreshToken,
} from "../Controllers/auth.controller.js";

router.post("/organization", signup);
router.get("/organization", signin);
router.get("/organization/:organization_id", signin);
router.put("/organization/:organization_id", signin);
router.delete("/organization/:organization_id", signin);
router.post("/organization/:organization_id/invite", signin);

export default router;
