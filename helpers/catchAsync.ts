import { Request, Response, NextFunction } from "express";
import passport from "./authhandler";
import { User as userType } from "@prisma/client";
export function catchReqAsync(
  fn: (req: Request, res: Response, next: NextFunction) => any
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error: Error) => next(error));
  };
}

export function authenticateAsync(
  req: Request,
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

export function loginAsync(req: Request, user: userType) {
  return new Promise((resolve, reject) => {
    req.login(user, (error: any) => {
      if (error) {
        return reject(error);
      }
      resolve(user);
    });
  });
}
