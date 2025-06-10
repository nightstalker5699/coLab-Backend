import teamService from "../services/team.service";
import { catchReqAsync } from "../helpers/catchAsync";
import AppError from "../helpers/appError";
import { Request, Response, NextFunction } from "express";
import { Iuser, IuserInTeam } from "../types/entitiesTypes";
import { createTeamType } from "../types/teamTypes";

export const createTeam = catchReqAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: createTeamType = req.body;
    if (!data.teamData.teamName) {
      return next(
        new AppError("you must insert a team", 400, "ValidationError")
      );
    }
    const team = await teamService.createTeam(req.user as Iuser, data);
    if (data.members) {
      const rows: IuserInTeam[] = data.members.map((row) => {
        return { userId: row, teamId: team.id } as IuserInTeam;
      });
      await teamService.addMembers(team, rows);
    }
    res.status(200).json({
      status: "success",
      data: team,
    });
  }
);

export const getMyTeams = catchReqAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: "success",
      data: {
        teams: req.user?.userInTeams,
      },
    });
  }
);
