import express from "express";
import {
  checkId,
  doesHeBelong,
  requirePermission,
} from "../middlewares/teamsValidation.middleware";
import {
  createTaskCategory,
  getAllTaskCategory,
  updateTaskCategory,
} from "../controllers/taskCategoryController";
import client from "../middlewares/prisma/user.middleware";
const router = express.Router({
  mergeParams: true,
});

router
  .route("/")
  .get(checkId("teamId", client.team, "team"), doesHeBelong, getAllTaskCategory)
  .post(
    checkId("teamId", client.team, "team"),
    doesHeBelong,
    requirePermission("LEADER", "OWNER"),
    createTaskCategory
  );

router
  .route("/:taskCategoryId")
  .patch(
    checkId("teamId", client.team, "team"),
    doesHeBelong,
    requirePermission("LEADER", "OWNER"),
    updateTaskCategory
  )
  .delete(
    checkId("teamId", client.team, "team"),
    doesHeBelong,
    requirePermission("LEADER", "OWNER"),
    updateTaskCategory
  );
export default router;
