import { Request, Response, NextFunction } from "express";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";

export const protect = catchReqAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return next(new appError("You are not logged in", 401, "AuthError"));
    }
    next();
  }
);
