import teamService from "../services/team.service";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import { Response, NextFunction } from "express";
import { ITeam, IUser, IUserInTeam } from "../types/entitiesTypes";
import { createTeamType } from "../types/teamTypes";
import { Role } from "@prisma/client";
import { IRequest } from "../types/generalTypes";
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
    const data: createTeamType = req.body;
    if (!data.teamData.teamName) {
      return next(
        new appError("you must insert a team", 400, "ValidationError")
      );
    }
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
    const { joinCode } = req.body;
    if (!joinCode) {
      return next(
        new appError(
          "you must input a code to join a team",
          400,
          "ValidationError"
        )
      );
    }
    const updatedTeam = await teamService.joinTeam(req.user as IUser, joinCode);

    res.status(200).json({
      status: "success",
      data: { team: updatedTeam },
    });
  }
);

export const changeRole = catchReqAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { relationId } = req.params;
    const roleChange = req.body.role;
    if (!relationId) {
      return next(new appError("user not found with this team", 404));
    }
    if (!Object.values(Role).includes(roleChange)) {
      return next(new appError("you can only change to certain roles", 400));
    }
    if (roleChange === "OWNER") {
      return next(new appError("you can't change role to owner", 400));
    }
    if (req.userInTeam?.id === relationId) {
      return next(new appError("you can't change your role", 400));
    }
    const userRelation = await teamService.changeRole(relationId, roleChange);
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
