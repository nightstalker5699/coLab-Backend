import { Response, NextFunction } from "express";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import { IRequest } from "../types/generalTypes";
import TeamService from "../services/team.service";
import z from "zod";
import { Role } from "@prisma/client";

export const checkId = (paramName: string) =>
  catchReqAsync(async (req: IRequest, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    if (!id || !z.string().uuid().safeParse(id).success) {
      console.log(id);
      return next(new appError(`invalid ${paramName}`, 400));
    }
    next();
  });

export const addToReq = (paramName: string, model: any, modelName: string) =>
  catchReqAsync(async (req: IRequest, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const object = await model.findUnique({
      where: {
        id,
      },
    });
    if (!object) {
      return next(new appError(`there is no ${modelName} found`, 404));
    }
    (req as any)[modelName] = object;
    next();
  });

export const doesHeBelong = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const teamId = req.params.teamId as string;

    const relation = await TeamService.getUserRoleInTeam(
      teamId,
      req.user?.id as string
    );
    req.userInTeam = relation;
    next();
  }
);

export const requirePermission = (...teamRoles: Role[]) =>
  catchReqAsync(async (req: IRequest, res: Response, next: NextFunction) => {
    if (!req.userInTeam?.role || !teamRoles.includes(req.userInTeam.role)) {
      return next(
        new appError("you can't use this action without permissions", 401)
      );
    }
    next();
  });
