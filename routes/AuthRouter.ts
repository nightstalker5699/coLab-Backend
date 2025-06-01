import express, { Request, Response } from "express";
import passport, { authhandler } from "../helpers/authhandler";

import { logout, signup } from "../controllers/authController";

const router = express.Router();

// local authentication
router.post("/login", authhandler("local"));
router.post("/signup", signup);

// google authentication
router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/login/google/redirect", authhandler("google"));

// GitHub authentication
router.get(
  "/login/github",
  passport.authenticate("github", { scope: ["user:email", "read:user"] })
);
router.get("/login/github/redirect", authhandler("github"));

router.post("/logout", logout);
export default router;
