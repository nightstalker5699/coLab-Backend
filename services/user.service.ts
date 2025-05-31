import { Prisma, PrismaClient, User as userType } from "@prisma/client";
import {
  UserObject,
  createUserType,
  loginUserType,
  updateUserType,
} from "../types/userTypes";
import appError from "../helpers/appError";
import { catchReqAsync } from "../helpers/catchAsync";
import { Response } from "express";
import { RequestWithUser } from "../types/generalTypes";
import bcrypt from "bcrypt";
const User = new PrismaClient().user;
export default class UserService {
  static async checkUsed(query: Prisma.UserCountArgs): Promise<boolean> {
    return (await User.count(query)) > 0;
  }
  static async getUser(username: string): Promise<UserObject> {
    const user: userType | null = await User.findUnique({
      where: { username: username },
    });
    if (!user) {
      throw new appError("User not found", 404, "NotFoundError");
    }
    user.password = ""; // Don't return password
    return new UserObject(user);
  }

  static async updateUser(
    userObj: UserObject,
    data: updateUserType
  ): Promise<UserObject> {
    if (
      data.email &&
      (await UserService.checkUsed({ where: { email: data.email } }))
    ) {
      throw new appError(
        "email already taken , use another",
        400,
        "ValidationError"
      );
    }
    if (
      data.username &&
      (await UserService.checkUsed({ where: { username: data.username } }))
    ) {
      throw new appError(
        "username already taken , use another",
        400,
        "ValidationError"
      );
    }
    if (data.newPassword) {
      if (!data.password) {
        throw new appError(
          "you must provide the old password to change it",
          400,
          "ValidationError"
        );
      }
      if (!(await userObj.comparePasswords(data.password as string))) {
        throw new appError(
          "the old password is incorrect",
          400,
          "ValidationError"
        );
      }
      data.password = bcrypt.hashSync(data.newPassword, 12);
      data.updatedPasswordAt = new Date(Date.now());
      delete data.newPassword;
    }
    const updated: userType = await User.update({
      where: { id: userObj.user.id },
      data,
    });
    return new UserObject(updated);
  }
  static async deleteUser(userId: string): Promise<UserObject> {
    const deletedUser: userType = await User.update({
      where: {
        id: userId,
      },
      data: {
        isdeleted: true,
      },
    });
    return new UserObject(deletedUser);
  }
}
