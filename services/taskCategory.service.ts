import client from "../middlewares/prisma/user.middleware";
import appError from "../helpers/appError";
import {
  createCategoryType,
  updateCategoryType,
} from "../types/taskCategoryTypes";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
const taskClient = client.taskCategory;

export class taskCategoryService {
  static async createTaskCategory(data: createCategoryType) {
    const taskCategory = await taskClient.create({
      data,
    });

    return taskCategory;
  }

  static async getAllTaskCategory(args: Prisma.TaskCategoryFindManyArgs) {
    return await taskClient.findMany({
      ...args,
      select: {
        id: true,
        categoryName: true,
        categoryColor: true,
      },
    });
  }
  static async updateTaskCategory(data: updateCategoryType, id: string) {
    const taskCategory = await taskClient.update({ where: { id }, data });

    return taskCategory;
  }
  static async deleteTaskCategory(id: string) {
    const taskCategory = await taskClient.delete({ where: { id } });

    return taskCategory;
  }
}
