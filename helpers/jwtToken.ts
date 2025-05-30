import JWT, { Secret } from "jsonwebtoken";
import { UserObject } from "../types/userTypes";
import { Request, Response } from "express";
const generateJWT = (userId: string): string => {
  return JWT.sign(
    { id: userId },
    process.env.JWT_SECRET as Secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    } as JWT.SignOptions
  );
};

const signTokens = async (user: UserObject, res: Response) => {
  const token = generateJWT(user.user.id);
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN || "2592000000")
    ), // Default to 30 days
  });
  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export default signTokens;
