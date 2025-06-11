import { Response, NextFunction } from "express";
import { IRequest } from "../types/generalTypes";
import passport from "./authhandler";
import { User as userType } from "@prisma/client";
import { Profile } from "passport-google-oauth20";
export function catchReqAsync(
  fn: (req: IRequest, res: Response, next: NextFunction) => any
) {
  return (req: IRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error: Error) => next(error));
  };
}

export function catchAuthAsync(
  fn: (
    req: IRequest,
    accessToken: any,
    refreshToken: any,
    profile: Profile,
    done: any
  ) => any
) {
  return (
    req: IRequest,
    accessToken: any,
    refreshToken: any,
    profile: Profile,
    done: any
  ) => {
    fn(req, accessToken, refreshToken, profile, done).catch((error: Error) => {
      done(error);
    });
  };
}

export function authenticateAsync(
  req: IRequest,
  res: Response,
  next: NextFunction,
  type: string
) {
  return new Promise((resolve, reject) => {
    passport.authenticate(type, (error: any, user: userType, info: any) => {
      if (error) {
        return reject(error);
      }
      if (!user) {
        return reject(new Error("Authentication failed"));
      }
      resolve(user);
    })(req, res, next);
  });
}

export function loginAsync(req: IRequest, user: userType) {
  return new Promise((resolve, reject) => {
    req.login(user, (error: any) => {
      if (error) {
        return reject(error);
      }
      resolve(user);
    });
  });
}
