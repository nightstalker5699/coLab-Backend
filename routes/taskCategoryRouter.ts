import express from "express";
import {
  checkId,
  doesHeBelong,
  requirePermission,
} from "../middlewares/teamsValidation.middleware";
import {
  createTaskCategory,
  updateTaskCategory,
} from "../controllers/taskCategoryController";
import client from "../middlewares/prisma/user.middleware";
const router = express.Router({
  mergeParams: true,
});

router
  .route("/")
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
    checkId("taskCategoryId", client.taskCategory, "taskCategory"),
    updateTaskCategory
  );
export default router;
