import { Status } from "@prisma/client";
import { ITask, ITeam, IUser } from "../types/entitiesTypes";

export const teamObjectFormatter = (team: ITeam, userId: string) => {
  return {
    id: team.id,
    teamName: team.teamName,
    teamLogo: team.teamLogo,
    theme: team.theme,
    joinCode: team.joinCode,
    teamMembers: team.userInTeams?.map((relation) => {
      let user = relation.user;
      return {
        ...user,
        teamRole: relation.role,
        joinAt: relation.joinedAt,
        relationId: relation.id,
        isMe: userId == user?.id ? true : false,
      };
    }),
  };
};

export const tasksFormatter = (tasks: any, relationId: string) => {
  const statues = Object.values(Status) as [Status, ...Status[]];

  const holder = statues.reduce((holder: any, item: any) => {
    holder[item] = [];

    return holder;
  }, {} as any);

  const data = tasks.reduce((holder: any, currentTask: any) => {
    currentTask.assignedBy.user = currentTask.assignedBy?.user?.username;
    const status = currentTask.taskStatus;
    currentTask.forMe = relationId == currentTask.assignedToId ? true : false;
    holder[status].push(currentTask);
    return holder;
  }, holder);
  return data;
};
