import express from "express";
import {
  createTeam,
  getMyTeams,
  joinTeam,
} from "../controllers/teamController";

const router = express.Router();

router.route("/").get(getMyTeams).post(createTeam);
router.post("/joinTeam", joinTeam);
export default router;
