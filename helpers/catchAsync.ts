import { Request, Response, NextFunction } from "express";

export function catchReqAsync(
  fn: (req: Request, res: Response, next: NextFunction) => any
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error: Error) => next(error));
  };
}
