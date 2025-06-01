import { PrismaClient, User as userType } from "@prisma/client";
import { createUserType, loginUserType } from "../types/userTypes";
import UserService from "./user.service";
import appError from "../helpers/appError";
const User = new PrismaClient().user;
import bcrypt from "bcrypt";
import { checkEncryption } from "../helpers/checkEncryption";
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
  static async localLogin(userData: loginUserType): Promise<userType> {
    // Check if user exists
    const user: userType | null = await User.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      throw new appError("Invalid Email or password", 401, "ValidationError");
    }

    // Check password

    if (!(await checkEncryption(userData.password, user.password as string))) {
      throw new appError("Invalid Email or password", 401, "ValidationError");
    }

    return user;
  }
}
