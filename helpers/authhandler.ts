import { PrismaClient, User as userType } from "@prisma/client";
const User = new PrismaClient().user;
import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { authenticateAsync, catchReqAsync, loginAsync } from "./catchAsync";
import appError from "./appError";
import googleStrategy from "../authStrategys/googleStrategy";
import localStrategy from "../authStrategys/localStrategy";
import githubStrategy from "../authStrategys/githubStrategy";

passport.use(githubStrategy);
passport.use(googleStrategy);
passport.use(localStrategy);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user: userType = (await User.findUnique({
      where: { id },
    })) as userType;
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// export const googleAuth = catchReqAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const auth = (await authenticateAsync(
//       req,
//       res,
//       next,
//       "google"
//     )) as userType;
//     await loginAsync(req, auth);
//     res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
//   }
// );

// export const localAuth = catchReqAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const auth = await authenticateAsync(req, res, next, "local");
//     if (auth instanceof appError) {
//       return next(auth);
//     }

//     await loginAsync(req, auth as userType);
//     res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
//   }
// );

export const authhandler = (authType: string) => {
  return catchReqAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const auth = await authenticateAsync(req, res, next, authType);
      if (auth instanceof appError) {
        return next(auth);
      }
      await loginAsync(req, auth as userType);
      res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
    }
  );
};

export default passport;
