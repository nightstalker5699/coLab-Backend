import express from "express";
import { createTeam } from "../controllers/teamController";

const router = express.Router();

router.route("/").post(createTeam);

export default router;
