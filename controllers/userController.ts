import { Request, Response, NextFunction } from "express";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import userService from "../services/user.service";
import { UserObject, updateUserType } from "../types/userTypes";
import { RequestWithUser, DecodedToken } from "../types/generalTypes";
import { User as userType } from "@prisma/client";
export const getMe = catchReqAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    req.params.username = req.user?.user.username || "";
    next();
  }
);

export const getUser = catchReqAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.params.username) {
      return next(
        new appError("you must use characters", 400, "ValidationError")
      );
    }
    const userObj: UserObject = await userService.getUser(req.params.username);

    res.status(200).json({
      status: "success",
      data: { user: userObj.user },
    });
  }
);

export const updateMe = catchReqAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const theUpdate: updateUserType = req.body;
    if (!theUpdate) {
      return next(
        new appError("you can't update nothing", 400, "ValidationError")
      );
    }
    const userObj: UserObject = await userService.updateUser(
      req.user as UserObject,
      theUpdate
    );

    res.status(200).json({
      status: "success",
      data: { user: userObj.user },
    });
  }
);

export const updateUser = catchReqAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const theUpdate: updateUserType = req.body;
    if (!theUpdate) {
      return next(
        new appError("you can't update nothing", 400, "ValidationError")
      );
    }
    if (req.user?.user.role !== "ADMIN") {
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
    const user: UserObject = await userService.getUser(req.params.username);

    const userObj: UserObject = await userService.updateUser(user, theUpdate);

    res.status(200).json({
      status: "success",
      data: { user: userObj.user },
    });
  }
);
export const deleteMe = catchReqAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    await userService.deleteUser(req.user?.user.id as string);
    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const deleteUser = catchReqAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (req.user?.user.role !== "ADMIN") {
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
    const user: UserObject = await userService.getUser(req.params.username);
    await userService.deleteUser(user.user.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
