import express from "express";
const router = express.Router();

import {
  signup,
  signin,
  refreshToken,
} from "../Controllers/auth.controller.js";
import { guard } from "../Middleware/auth.middleware.js";

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh-token", guard, refreshToken);

export default router;
