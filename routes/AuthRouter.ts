import express, { Request, Response } from "express";
import passport, { authhandler } from "../helpers/authhandler";

import { signup } from "../controllers/authController";

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

// Additional routes for frontend testing
router.get("/profile", (req: Request, res: Response) => {
  if (req.user) {
    res.status(200).json({
      status: "success",
      data: {
        user: req.user,
      },
    });
  } else {
    res.status(401).json({
      status: "error",
      message: "Not authenticated",
    });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Logout failed",
      });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Session destruction failed",
        });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({
        status: "success",
        message: "Logged out successfully",
      });
    });
  });
});
export default router;
