import { Response, NextFunction } from "express";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import { IRequest } from "../types/generalTypes";
import TeamService from "../services/team.service";
import { ITeam } from "../types/entitiesTypes";
import { validateId } from "../helpers/ValidateInput";
import { ZodError } from "zod";
import { Role } from "@prisma/client";

export const checkId = (paramName: string, model: any, modelName: string) =>
  catchReqAsync(async (req: IRequest, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    if (!id || !(await validateId.safeParseAsync(id)).success) {
      console.log(id);
      return next(new appError("invalid id", 400));
    }
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
    const teamId = req.team?.id as string;
    const relation = await TeamService.getUserRoleInTeam(
      teamId,
      req.user?.id as string
    );
    if (!relation) {
      return next(new appError("you don't belong to this team", 401));
    }
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
