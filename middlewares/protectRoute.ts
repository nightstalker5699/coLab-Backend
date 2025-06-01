import { Request, Response, NextFunction } from "express";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import { PrismaClient, User as userType } from "@prisma/client";
import { UserObject } from "../types/userTypes";
import { RequestWithUser, DecodedToken } from "../types/generalTypes";
import jwt from "jsonwebtoken";
const User = new PrismaClient().user;

export const protect = catchReqAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Check for token in Authorization header first
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // If no Authorization header, check for token in cookies
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    // If no token found in either location
    if (!token) {
      return next(new appError("You are not logged in", 401));
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;
    const currentUser: userType | null = await User.findUnique({
      where: { id: decoded.id },
    });
    if (!currentUser) {
      return next(new appError("User not found", 404, "ValidationError"));
    }
    // Check if user changed password after the token was issued
    const userObj = new UserObject(currentUser);
    if (!userObj.compareDates(decoded)) {
      return next(new appError("Password changed, please log in again", 401));
    }

    // Attach user to request object

    req.user = userObj;
    next();
  }
);
