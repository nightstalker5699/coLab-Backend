import { User, Team, UserInTeam } from "@prisma/client";

export interface Iuser extends User {
  userInTeams?: IuserInTeam[];
}

export interface Iteam extends Team {
  userInTeams?: IuserInTeam[];
}

export interface IuserInTeam extends UserInTeam {
  user?: Iuser;
  team?: Iteam;
}
