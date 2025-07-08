import client from "../middlewares/prisma/user.middleware";
import appError from "../helpers/appError";

import {
  createTaskType,
  taskFilterType,
  updateTaskType,
} from "../types/taskTypes";
const taskClient = client.task;

export class taskService {
  static async createTask(data: createTaskType) {
    const task = await taskClient.create({
      data: data,
    });

    return task;
  }

  static async getTasks(where: taskFilterType) {
    const tasks = await taskClient.findMany({
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
    return tasks;
  }

  static async getTask(id: string) {
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
  }
  static async updateTask(data: updateTaskType, taskId: string) {
    const updatedTask = await taskClient.update({
      where: {
        id: taskId,
      },
      data,
      include: {
        assignedBy: {
          select: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    return updatedTask;
  }

  static async deleteTask(taskId: string) {
    const deletedTask = await taskClient.delete({
      where: {
        id: taskId,
      },
    });

    return deletedTask;
  }
}
