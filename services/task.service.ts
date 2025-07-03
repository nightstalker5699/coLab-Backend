import client from "../middlewares/prisma/user.middleware";
import appError from "../helpers/appError";

import { Prisma } from "@prisma/client";

import { createTaskType, taskFilterType } from "../types/taskTypes";
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
      orderBy: {
        createdAt: "asc",
      },
    });
    return tasks;
  }
}
