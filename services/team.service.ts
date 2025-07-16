import { Prisma, PrismaClient } from "@prisma/client";
import { IUser, ITeam, IUserInTeam } from "../types/entitiesTypes";
import { default_teamLogo, updateTeamType } from "../types/teamTypes";
import appError from "../helpers/appError";
import codeCreator from "../helpers/codeCreater";
import client from "../middlewares/prisma/user.middleware";
import { changeRoleInputType, CreateTeamType } from "../types/teamTypes";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { redisClient } from "../middlewares/Session";
import { cacheService } from "./cache.service";

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
    const key = cacheService.genereteKey("teams", teamId);

    const team = await cacheService.getOrSet<ITeam>(key, async () => {
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
    });

    return team;
  }

  static async getMyTeams(userId: string) {
    const key = cacheService.genereteKey("teams", "users", userId);

    const teams = await cacheService.getOrSet<ITeam[]>(key, async () => {
      const relation: Pick<IUserInTeam, "team">[] =
        await client.userInTeam.findMany({
          where: {
            userId,
          },
          select: {
            team: true,
          },
        });
      return relation.map((row) => {
        return row.team as ITeam;
      });
    });
    return teams;
  }

  static async updateTeam(data: updateTeamType, id: string) {
    const team = await client.team.update({ where: { id }, data });
    await cacheService.delPattern(`teams:users:*`);
    await cacheService.del(`teams:${id}`);
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
    const key = cacheService.genereteKey(
      "relations",
      userTeam.teamId,
      userTeam.userId
    );
    await cacheService.del(`teams:${userTeam.teamId}`);
    await cacheService.set(key, userTeam);
    return userTeam;
  }

  static async addMembers(members: IUserInTeam[]) {
    const key = cacheService.genereteKey("teams", members[0].teamId);
    const relation = await client.userInTeam.createMany({
      data: members,
    });
    await cacheService.del(key);
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
    const key = cacheService.genereteKey("teams", team.id);
    const setKey = cacheService.genereteKey(
      "teams",
      relation.teamId,
      "relations",
      relation.userId
    );
    await cacheService.del(key);

    await cacheService.set(setKey, relation);
    return relation;
  }

  static async getUserRoleInTeam(teamId: string, userId: string) {
    const key = cacheService.genereteKey("teams", teamId, "relations", userId);
    const record = await cacheService.getOrSet<IUserInTeam>(key, async () => {
      const relation = await client.userInTeam.findFirst({
        where: {
          teamId,
          userId,
        },
      });
      if (!relation) {
        throw new appError(
          "this team doesn't exist or you do not belong to them",
          400
        );
      }
      return relation;
    });

    return record;
  }

  static async kickUserFromTeam(relationId: string) {
    const userTeam = await client.userInTeam.delete({
      where: {
        id: relationId,
      },
    });
    const key = cacheService.genereteKey("teams", userTeam.teamId);

    await cacheService.delPattern(`${key}*`);
    return userTeam;
  }

  static async transferOwnership(user: IUser, relationId: string) {
    const owner = await client.userInTeam.update({
      where: {
        id: relationId,
      },
      data: {
        role: "OWNER",
      },
    });
    const member = await client.userInTeam.update({
      where: {
        id: user.id,
      },
      data: {
        role: "MEMBER",
      },
    });
    const teamId = member.teamId;
    const ownerKey = cacheService.genereteKey(
      "teams",
      teamId,
      "relations",
      owner.userId
    );
    const memberKey = cacheService.genereteKey(
      "teams",
      teamId,
      "relations",
      member.userId
    );
    const teamKey = cacheService.genereteKey("teams", teamId);

    await cacheService.set(ownerKey, owner);
    await cacheService.set(memberKey, member);
    await cacheService.del(teamKey);
  }

  static async deleteTeam(teamId: string) {
    const team = await client.team.delete({
      where: {
        id: teamId,
      },
    });
    const teamKey = cacheService.genereteKey("teams", teamId);
    await cacheService.delPattern(`${teamKey}*`);
    await cacheService.delPattern("teams:users:*");
    return team;
  }
}
