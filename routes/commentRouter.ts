import Express from "express";
import {
  checkId,
  doesHeBelong,
} from "../middlewares/teamsValidation.middleware";
import { imageHandle, imageToBody } from "../helpers/image.handle";
import {
  createComment,
  deleteComment,
  updateComment,
} from "../controllers/commentController";

const router = Express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    checkId("teamId"),
    checkId("taskId"),
    doesHeBelong,
    imageHandle.single("attachedFile"),
    imageToBody("attachedFile", "teams"),
    createComment
  );
router
  .route("/:commentId")
  .patch(
    checkId("teamId"),
    checkId("taskId"),
    checkId("commentId"),
    doesHeBelong,
    imageHandle.single("attachedFile"),
    imageToBody("attachedFile", "teams"),
    updateComment
  )
  .delete(
    checkId("teamId"),
    checkId("taskId"),
    checkId("commentId"),
    doesHeBelong,
    deleteComment
  );

export default router;
