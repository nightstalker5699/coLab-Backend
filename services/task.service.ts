import client from "../middlewares/prisma/user.middleware";
import appError from "../helpers/appError";

import { Prisma } from "@prisma/client";

import {
  createTaskType,
  taskFilterType,
  updateTaskType,
} from "../types/taskTypes";
import { ITask } from "../types/entitiesTypes";
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
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return tasks;
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
