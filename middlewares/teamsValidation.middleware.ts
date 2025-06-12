import { Response, NextFunction } from "express";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import { IRequest } from "../types/generalTypes";
import TeamService from "../services/team.service";
import { ITeam } from "../types/entitiesTypes";
import { validateId } from "../helpers/ValidateInput";
import { ZodError } from "zod";

export const checkTeamId = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { teamId } = req.params;
    if (!teamId || (await validateId.safeParseAsync(teamId)).success == false) {
      return next(new appError("invalid team id", 400));
    }
    const team = await TeamService.getTeam(teamId, {});
    req.team = team;
    next();
  }
);

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

export const requireOwner = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    if (req.userInTeam?.role !== "OWNER") {
      return next(
        new appError(
          "you can't use this action without the owner permissions",
          401
        )
      );
    }
    next();
  }
);
