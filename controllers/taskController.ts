import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import { ITeam, IUser, IUserInTeam } from "../types/entitiesTypes";
import { z } from "zod";
import ValidateInput, { validateId } from "../helpers/ValidateInput";
import {
  fileRemover,
  fileuploader,
  imagePathExtender,
} from "../helpers/image.handle";
import { createTaskSchema, taskFilterSchema } from "../types/taskTypes";
import { taskService } from "../services/task.service";
import { tasksFormatter } from "../helpers/objectFormatter";

export const createTask = catchReqAsync(async (req, res, next) => {
  req.body.teamId = req.userInTeam?.teamId;
  req.body.assignedById = req.userInTeam?.id;

  const data = ValidateInput(req.body, createTaskSchema);
  data.attachedFile = data.attachedFile
    ? imagePathExtender(data.attachedFile, data.teamId)
    : undefined;

  const task = await taskService.createTask(data);

  if (task.attachedFile) {
    await fileuploader(req.file, task.attachedFile);
  }

  res.status(200).json({
    data: { task },
  });
});

export const getTasks = catchReqAsync(async (req, res, next) => {
  // 1. Auto-inject teamId from authenticated user
  const query = {
    ...req.query,
    teamId: req.params.teamId,
  };
  // 2. Validate input with schema
  const data = ValidateInput(query, taskFilterSchema);

  // 3. Get tasks from service layer
  const semiTasks = await taskService.getTasks(data);

  // 4. Format tasks (likely your grouping logic)
  const tasks = tasksFormatter(semiTasks);

  // 5. Return formatted response
  return res.status(200).json({
    status: "success",
    data: { tasks },
  });
});
