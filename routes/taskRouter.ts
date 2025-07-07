import Express from "express";
import {
  addToReq,
  checkId,
  doesHeBelong,
  requirePermission,
} from "../middlewares/teamsValidation.middleware";
import { imageHandle, imageToBody } from "../helpers/image.handle";
import {
  changeTaskStatus,
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from "../controllers/taskController";
const router = Express.Router({ mergeParams: true });

router
  .route("/")
  .get(checkId("teamId"), doesHeBelong, getTasks)
  .post(
    checkId("teamId"),
    doesHeBelong,
    requirePermission("LEADER", "OWNER"),
    imageHandle.single("attachedFile"),
    imageToBody("attachedFile", "teams"),
    createTask
  );
router
  .route("/:taskId/status")
  .patch(checkId("teamId"), checkId("taskId"), doesHeBelong, changeTaskStatus);

router
  .route("/:taskId")
  .get(checkId("teamId"), checkId("taskId"), doesHeBelong, getTask)
  .patch(
    checkId("teamId"),
    checkId("taskId"),
    doesHeBelong,
    requirePermission("LEADER", "OWNER"),
    imageHandle.single("attachedFile"),
    imageToBody("attachedFile", "teams"),
    updateTask
  )
  .delete(
    checkId("teamId"),
    checkId("taskId"),
    doesHeBelong,
    requirePermission("LEADER", "OWNER"),
    deleteTask
  );

export default router;
