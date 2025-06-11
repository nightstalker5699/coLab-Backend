import { User, Team, UserInTeam } from "@prisma/client";

export interface IUser extends User {
  userInTeams?: IUserInTeam[];
}

export interface ITeam extends Team {
  userInTeams?: IUserInTeam[];
}

export interface IUserInTeam extends UserInTeam {
  user?: IUser;
  team?: ITeam;
}
