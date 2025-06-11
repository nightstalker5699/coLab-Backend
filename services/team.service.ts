import { Role, Prisma, PrismaClient } from "@prisma/client";
import { IUser, ITeam, IUserInTeam } from "../types/entitiesTypes";
import { createTeamType } from "../types/teamTypes";
import appError from "../helpers/appError";
import codeCreator from "../helpers/codeCreater";
import client from "../middlewares/prisma/user.middleware";

export default class TeamService {
  static async checkExist(query: Prisma.TeamCountArgs): Promise<boolean> {
    return (await client.team.count(query)) > 0;
  }
  static async createTeam(user: IUser, data: createTeamType): Promise<ITeam> {
    const code = await codeCreator(
      10,
      client as PrismaClient,
      "team",
      "joinCode"
    );
    data.teamData.joinCode = code;
    const team: ITeam = await client.team.create({ data: data.teamData });
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
    const checkExist = await client.userInTeam.findFirst({
      where: {
        teamId: team.id,
        userId: user.id,
      },
    });
    if (checkExist) {
      throw new appError("you already in this team", 400, "ValidationError");
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
    console.log(relation);
    const teams: ITeam[] = relation.map((row) => {
      return row.team as ITeam;
    });
    return teams;
  }
  static async changeRole(id: string, role: Role) {
    const userTeam = await client.userInTeam.update({
      where: {
        id,
      },
      data: {
        role,
      },
    });

    if (!userTeam) {
      throw new appError("this user doesn't belong to this team", 404);
    }

    return userTeam;
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
}
