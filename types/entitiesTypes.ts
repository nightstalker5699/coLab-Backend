import { User, Team, UserInTeam, TaskCategory } from "@prisma/client";

export interface IUser extends User {
  userInTeams?: IUserInTeam[];
}

export interface ITeam extends Team {
  userInTeams?: IUserInTeam[];
  categories?: ITaskCategory[];
}

export interface IUserInTeam extends UserInTeam {
  user?: IUser;
  team?: ITeam;
}

export interface ITaskCategory extends TaskCategory {
  team: ITeam;
}
