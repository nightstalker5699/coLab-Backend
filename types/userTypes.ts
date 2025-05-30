import { DecodedToken } from "../types/generalTypes";
import bcrypt from "bcrypt";

export type Usertype = {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt?: Date;
  updatedPasswordAt?: Date | null;
};

export class UserObject {
  user: Usertype;
  constructor(data: Usertype) {
    this.user = data;
  }
  async comparePasswords(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.user.password);
  }
  compareDates(tokenDate: DecodedToken): boolean {
    if (!this.user.updatedPasswordAt) return false;
    const tokenDateString = new Date(tokenDate.iat! * 1000);
    return this.user.updatedPasswordAt < tokenDateString;
  }
}

export type createUserType = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};
export type loginUserType = {
  email: string;
  password: string;
};
