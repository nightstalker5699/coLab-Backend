import Express from "express";
import {
  doesHeBelong,
  requirePermission,
} from "../middlewares/teamsValidation.middleware";
import { imageHandle, imageToBody } from "../helpers/image.handle";
import { createTask, getTasks } from "../controllers/taskController";

const router = Express.Router({ mergeParams: true });

router
  .route("/")
  .get(doesHeBelong, getTasks)
  .post(
    doesHeBelong,
    requirePermission("LEADER", "OWNER"),
    imageHandle.single("attachedFile"),
    imageToBody("attachedFile", "teams"),
    createTask
  );

export default router;
