import express from "express";
import {
  changeRole,
  createTeam,
  getMyTeams,
  getTeam,
  joinTeam,
  kickUserFromTeam,
  updateMyTeam,
} from "../controllers/teamController";
import {
  checkTeamId,
  doesHeBelong,
  requireOwner,
} from "../middlewares/teamsValidation.middleware";
import { imageHandle, imageToBody } from "../helpers/image.handle";
const router = express.Router();

router.route("/").get(getMyTeams).post(createTeam);
router.post("/joinTeam/:code", joinTeam);

router
  .route("/:teamId")
  .get(checkTeamId, doesHeBelong, getTeam)
  .patch(
    checkTeamId,
    doesHeBelong,
    requireOwner,
    imageHandle.single("teamLogo"),
    imageToBody("teamLogo", "teamLogos"),
    updateMyTeam
  );
router
  .route("/:teamId/members/:relationId")
  .delete(checkTeamId, doesHeBelong, requireOwner, kickUserFromTeam)
  .patch(checkTeamId, doesHeBelong, requireOwner, changeRole);

export default router;
