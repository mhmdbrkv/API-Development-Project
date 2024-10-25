import express from "express";
const router = express.Router();

import {
  signup,
  signin,
  refreshToken,
} from "../Controllers/auth.controller.js";

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh-token", refreshToken);

export default router;
