import { IUser } from "../types/entitiesTypes";
import { Prisma } from "@prisma/client";
import { partialUser, updateUserType } from "../types/userTypes";
import appError from "../helpers/appError";
import { checkEncryption } from "../helpers/checkEncryption";
import client from "../middlewares/prisma/user.middleware";
import bcrypt from "bcrypt";

const User = client.user;

export default class UserService {
  static async checkUsed(query: Prisma.UserCountArgs): Promise<boolean> {
    return (await User.count(query)) > 0;
  }
  static async getUsersName(text: string): Promise<partialUser[]> {
    let users: partialUser[] = await User.findMany({
      where: {
        username: {
          contains: text,
          mode: "insensitive",
        },
      },
      take: 7,
    });
    users = users.map((user) => {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        photo: user.photo,
      };
    });
    return users;
  }
  static async getUser(args: Prisma.UserFindUniqueArgs): Promise<IUser> {
    const user: IUser | null = await User.findUnique(args);
    if (!user) {
      throw new appError("User not found", 404, "NotFoundError");
    }
    return user;
  }

  static async updateUser(
    userObj: IUser,
    data: updateUserType
  ): Promise<IUser> {
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
      if (userObj.password && !data.password) {
        throw new appError(
          "you must provide the old password to change it",
          400,
          "ValidationError"
        );
      }
      if (
        userObj.password &&
        !(await checkEncryption(data.password as string, userObj.password))
      ) {
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
    const updated: IUser = await User.update({
      where: { id: userObj.id },
      data,
    });
    return updated;
  }
  static async deleteUser(userId: string): Promise<IUser> {
    const deletedUser: IUser = await User.update({
      where: {
        id: userId,
      },
      data: {
        isdeleted: true,
      },
    });
    return deletedUser;
  }
  static async updateImg(userId: string, imgUrl: string): Promise<IUser> {
    const updated = await User.update({
      where: {
        id: userId,
      },
      data: {
        photo: imgUrl,
      },
    });
    return updated;
  }
}
