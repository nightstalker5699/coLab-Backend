import express from "express";
import {
  addToReq,
  checkId,
  doesHeBelong,
  requirePermission,
} from "../middlewares/teamsValidation.middleware";
import {
  createTaskCategory,
  deleteTaskCategory,
  getAllTaskCategory,
  updateTaskCategory,
} from "../controllers/taskCategoryController";
const router = express.Router({
  mergeParams: true,
});

router
  .route("/")
  .get(checkId("teamId"), doesHeBelong, getAllTaskCategory)
  .post(
    checkId("teamId"),
    doesHeBelong,
    requirePermission("LEADER", "OWNER"),
    createTaskCategory
  );

router
  .route("/:taskCategoryId")
  .patch(
    checkId("teamId"),
    checkId("taskCategoryId"),
    doesHeBelong,
    requirePermission("LEADER", "OWNER"),

    updateTaskCategory
  )
  .delete(
    checkId("teamId"),
    checkId("taskCategoryId"),
    doesHeBelong,
    requirePermission("LEADER", "OWNER"),
    deleteTaskCategory
  );
export default router;
