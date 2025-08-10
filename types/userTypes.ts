import bcrypt from "bcrypt";
import { User, User as userType } from "@prisma/client";
import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9]/, "please do not use any special characters"),
  email: z.string().email("please insert valid email"),
  password: z.string().min(6, "the password must have 6 or more characters"),
});

export type createUserType = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1)
    .refine((val) => {
      const isEmail = z
        .string()
        .email("please insert valid email")
        .safeParse(val).success;
      const isUsername = /^[a-zA-Z0-9]/.test(val);

      return isEmail || isUsername;
    }, "Must be a valid username or email "),
  password: z.string().min(6, "password Must be 6 or more characters"),
});

export type loginUserType = z.infer<typeof loginSchema>;

export const updateUserSchema = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9]/, "please do not use any special characters")
    .optional(),
  email: z.string().email().optional(),
  password: z
    .string()
    .min(6, "you must use 6 or more charcters for password")
    .optional(),
  newpassword: z
    .string()
    .min(6, "you must use 6 or more charcters for your new password")
    .optional(),
  photo: z.string().optional(),
  updatedPasswordAt: z.date().optional(),
});

export type updateUserType = z.infer<typeof updateUserSchema>;

export type partialUser = {
  id: string;
  username: string;
  email: string;
  photo: string | null;
};

export type UserWithoutPassowrd = Omit<User, "password">;

export const default_photo = `${process.env.R2_BUCKET_PUBLIC_URL}/images/default.jpg`;
