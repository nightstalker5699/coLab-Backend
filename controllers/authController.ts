import { Request, Response, NextFunction } from "express";
import catchAsync from "../helpers/catchAsync";
import appError from "../helpers/appError";
import { User, UserObject, Usertype } from "../models/UserModel";
import signTokens from "../helpers/jwtToken";
import jwt from "jsonwebtoken";
import { promisify } from "util";

export interface RequestWithUser extends Request {
  user?: UserObject;
}

export interface DecodedToken extends jwt.JwtPayload {
  id: string;
}

/**
 * @desc User signup controller
 * @route POST /api/signup
 * @access Public
 */
export const signup = catchAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const {
      name,
      email,
      password,
    }: { name: string; email: string; password: string } = req.body;

    if (!email || !password) {
      return next(new appError("Email and password are required", 400));
    }
    // Check if user already exists
    const existingUser = await User.findUnique({
      where: { email },
    });
    if (existingUser) {
      return next(new appError("User already exists with this email", 400));
    }
    const newUser: Usertype = await User.create({
      data: {
        email,
        password,
        name,
      },
    });

    signTokens(newUser, res);
  }
);

/**
 * @desc User login controller
 * @route POST /api/login
 * @access Public
 */

export const login = catchAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { email, password }: { email: string; password: string } = req.body;
    if (!email || !password) {
      return next(new appError("Email and password are required", 400));
    }
    // Check if user exists
    const found: Usertype | null = await User.findUnique({
      where: { email },
    });

    if (!found) {
      return next(new appError("User not found with this email", 404));
    }

    // Check password
    const userObj = new UserObject(found);
    if (!(await userObj.comparePasswords(password))) {
      return next(new appError("Incorrect password", 401));
    }
    // Sign tokens and send response
    signTokens(userObj.user, res);
  }
);

export const protect = catchAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    let token: string;

    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      return next(new appError("You are not logged in", 401));
    }
    token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;
    const cuurrentUser: Usertype | null = await User.findUnique({
      where: { id: decoded.id },
    });
    if (!cuurrentUser) {
      return next(new appError("User not found", 404));
    }
    // Check if user changed password after the token was issued
    const userObj = new UserObject(cuurrentUser);
    if (!userObj.compareDates(decoded)) {
      return next(new appError("Password changed, please log in again", 401));
    }

    // Attach user to request object

    req.user = userObj;
    next();
  }
);
