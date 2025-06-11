import { Response, NextFunction } from "express";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import { PrismaClient, User as userType } from "@prisma/client";
import { promisify } from "util";
import { IRequest } from "../types/generalTypes";

const user = new PrismaClient().user;

export const protect = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return next(new appError("You are not logged in", 401, "AuthError"));
    }
    next();
  }
);

export const validateSession = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }
    const currentuser = await user.findUnique({
      where: { id: (req.user as userType).id },
    });
    if (!currentuser) {
      await promisify(req.logOut.bind(req))();
      return next(new appError("Session is invalid", 401, "AuthError"));
    }

    next();
  }
);
