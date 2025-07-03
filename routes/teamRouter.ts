import express from "express";
import {
  changeRole,
  createTeam,
  deleteTeam,
  getMyTeams,
  getTeam,
  joinTeam,
  kickUserFromTeam,
  leaveTeam,
  transferOwnership,
  updateMyTeam,
} from "../controllers/teamController";
import {
  checkId,
  doesHeBelong,
  requirePermission,
} from "../middlewares/teamsValidation.middleware";
import { imageHandle, imageToBody } from "../helpers/image.handle";
import taskCategoryRouter from "./taskCategoryRouter";
import taskRouter from "./taskRouter";
import client from "../middlewares/prisma/user.middleware";

const router = express.Router();

router
  .route("/")
  .get(getMyTeams)
  .post(
    imageHandle.single("teamLogo"),
    imageToBody("teamLogo", "teamLogos"),
    createTeam
  );
router.post("/joinTeam/:code", joinTeam);

router
  .route("/:teamId")
  .get(checkId("teamId", client.team, "team"), doesHeBelong, getTeam)
  .patch(
    doesHeBelong,
    requirePermission("OWNER"),
    imageHandle.single("teamLogo"),
    imageToBody("teamLogo", "teamLogos"),
    updateMyTeam
  )
  .delete(doesHeBelong, requirePermission("OWNER"), deleteTeam);
router
  .route("/:teamId/members/:relationId")
  .delete(doesHeBelong, requirePermission("OWNER"), kickUserFromTeam)
  .patch(doesHeBelong, requirePermission("OWNER"), changeRole);
router.delete("/:teamId/leave", doesHeBelong, leaveTeam);
router.patch("/:teamId/transferownership", doesHeBelong, transferOwnership);
router.use("/:teamId/taskCategories", taskCategoryRouter);
router.use("/:teamId/tasks", taskRouter);
export default router;
