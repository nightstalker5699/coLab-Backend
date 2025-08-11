import { IUser } from "../types/entitiesTypes";
import client from "../middlewares/prisma/user.middleware";
import passport from "passport";
import { Response, NextFunction } from "express";
import { IRequest } from "../types/generalTypes";
import { authenticateAsync, catchReqAsync, loginAsync } from "./catchAsync";
import appError from "./appError";
import {
  localSignin,
  googleSignin,
  githubSignin,
} from "../controllers/authController";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const User = client.user;

// Importing the authentication strategies
passport.use(localSignin);
passport.use(googleSignin);
passport.use(githubSignin);

// Serializing and deserializing user instances to and from the session
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser(async (user: any, done) => {
  done(null, user);
});

// Function to handle authentication Irequests
export const authhandler = (authType: string) => {
  return catchReqAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const auth = await authenticateAsync(req, res, next, authType);
      if (
        auth instanceof appError ||
        auth instanceof PrismaClientKnownRequestError
      ) {
        return next(auth);
      }
      await loginAsync(req, auth as IUser);
      if (req.query.type === "frontend") {
        res.status(200).json({
          status: "success",
        });
      } else {
        res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
      }
    }
  );
};

export default passport;
