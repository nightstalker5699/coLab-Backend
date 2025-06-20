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
    (req.user as any).password = null;
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
    let photo;
    if (req.body.photo) {
      photo = await fileuploader(req.file, req.body.photo, "images");
      req.body.photo = `${process.env.R2_BUCKET_PUBLIC_URL}/${photo.key}`;
    }
    const data = ValidateInput(req.body, updateUserSchema);

    const userObj: IUser = await userService.updateUser(
      req.user as IUser,
      data
    );
    await photo?.client.send(photo.command);
    if (
      req.user?.photo !== process.env.DEFAULT_PFP &&
      req.user?.photo !== userObj.photo
    ) {
      await fileRemover(req.user?.photo.split("/").pop() as string, "images");
    }
    await loginAsync(req, userObj);
    res.status(200).json({
      status: "success",
      data: { user: userObj },
    });
  }
);

export const updateUser = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    if (!req.params.username) {
      return next(
        new appError("you must use characters", 400, "ValidationError")
      );
    }
    let photo;
    if (req.body.photo) {
      photo = await fileuploader(req.file, req.body.photo, "images");
      req.body.photo = `${process.env.R2_BUCKET_PUBLIC_URL}/${photo.key}`;
    }
    const data = ValidateInput(req.body, updateUserSchema);

    const user = await userService.getUser({
      where: { username: req.params.username },
      omit: { password: false },
    });

    const userObj: IUser = await userService.updateUser(user, data);

    await photo?.client.send(photo.command);

    if (
      user.photo !== process.env.DEFAULT_PFP &&
      user.photo !== userObj.photo
    ) {
      await fileRemover(user.photo.split("/").pop() as string, "images");
    }

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
    const username = req.query.username;
    if (!username) {
      return next(
        new appError("you must insert characters", 400, "ValidationError")
      );
    }
    const users: partialUser[] = await userService.getUsersName(
      username as string
    );
    console.log(users);
    res.json({
      status: "sucess",
      data: users,
    });
  }
);
