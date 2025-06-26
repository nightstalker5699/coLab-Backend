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
    checkId("teamId", client.team, "team"),
    doesHeBelong,
    requirePermission("OWNER"),
    imageHandle.single("teamLogo"),
    imageToBody("teamLogo", "teamLogos"),
    updateMyTeam
  )
  .delete(
    checkId("teamId", client.team, "team"),
    doesHeBelong,
    requirePermission("OWNER"),
    deleteTeam
  );
router
  .route("/:teamId/members/:relationId")
  .delete(
    checkId("teamId", client.team, "team"),
    doesHeBelong,
    requirePermission("OWNER"),
    kickUserFromTeam
  )
  .patch(
    checkId("teamId", client.team, "team"),
    doesHeBelong,
    requirePermission("OWNER"),
    changeRole
  );
router.delete(
  "/:teamId/leave",
  checkId("teamId", client.team, "team"),
  doesHeBelong,
  leaveTeam
);
router.patch(
  "/:teamId/transferownership",
  checkId("teamId", client.team, "team"),
  doesHeBelong,
  transferOwnership
);
router.use("/:teamId/taskCategories", taskCategoryRouter);

export default router;
