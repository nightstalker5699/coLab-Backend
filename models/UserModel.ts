import { PrismaClient } from "@prisma/client";
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
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt?: Date | null;
  constructor(data: Usertype) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedPasswordAt;
  }
  async comparePasswords(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }
}
