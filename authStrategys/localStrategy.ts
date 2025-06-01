import { Strategy as localStrategy } from "passport-local";
import { PrismaClient, User as userType } from "@prisma/client";
import { checkEncryption } from "../helpers/checkEncryption";
import AppError from "../helpers/appError";
const User = new PrismaClient().user;
const strategy: localStrategy = new localStrategy(
  {
    usernameField: "identifier",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (req, identifier, password, done) => {
    try {
      const user: userType | null = await User.findFirst({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
      });
      if (!user) {
        return done(new AppError("User not Found", 404, "NotFound"), false);
      }
      if (!checkEncryption(password, user.password as string)) {
        return done(
          new AppError("password is incorrect", 401, "ValidationError"),
          false
        );
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);

export default strategy;
