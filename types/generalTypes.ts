import { Request } from "express";
import jwt from "jsonwebtoken";
import { UserObject } from "./userTypes";

export interface RequestWithUser extends Request {
  user?: UserObject;
}

export interface DecodedToken extends jwt.JwtPayload {
  id: string;
}
