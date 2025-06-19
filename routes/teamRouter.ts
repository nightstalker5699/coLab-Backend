import express from "express";
import {
  changeRole,
  createTeam,
  getMyTeams,
  getTeam,
  joinTeam,
  kickUserFromTeam,
} from "../controllers/teamController";
import {
  checkTeamId,
  doesHeBelong,
  requireOwner,
} from "../middlewares/teamsValidation.middleware";
import { imageHandle } from "../helpers/image.handle";
const router = express.Router();

router
  .route("/")
  .get(getMyTeams)
  .post(imageHandle.single("teamLogo"), createTeam);
router.post("/joinTeam/:code", joinTeam);

router.route("/:teamId").get(checkTeamId, doesHeBelong, getTeam);
router
  .route("/:teamId/members/:relationId")
  .delete(checkTeamId, doesHeBelong, requireOwner, kickUserFromTeam)
  .patch(checkTeamId, doesHeBelong, requireOwner, changeRole);

export default router;
