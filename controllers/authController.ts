import { Response, NextFunction } from "express";
import { catchReqAsync, loginAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import AuthService from "../services/auth.service";
import { createUserType, signupSchema } from "../types/userTypes";
import { Strategy as githubStrategy } from "passport-github2";
import { Strategy as googleStrategy } from "passport-google-oauth20";
import { Strategy as localStrategy } from "passport-local";
import { IRequest } from "../types/generalTypes";
import ValidateInput from "../helpers/ValidateInput";
export const signup = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const userData = ValidateInput(req.body, signupSchema);

    const newUser = await AuthService.signup(userData);
    newUser.password = ""; // Don't return password in response
    await loginAsync(req, newUser);
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  }
);

export const githubSignin = new githubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    callbackURL: process.env.GITHUB_REDIRECT_URI || "",
    passReqToCallback: true,
  },
  AuthService.githubLogin
);

export const googleSignin = new googleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_REDIRECT_URI || "",
    passReqToCallback: true,
  },
  AuthService.googleLogin
);

export const localSignin = new localStrategy(
  {
    usernameField: "identifier",
    passwordField: "password",
    passReqToCallback: true,
  },
  AuthService.localLogin
);

export const logout = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) {
        return next(new appError("Logout failed", 500, "ServerError"));
      }
      res.status(200).json({
        status: "success",
        message: "Logged out successfully",
      });
    });
  }
);
