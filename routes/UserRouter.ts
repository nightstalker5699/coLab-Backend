import {
  deleteMe,
  deleteUser,
  updateMe,
  updateUser,
  getMe,
  getUser,
  getUsers,
  getStats,
} from "../controllers/userController";

import { Router } from "express";
import { imageHandle, imageToBody } from "../helpers/image.handle";
import { restrictTo } from "../middlewares/protectRoute";

const UserRouter = Router();

UserRouter.route("/me")
  .get(getMe)
  .patch(imageHandle.single("photo"), imageToBody("photo", "images"), updateMe)
  .delete(deleteMe);
UserRouter.route("/mention").get(getUsers);
UserRouter.route("/:username")
  .get(getUser)
  .patch(
    restrictTo("ADMIN"),
    imageHandle.single("photo"),
    imageToBody("photo", "images"),
    updateUser
  )
  .delete(restrictTo("ADMIN"), deleteUser);

UserRouter.route("/me/stats").get(getStats);

export default UserRouter;
