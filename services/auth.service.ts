import { IUser } from "../types/entitiesTypes";
import { createUserType, loginSchema, default_photo } from "../types/userTypes";
import UserService from "./user.service";
import appError from "../helpers/appError";
import client from "../middlewares/prisma/user.middleware";
import bcrypt from "bcrypt";
import { checkEncryption } from "../helpers/checkEncryption";
import { catchAuthAsync } from "../helpers/catchAsync";
import ValidateInput from "../helpers/ValidateInput";

const User = client.user;

export default class AuthService {
  static async signup(userData: createUserType): Promise<IUser> {
    // Check if user already exists

    userData.password = await bcrypt.hash(userData.password, 12);
    // Create new user
    const user: IUser = await User.create({
      data: { ...userData, photo: default_photo },
    });
    return user;
  }
  static async localLogin(
    req: any,
    identifier: string,
    password: string,
    done: any
  ) {
    try {
      const data = ValidateInput({ identifier, password }, loginSchema);

      const user: IUser | null = await User.findFirst({
        where: {
          OR: [{ username: data.identifier }, { email: data.identifier }],
        },
        omit: { password: false },
      });
      if (!user || user.password == null) {
        return done(new appError("User not Found", 404, "NotFound"), false);
      }
      if (!(await checkEncryption(data.password, user.password as string))) {
        return done(
          new appError("password is incorrect", 401, "ValidationError"),
          false
        );
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }

  static githubLogin = catchAuthAsync(
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      console.log("GitHub profile:", profile);
      // Fetch user email from GitHub API
      let email = null;
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          userAgent: "CoLab",
        },
      });
      if (emailResponse.ok) {
        const emails: any[] = await emailResponse.json();
        email = emails.find((email) => {
          return email.primary && email.verified;
        });
      }
      const user = await User.findUnique({
        where: { email: email.email },
      });
      if (user) {
        if (!user.githubId) {
          await User.update({
            where: { id: user.id },
            data: {
              githubId: profile.id,
            },
          });
        }
        return done(null, user);
      } else {
        profile.username = profile.displayName.replace(/\s+/g, "-");
        const newUser = await User.create({
          data: {
            username: profile.username,
            email: email.email,
            githubId: profile.id,
            photo: profile.photos[0].value,
          },
        });
        return done(null, newUser);
      }
    }
  );

  static googleLogin = catchAuthAsync(
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      const user = await User.findUnique({
        where: { email: profile.emails[0].value },
      });
      if (user) {
        if (!user.googleId) {
          await User.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
            },
          });
        }
        return done(null, user);
      } else {
        profile.displayName = profile.displayName.replace(/\s+/g, "-");
        const newUser = await User.create({
          data: {
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            photo: profile.photos[0].value,
          },
        });
        return done(null, newUser);
      }
    }
  );
}
