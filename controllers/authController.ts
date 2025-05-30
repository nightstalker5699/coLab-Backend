import { Request, Response, NextFunction } from "express";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import AuthService from "../services/auth.service";
import {
  UserObject,
  Usertype,
  createUserType,
  loginUserType,
} from "../types/userTypes";
import { RequestWithUser, DecodedToken } from "../types/generalTypes";
import signTokens from "../helpers/jwtToken";
import jwt from "jsonwebtoken";

/**
 * @desc User signup controller
 * @route POST /api/signup
 * @access Public
 */
export const signup = catchReqAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userData: createUserType = req.body;
    const { email, password } = userData;
    // Validate email format
    if (!email || !email.includes("@"))
      throw new appError("Valid email is required", 400, "ValidationError");

    // Validate password strength
    if (!password || password.length < 6)
      throw new appError(
        "Password must be at least 6 characters",
        400,
        "ValidationError"
      );

    const newUser = await AuthService.signup(userData);
    signTokens(newUser, res);
  }
);

/**
 * @desc User login controller
 * @route POST /api/login
 * @access Public
 */

export const login = catchReqAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userData: loginUserType = req.body;
    if (!userData.email || !userData.password) {
      return next(new appError("Email and password are required", 400));
    }
    const userObj: UserObject = await AuthService.login(userData);
    // Sign tokens and send response
    signTokens(userObj, res);
  }
);
