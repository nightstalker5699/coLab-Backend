import { NextFunction, Response } from "express";
import { IRequest } from "../types/generalTypes";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import appError from "./appError";

const UniqueConstraintHandler = (err: PrismaClientKnownRequestError) => {
  const fields = err.meta?.target as string[] | string;
  const field = Array.isArray(fields) ? fields.join(",") : fields;
  return new appError(
    `${field} already exists , please use different value`,
    400
  );
};
const ForeignKeyConstraintHandler = (err: PrismaClientKnownRequestError) => {
  return new appError(
    `Unable to complete operation - one or more referenced items do not exist`,
    400
  );
};

const doesnotExistHandler = (err: PrismaClientKnownRequestError) => {
  return new appError("record do not exists", 400);
};

const sendError = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

export const errorHandler = (
  error: any,
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  (error.statusCode = error.statusCode || 500),
    (error.status = error.status || "error");
  let err = error;
  console.log(error);
  if (error instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        err = UniqueConstraintHandler(err);
        break;
      case "P2003":
        err = ForeignKeyConstraintHandler(err);
        break;
      case "P2025":
        err = doesnotExistHandler(err);
        break;
      default:
        console.log(err);
        err = new appError("Database operation failed", 500);
        break;
    }
  }
  sendError(err, res);
};
