import bcrypt from "bcrypt";
import { User as userType } from "@prisma/client";

export type createUserType = {
  username: string;
  email: string;
  password: string;
};
export type loginUserType = {
  email: string;
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
