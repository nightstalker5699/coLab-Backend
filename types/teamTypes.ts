import { Role, Team } from "@prisma/client";

type partialTeam = {
  teamName: string;
  teamLogo?: string;
  theme?: string;
};

export type createTeamType = {
  teamData: partialTeam;
  members: string[];
};
