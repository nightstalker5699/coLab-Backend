import { PrismaClient, User as userType } from "@prisma/client";
import { createUserType, loginUserType } from "../types/userTypes";
import UserService from "./user.service";
import appError from "../helpers/appError";
const User = new PrismaClient().user;
import bcrypt from "bcrypt";
import { checkEncryption } from "../helpers/checkEncryption";
import { catchAuthAsync } from "../helpers/catchAsync";
/**
 * @desc AuthService for handling user authentication
 * @class AuthService
 * @static
 * @method signup - Registers a new user
 * @param {createUserType} userData - The user data for registration
 * @throws {appError} - Throws an error if the user already exists
 * @return {Promise<UserObject>} - Returns a promise that resolves to a UserObject
 * @method login - Logs in an existing user
 * @param {loginUserType} userData - The user data for login
 * @throws {appError} - Throws an error if the user already exists
 * @return {Promise<UserObject>} - Returns a promise that resolves to a UserObject
 *
 * */

export default class AuthService {
  static async signup(userData: createUserType): Promise<userType> {
    // Check if user already exists

    if (await UserService.checkUsed({ where: { email: userData.email } })) {
      throw new appError(
        "User already exists with this email",
        400,
        "ValidationError"
      );
    }

    if (
      await UserService.checkUsed({ where: { username: userData.username } })
    ) {
      throw new appError(
        "User already exists with this username",
        400,
        "ValidationError"
      );
    }

    userData.password = await bcrypt.hash(userData.password, 12);
    // Create new user
    const user: userType = await User.create({
      data: userData,
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
      const user: userType | null = await User.findFirst({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
      });
      if (!user) {
        return done(new appError("User not Found", 404, "NotFound"), false);
      }
      if (!checkEncryption(password, user.password as string)) {
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
      try {
        console.log("GitHub profile:", profile);
        // Fetch user email from GitHub API
        let email = null;
        const emailResponse = await fetch(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              userAgent: "CoLab",
            },
          }
        );
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
      } catch (error) {
        return done(error);
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
      try {
        console.log("Google profile:", profile);
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
          profile.username = profile.displayName.replace(/\s+/g, "-");
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
      } catch (error) {
        return done(error);
      }
    }
  );
}
