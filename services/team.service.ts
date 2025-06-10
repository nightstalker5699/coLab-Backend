import { PrismaClient } from "@prisma/client";
import { Iuser, Iteam, IuserInTeam } from "../types/entitiesTypes";
import { createTeamType } from "../types/teamTypes";
import AppError from "../helpers/appError";

const client = new PrismaClient();

export default class teamService {
  static async createTeam(user: Iuser, data: createTeamType): Promise<Iteam> {
    const team: Iteam = await client.team.create({ data: data.teamData });
    if (!team) {
      throw new AppError("an error creating your team", 400, "DatabaseError");
    }
    const relation: IuserInTeam = await client.userInTeam.create({
      data: {
        userId: user.id,
        teamId: team.id,
        role: "LEADER",
      },
    });

    return team;
  }
  static async addMembers(team: Iteam, members: IuserInTeam[]) {
    const relation = await client.userInTeam.createMany({
      data: members,
    });
    return relation;
  }
  static async joinTeam(user: Iuser, code: string) {
    const team = await client.team.findUnique({
      where: {
        joinCode: code,
      },
    });
    if (!team) {
      throw new AppError(
        "This code doesn't belong to a team",
        404,
        "ValidationError"
      );
    }
    const relation: IuserInTeam = await client.userInTeam.create({
      data: {
        userId: user.id,
        teamId: team.id,
        role: "MEMBER",
      },
    });
    return relation;
  }
}
