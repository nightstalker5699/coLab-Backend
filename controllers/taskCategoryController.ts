import ValidateInput, { validateId } from "../helpers/ValidateInput";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import {
  createTaskCategorySchema,
  updateTaskCategorySchema,
} from "../types/taskCategoryTypes";
import { taskCategoryService } from "../services/taskCategory.service";
import { Prisma } from "@prisma/client";
export const createTaskCategory = catchReqAsync(async (req, res, next) => {
  req.body.teamId = req.params.teamId;

  const data = ValidateInput(req.body, createTaskCategorySchema);

  const TaskCategory = await taskCategoryService.createTaskCategory(data);

  res.status(201).json({
    status: "success",
    data: { TaskCategory },
  });
});

export const getAllTaskCategory = catchReqAsync(async (req, res, next) => {
  const query: Prisma.TaskCategoryFindManyArgs = {
    where: {
      teamId: req.params.teamId,
    },
  };
  if (req.query.categoryName) {
    query.where = {
      ...query.where,
      categoryName: {
        contains: req.query.categoryName as string,
        mode: "insensitive",
      },
    };
  }

  const taskCategory = await taskCategoryService.getAllTaskCategory(query);

  res.status(200).json({
    status: "success",
    data: { taskCategory },
  });
});

export const updateTaskCategory = catchReqAsync(async (req, res, next) => {
  const taskCategoryId = req.params.taskCategoryId;

  const data = ValidateInput(req.body, updateTaskCategorySchema);

  const TaskCategory = await taskCategoryService.updateTaskCategory(
    data,
    taskCategoryId
  );

  res.status(200).json({
    status: "success",
    data: { TaskCategory },
  });
});
export const deleteTaskCategory = catchReqAsync(async (req, res, next) => {
  const taskCategoryId = req.params.taskCategoryId;

  const TaskCategory = await taskCategoryService.deleteTaskCategory(
    taskCategoryId
  );

  res.status(204).json({
    status: "success",
    data: { TaskCategory },
  });
});
