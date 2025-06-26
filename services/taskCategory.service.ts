import client from "../middlewares/prisma/user.middleware";
import appError from "../helpers/appError";
import {
  createCategoryType,
  updateCategoryType,
} from "../types/taskCategoryTypes";
import { Prisma } from "@prisma/client";
const taskClient = client.taskCategory;

export class taskCategoryService {
  static async createTaskCategory(data: createCategoryType) {
    try {
      const taskCategory = await taskClient.create({
        data,
      });

      return taskCategory;
    } catch (err) {
      throw new appError("there is an error creating your Task Category", 400);
    }
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
    return await taskClient.update({ where: { id }, data });
  }
}
