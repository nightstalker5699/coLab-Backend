import client from "../middlewares/prisma/user.middleware";
import appError from "../helpers/appError";

import {
  createTaskType,
  taskFilterType,
  updateTaskType,
} from "../types/taskTypes";
import { cacheService } from "./cache.service";
import { ITask } from "../types/entitiesTypes";
const taskClient = client.task;

export class taskService {
  static async createTask(data: createTaskType) {
    const task = await taskClient.create({
      data: data,
      include: {
        comments: true,
        assignedBy: {
          select: {
            user: {
              select: {
                username: true,
                photo: true,
              },
            },
          },
        },
        taskCategory: true,
      },
    });
    const key = cacheService.genereteKey("teams", task.teamId, "tasks");
    await cacheService.set(`${key}:${task.teamId}`, task);
    await cacheService.delPattern(`${key}:all*`);
    return task;
  }

  static async getTasks(where: taskFilterType, query: string) {
    const key = cacheService.genereteKey(
      "teams",
      where.teamId,
      "tasks",
      "all",
      query
    );
    const data = await cacheService.getOrSet(key, async () => {
      return await taskClient.findMany({
        where,
        select: {
          id: true,
          taskPriority: true,
          taskStatus: true,
          createdAt: true,
          taskName: true,
          taskDescription: true,
          taskDeadline: true,
          assignedBy: {
            select: {
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
          assignedToId: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    });

    return data;
  }

  static async getTask(id: string, teamId: string) {
    const key = cacheService.genereteKey("teams", teamId, "tasks", id);
    const data = await cacheService.getOrSet(key, async () => {
      const task = await taskClient.findUnique({
        where: {
          id,
        },
        include: {
          comments: true,
          assignedBy: {
            select: {
              user: {
                select: {
                  username: true,
                  photo: true,
                },
              },
            },
          },
          taskCategory: true,
        },
      });

      if (!task) {
        throw new appError("there is no task with that ID", 404);
      }
      return task;
    });

    return data;
  }
  static async updateTask(data: updateTaskType, taskId: string) {
    const updatedTask = await taskClient.update({
      where: {
        id: taskId,
      },
      data,
    });
    const key = cacheService.genereteKey("teams", updatedTask.teamId, "tasks");
    await cacheService.del(`${key}:${updatedTask.id}`);
    await cacheService.delPattern(`${key}:all*`);
    return updatedTask;
  }

  static async deleteTask(taskId: string) {
    const deletedTask = await taskClient.delete({
      where: {
        id: taskId,
      },
    });
    const key = cacheService.genereteKey("teams", deletedTask.teamId, "tasks");
    await cacheService.del(`${key}:${deletedTask.id}`);
    await cacheService.delPattern(`${key}:all*`);
    return deletedTask;
  }
}
