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
  // Initialize holder with all statuses
  const data = Object.values(Status).reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {} as any);

  // Process and categorize tasks
  tasks.forEach((task: any) => {
    task.assignedBy.user = task.assignedBy?.user?.username;
    task.forMe = relationId === task.assignedToId;
    data[task.taskStatus].push(task);
  });

  return data;
};
