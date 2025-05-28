import { PrismaClient } from "@prisma/client";
import { DecodedToken } from "../controllers/authController";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

export const User = prisma.$extends({
  query: {
    user: {
      async create({ model, args, operation, query }) {
        args.data.password = await bcrypt.hash(args.data.password, 10);
        return query(args);
      },
    },
  },
}).user;

export type Usertype = {
  id: string;
  email: string;
  password: string;
  name?: string;
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
