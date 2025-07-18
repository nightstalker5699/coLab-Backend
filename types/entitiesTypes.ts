import {
  User,
  Team,
  UserInTeam,
  TaskCategory,
  Task,
  Comment,
} from "@prisma/client";

export interface IUser extends User {
  userInTeams?: IUserInTeam[];
}

export interface ITeam extends Team {
  userInTeams?: IUserInTeam[];
  categories?: ITaskCategory[];
  tasks?: ITask[];
}

export interface IUserInTeam extends UserInTeam {
  user?: IUser;
  team?: ITeam;
  taskAssignedTo?: ITask[];
  taskAssignedBy?: ITask[];
  comments?: IComment[];
}

export interface ITaskCategory extends TaskCategory {
  team?: ITeam;
  tasks?: ITask[];
}

export interface ITask extends Task {
  team?: ITeam;
  taskCategory?: ITaskCategory;
  assignedTo?: IUserInTeam;
  assignedBy?: IUserInTeam;
  comments?: IComment[];
}

export interface IComment extends Comment {
  user?: IUser;
  task?: ITask;
}
