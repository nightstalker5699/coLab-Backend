import express from "express";
import { createTeam, getMyTeams } from "../controllers/teamController";

const router = express.Router();

router.route("/").get(getMyTeams).post(createTeam);

export default router;
