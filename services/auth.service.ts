import { PrismaClient, User } from "@prisma/client";
import {
  Usertype,
  UserObject,
  createUserType,
  loginUserType,
} from "../types/userTypes";
import appError from "../helpers/appError";
const User = new PrismaClient().user;
import bcrypt from "bcrypt";
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
  static async signup(userData: createUserType): Promise<UserObject> {
    // Check if user already exists
    const existingUser = await User.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new appError(
        "User already exists with this email",
        400,
        "ValidationError"
      );
    }

    userData.password = await bcrypt.hash(userData.password, 12);
    // Create new user
    const user = await User.create({
      data: userData,
    });

    return new UserObject(user);
  }
  static async login(userData: loginUserType): Promise<UserObject> {
    // Check if user exists
    const found: Usertype | null = await User.findUnique({
      where: { email: userData.email },
    });

    if (!found) {
      throw new appError("Invalid Email or password", 401, "ValidationError");
    }

    // Check password
    const userObj = new UserObject(found);
    if (!(await userObj.comparePasswords(userData.password))) {
      throw new appError("Invalid Email or password", 401, "ValidationError");
    }

    return userObj;
  }
}
