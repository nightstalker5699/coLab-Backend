import { Prisma, PrismaClient } from "@prisma/client";
import { IUser, ITeam, IUserInTeam } from "../types/entitiesTypes";
import { default_teamLogo, updateTeamType } from "../types/teamTypes";
import appError from "../helpers/appError";
import codeCreator from "../helpers/codeCreater";
import client from "../middlewares/prisma/user.middleware";
import { changeRoleInputType, CreateTeamType } from "../types/teamTypes";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default class TeamService {
  static async checkExist(query: Prisma.TeamCountArgs): Promise<boolean> {
    return (await client.team.count(query)) > 0;
  }
  static async createTeam(user: IUser, data: CreateTeamType): Promise<ITeam> {
    const code = await codeCreator(
      10,
      client as PrismaClient,
      "team",
      "joinCode"
    );

    data.joinCode = code;

    if (!data.teamLogo) {
      data.teamLogo = default_teamLogo;
    }
    const { members, ...insert } = data;
    const team: ITeam = await client.team.create({ data: insert });

    if (!team) {
      throw new appError("an error creating your team", 400, "DatabaseError");
    }

    const relation: IUserInTeam = await client.userInTeam.create({
      data: {
        userId: user.id,
        teamId: team.id,
        role: "OWNER",
      },
    });

    return team;
  }
  static async getTeam(
    teamId: string,
    includeOptions: Prisma.TeamInclude
  ): Promise<ITeam> {
    const team = await client.team.findUnique({
      where: {
        id: teamId,
      },
      include: includeOptions,
    });
    if (!team) {
      throw new appError("there is no team with that ID", 404);
    }
    return team;
  }

  static async getMyTeams(userId: string) {
    const relation: Pick<IUserInTeam, "team">[] =
      await client.userInTeam.findMany({
        where: {
          userId,
        },
        select: {
          team: true,
        },
      });
    const teams: ITeam[] = relation.map((row) => {
      return row.team as ITeam;
    });
    return teams;
  }

  static async updateTeam(data: updateTeamType, id: string) {
    const team = await client.team.update({ where: { id }, data });
    return team;
  }
  static async changeRole(data: changeRoleInputType) {
    const userTeam = await client.userInTeam.update({
      where: {
        id: data.relationId,
      },
      data: {
        role: data.role,
      },
    });

    if (!userTeam) {
      throw new appError("this user doesn't belong to this team", 404);
    }

    return userTeam;
  }

  static async addMembers(members: IUserInTeam[]) {
    const relation = await client.userInTeam.createMany({
      data: members,
    });
    return relation;
  }

  static async joinTeam(user: IUser, code: string) {
    const team = await client.team.findUnique({
      where: {
        joinCode: code,
      },
    });
    if (!team) {
      throw new appError(
        "This code doesn't belong to a team",
        404,
        "ValidationError"
      );
    }
    const relation: IUserInTeam = await client.userInTeam.create({
      data: {
        userId: user.id,
        teamId: team.id,
        role: "MEMBER",
      },
    });

    const updatedteam = await client.team.findUnique({
      where: {
        id: relation.teamId,
      },
      include: {
        userInTeams: {
          select: {
            user: {
              select: {
                username: true,
                email: true,
                photo: true,
              },
            },
          },
        },
      },
    });
    return updatedteam;
  }

  static async getUserRoleInTeam(teamId: string, userId: string) {
    const userTeam = await client.userInTeam.findFirst({
      where: {
        teamId,
        userId,
      },
    });
    return userTeam;
  }

  static async kickUserFromTeam(relationId: string) {
    const userTeam = await client.userInTeam.delete({
      where: {
        id: relationId,
      },
    });
    return userTeam;
  }

  static async transferOwnership(user: IUser, relationId: string) {
    await client.userInTeam.update({
      where: {
        id: relationId,
      },
      data: {
        role: "OWNER",
      },
    });
    await client.userInTeam.update({
      where: {
        id: user.id,
      },
      data: {
        role: "MEMBER",
      },
    });
  }

  static async deleteTeam(teamId: string) {
    const team = await client.team.delete({
      where: {
        id: teamId,
      },
    });
    return team;
  }
}
