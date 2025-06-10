import { Role, Team, UserInTeam } from "@prisma/client";

type partialTeam = {
  teamName: string;
  teamLogo?: string;
  theme?: string;
  joinCode?: string;
};

export type createTeamType = {
  teamData: partialTeam;
  members: string[];
};
