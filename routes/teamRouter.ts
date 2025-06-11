import express from "express";
import {
  changeRole,
  createTeam,
  getMyTeams,
  getTeam,
  joinTeam,
} from "../controllers/teamController";
import {
  checkTeamId,
  doesHeBelong,
  requireOwner,
} from "../middlewares/teamsValidation.middleware";

const router = express.Router();

router.route("/").get(getMyTeams).post(createTeam);
router.post("/joinTeam", joinTeam);
router.patch(
  "/:teamId/changeRole/:relationId",
  checkTeamId,
  doesHeBelong,
  requireOwner,
  changeRole
);
router.route("/:teamId").get(checkTeamId, doesHeBelong, getTeam);
export default router;
