import { Response, NextFunction } from "express";
import { catchReqAsync, loginAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import userService from "../services/user.service";
import {
  partialUser,
  updateUserSchema,
  updateUserType,
} from "../types/userTypes";
import { IUser } from "../types/entitiesTypes";
import { IRequest } from "../types/generalTypes";
import ValidateInput from "../helpers/ValidateInput";
import { fileRemover, fileuploader } from "../helpers/image.handle";
export const getMe = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    return res.status(200).json({
      status: "sucess",
      data: { user: req.user },
    });
  }
);

export const getUser = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    if (!req.params.username) {
      return next(
        new appError("you must use characters", 400, "ValidationError")
      );
    }
    const userObj: IUser = await userService.getUser({
      where: { username: req.params.username },
    });

    res.status(200).json({
      status: "success",
      data: { user: userObj },
    });
  }
);

export const updateMe = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const data = ValidateInput(req.body, updateUserSchema);
    const userObj: IUser = await userService.updateUser(
      req.user as IUser,
      data
    );
    await loginAsync(req, userObj);
    res.status(200).json({
      status: "success",
      data: { user: userObj },
    });
  }
);
export const updateUser = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const theUpdate: updateUserType = req.body;
    if (!theUpdate) {
      return next(
        new appError("you can't update nothing", 400, "ValidationError")
      );
    }
    if (req.user?.role !== "ADMIN") {
      return next(
        new appError(
          "You Don't have permission to update users",
          401,
          "ForbiddenError"
        )
      );
    }
    if (!req.params.username) {
      return next(
        new appError("you must use characters", 400, "ValidationError")
      );
    }
    const user: IUser = await userService.getUser({
      where: { username: req.params.username },
      omit: { password: false },
    });
    console.log(user);
    const userObj: IUser = await userService.updateUser(user, theUpdate);

    res.status(200).json({
      status: "success",
      data: { user: userObj },
    });
  }
);
export const deleteMe = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    await userService.deleteUser(req.user?.id as string);
    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const deleteUser = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "ADMIN") {
      return next(
        new appError(
          "You Don't have permission to delete users",
          401,
          "ForbiddenError"
        )
      );
    }
    if (!req.params.username) {
      return next(
        new appError("you must use characters", 400, "ValidationError")
      );
    }
    const user: IUser = await userService.getUser({
      where: { username: req.params.username },
    });
    await userService.deleteUser(user.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const getUsers = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const username = req.body.username;
    if (!username) {
      return next(
        new appError("you must insert characters", 400, "ValidationError")
      );
    }
    const users: partialUser[] = await userService.getUsersName(username);
    console.log(users);
    res.json({
      status: "sucess",
      data: users,
    });
  }
);
export const updatePhoto = catchReqAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new appError("you must upload an image", 400));
  }

  const key = `${process.env.R2_BUCKET_PUBLIC_URL}/images/${Date.now()}-${
    req.file.originalname
  }`;

  // service to update image link
  const updated = await userService.updateImg(req.user?.id as string, key);

  const img = key.split("/");
  await fileuploader(req.file, img.pop() as string, "images");
  if (
    req.user?.photo !==
    `${process.env.R2_BUCKET_PUBLIC_URL}/images/default.jpeg`
  ) {
    await fileRemover(req.user?.photo as string);
  }
});
