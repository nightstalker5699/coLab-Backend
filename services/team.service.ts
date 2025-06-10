import { PrismaClient } from "@prisma/client";
import { Iuser, Iteam, IuserInTeam } from "../types/entitiesTypes";
import { createTeamType } from "../types/teamTypes";
import appError from "../helpers/appError";
import codeCreator from "../helpers/codeCreater";

const client = new PrismaClient();

export default class teamService {
  static async createTeam(user: Iuser, data: createTeamType): Promise<Iteam> {
    const code = await codeCreator(10, client, "team", "joinCode");
    data.teamData.joinCode = code;
    const team: Iteam = await client.team.create({ data: data.teamData });
    if (!team) {
      throw new appError("an error creating your team", 400, "DatabaseError");
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
    const relation: IuserInTeam = await client.userInTeam.create({
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
    const relation: Pick<IuserInTeam, "team">[] =
      await client.userInTeam.findMany({
        where: {
          userId,
        },
        select: {
          team: true,
        },
      });
    console.log(relation);
    const teams: Iteam[] = relation.map((row) => {
      return row.team as Iteam;
    });
    return teams;
  }
}
