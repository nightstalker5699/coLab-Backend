import client from "../middlewares/prisma/user.middleware";
import {
  createCategoryType,
  updateCategoryType,
} from "../types/taskCategoryTypes";
import { Prisma } from "@prisma/client";
import { cacheService } from "./cache.service";
import { ITaskCategory } from "../types/entitiesTypes";
const taskClient = client.taskCategory;

export class taskCategoryService {
  static async createTaskCategory(data: createCategoryType) {
    const taskCategory = await taskClient.create({
      data,
    });
    const key = cacheService.genereteKey(
      "teams",
      taskCategory.teamId,
      "taskCategories"
    );
    await cacheService.del(key);
    return taskCategory;
  }

  static async getAllTaskCategory(args: Prisma.TaskCategoryFindManyArgs) {
    const key = cacheService.genereteKey(
      "teams",
      args.where?.teamId as string,
      "taskCategories"
    );

    const data = await cacheService.getOrSet(key, async () => {
      return await taskClient.findMany({
        ...args,
        select: {
          id: true,
          categoryName: true,
          categoryColor: true,
        },
      });
    });

    return data;
  }
  static async updateTaskCategory(data: updateCategoryType, id: string) {
    const taskCategory = await taskClient.update({ where: { id }, data });
    const key = cacheService.genereteKey(
      "teams",
      taskCategory.teamId,
      "taskCategories"
    );
    await cacheService.del(key);
    return taskCategory;
  }
  static async deleteTaskCategory(id: string) {
    const taskCategory = await taskClient.delete({ where: { id } });
    const key = cacheService.genereteKey(
      "teams",
      taskCategory.teamId,
      "taskCategories"
    );
    await cacheService.del(key);
    return taskCategory;
  }
}
