import { DecodedToken } from "../types/generalTypes";
import bcrypt from "bcrypt";
import { User as userType } from "@prisma/client";

export class UserObject {
  user: userType;
  constructor(data: userType) {
    this.user = data;
  }
  async comparePasswords(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.user.password);
  }
  compareDates(tokenDate: DecodedToken): boolean {
    if (!this.user.updatedPasswordAt) return true;
    const tokenDateString = new Date(tokenDate.iat! * 1000);
    return this.user.updatedPasswordAt < tokenDateString;
  }
}

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
