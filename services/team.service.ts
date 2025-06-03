import { PrismaClient, Team, User, UserInTeam } from "@prisma/client";
import { createTeamType } from "../types/teamTypes";
import { getSystemErrorMap } from "util";
import AppError from "../helpers/appError";

const client = new PrismaClient();

export default class teamService {
  static async createTeam(user: User, data: createTeamType): Promise<Team> {
    const team: Team = await client.team.create({ data: data.teamData });
    if (!team) {
      throw new AppError("an error creating your team", 400, "DatabaseError");
    }
    const relation: UserInTeam = await client.userInTeam.create({
      data: {
        userId: user.id,
        teamId: team.id,
        role: "LEADER",
      },
    });

    return team;
  }
  static async addMembers(team: Team, members: UserInTeam[]) {
    const relation = await client.userInTeam.createMany({
      data: members,
    });
    return relation;
  }
  static async joinTeam(user: User, code: string) {
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
    const relation: UserInTeam = await client.userInTeam.create({
      data: {
        userId: user.id,
        teamId: team.id,
        role: "MEMBER",
      },
    });
    return relation;
  }
}
