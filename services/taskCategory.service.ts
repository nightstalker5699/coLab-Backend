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
    try {
      const taskCategory = await taskClient.update({ where: { id }, data });

      return taskCategory;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        if (err.code === "P2025") {
          console.log("there is no taskCategory with that ID");
        }
    }
  }
  static async deleteTaskCategory(id: string) {
    try {
      const taskCategory = await taskClient.delete({ where: { id } });

      return taskCategory;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        if (err.code === "P2025") {
          console.log("there is no taskCategory with that ID");
        }
    }
  }
}
