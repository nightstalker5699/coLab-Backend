import teamService from "../services/team.service";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import { Response, NextFunction } from "express";
import { ITeam, IUser, IUserInTeam } from "../types/entitiesTypes";
import { changeRoleSchema, CreateTeamSchema } from "../types/teamTypes";
import { z } from "zod";
import { IRequest } from "../types/generalTypes";
import ValidateInput from "../helpers/ValidateInput";

const teamObjectFormatter = (team: ITeam, userId: string) => {
  return {
    teamName: team.teamName,
    teamLogo: team.teamLogo,
    theme: team.theme,
    teamMembers: team.userInTeams?.map((relation) => {
      let user = relation.user;
      return {
        ...user,
        teamRole: relation.role,
        joinAt: relation.joinedAt,
        relationId: relation.id,
        isMe: userId == user?.id ? true : false,
      };
    }),
  };
};

export const createTeam = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const data = ValidateInput(req.body, CreateTeamSchema);

    const team = await teamService.createTeam(req.user as IUser, data);

    if (data.members) {
      const rows: IUserInTeam[] = data.members.map((row) => {
        return { userId: row, teamId: team.id } as IUserInTeam;
      });

      await teamService.addMembers(rows);
    }

    res.status(200).json({
      status: "success",
      data: team,
    });
  }
);

export const getMyTeams = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const teams = await teamService.getMyTeams(req.user?.id as string);

    res.status(200).json({
      status: "success",
      data: {
        teams,
      },
    });
  }
);

export const joinTeam = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { code } = req.params;
    if (z.string().min(10).max(10).safeParse(code).success === false) {
      return next(new appError("code must be a valid string", 400));
    }

    const updatedTeam = await teamService.joinTeam(req.user as IUser, code);

    res.status(200).json({
      status: "success",
      data: { team: updatedTeam },
    });
  }
);

export const changeRole = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    req.body.relationId = req.params.relationId;
    const data = ValidateInput(req.body, changeRoleSchema);

    if (req.userInTeam?.id === data.relationId) {
      return next(new appError("you can't change your role", 400));
    }
    const userRelation = await teamService.changeRole(data);
    res.status(200).json({
      status: "success",
      data: { userRole: userRelation },
    });
  }
);

export const getTeam = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { teamId } = req.params;

    const team = await teamService.getTeam(teamId, {
      userInTeams: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              photo: true,
            },
          },
        },
      },
    });
    const formatted = teamObjectFormatter(team, req.user?.id as string);

    res.status(200).json({
      message: "success",
      data: { team: formatted },
    });
  }
);

export const kickUserFromTeam = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { relationId } = req.params;

    if (z.string().uuid().safeParse(relationId).success === false) {
      return next(new appError("relationId must be a valid uuid", 400));
    }

    if (req.userInTeam?.id === relationId) {
      return next(new appError("you can't kick yourself", 400));
    }

    const userRelation = await teamService.kickUserFromTeam(relationId);

    res.status(200).json({
      status: "success",
      data: { userRole: userRelation },
    });
  }
);
