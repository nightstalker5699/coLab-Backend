import { Response, NextFunction } from "express";
import { catchReqAsync, loginAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import AuthService from "../services/auth.service";
import { createUserType } from "../types/userTypes";
import { Strategy as githubStrategy } from "passport-github2";
import { Strategy as googleStrategy } from "passport-google-oauth20";
import { Strategy as localStrategy } from "passport-local";
import { IRequest } from "../types/generalTypes";
export const signup = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const userData: createUserType = req.body;
    const { email, password, username } = userData;
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
    if (!username || username.length === 0 || username.includes(" ")) {
      throw new appError(
        "Username is required and cannot contain spaces",
        400,
        "ValidationError"
      );
    }

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
