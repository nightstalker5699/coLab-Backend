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

const User = client.user;

// Importing the authentication strategies
passport.use(localSignin);
passport.use(googleSignin);
passport.use(githubSignin);

// Serializing and deserializing user instances to and from the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user: IUser = (await User.findUnique({
      where: { id },
    })) as IUser;
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Function to handle authentication Irequests
export const authhandler = (authType: string) => {
  return catchReqAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const auth = await authenticateAsync(req, res, next, authType);
      if (auth instanceof appError) {
        return next(auth);
      }
      await loginAsync(req, auth as IUser);
      res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
    }
  );
};

export default passport;
