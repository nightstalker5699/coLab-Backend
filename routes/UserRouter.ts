import {
  deleteMe,
  deleteUser,
  updateMe,
  updateUser,
  getMe,
  getUser,
  getUsers,
} from "../controllers/userController";

import { Router } from "express";
import { imageHandle } from "../helpers/image.handle";

const UserRouter = Router();

UserRouter.route("/me").get(getMe).patch(updateMe).delete(deleteMe);
UserRouter.route("/mention").get(getUsers);
UserRouter.route("/:username")
  .get(getUser)
  .patch(imageHandle.single("profile"), updateUser)
  .delete(deleteUser);
export default UserRouter;
