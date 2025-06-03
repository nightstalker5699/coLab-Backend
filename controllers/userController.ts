import { Request, Response, NextFunction } from "express";
import { catchReqAsync, loginAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import userService from "../services/user.service";
import { partialUser, updateUserType } from "../types/userTypes";
import { User as userType } from "@prisma/client";

export const getMe = catchReqAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
      status: "sucess",
      data: { user: req.user },
    });
  }
);

export const getUser = catchReqAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.username) {
      return next(
        new appError("you must use characters", 400, "ValidationError")
      );
    }
    const userObj: userType = await userService.getUser({
      where: { username: req.params.username },
    });

    res.status(200).json({
      status: "success",
      data: { user: userObj },
    });
  }
);

export const updateMe = catchReqAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const theUpdate: updateUserType = req.body;
    if (!theUpdate) {
      return next(
        new appError("you can't update nothing", 400, "ValidationError")
      );
    }
    const userObj: userType = await userService.updateUser(
      req.user as userType,
      theUpdate
    );
    await loginAsync(req, userObj);
    res.status(200).json({
      status: "success",
      data: { user: userObj },
    });
  }
);

export const updateUser = catchReqAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
    const user: userType = await userService.getUser({
      where: { username: req.params.username },
      omit: { password: false },
    });
    console.log(user);
    const userObj: userType = await userService.updateUser(user, theUpdate);

    res.status(200).json({
      status: "success",
      data: { user: userObj },
    });
  }
);
export const deleteMe = catchReqAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await userService.deleteUser(req.user?.id as string);
    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const deleteUser = catchReqAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
    const user: userType = await userService.getUser({
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
  async (req: Request, res: Response, next: NextFunction) => {
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
