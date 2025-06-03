import bcrypt from "bcrypt";
import { User, User as userType } from "@prisma/client";

export type createUserType = {
  username: string;
  email: string;
  password: string;
};
export type loginUserType = {
  identifier: string;
  password: string;
};

export type updateUserType = {
  username?: string;
  email?: string;
  password?: string;
  newPassword?: string;
  photo?: string;
  updatedPasswordAt?: Date;
};

export type partialUser = {
  id: string;
  username: string;
  email: string;
  photo: string | null;
};

export type UserWithoutPassowrd = Omit<User, "password">;
