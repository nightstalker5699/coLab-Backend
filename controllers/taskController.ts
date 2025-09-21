import { catchReqAsync } from "../helpers/catchAsync";
import ValidateInput from "../helpers/ValidateInput";
import {
  fileRemover,
  fileuploader,
  imagePathExtender,
} from "../helpers/image.handle";
import {
  changeStatusSchema,
  createTaskSchema,
  queryParams,
  updateTaskSchema,
} from "../types/taskTypes";
import { taskService } from "../services/task.service";
import { tasksFormatter } from "../helpers/objectFormatter";
import { querybuilder } from "../helpers/queryBuilder";

export const createTask = catchReqAsync(async (req, res, next) => {
  req.body.teamId = req.userInTeam?.teamId;
  req.body.assignedById = req.userInTeam?.id;

  const data = ValidateInput(req.body, createTaskSchema);
  data.attachedFile = data.attachedFile
    ? imagePathExtender(data.attachedFile, data.teamId + "/tasks")
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
  const query = req.query;

  const data = ValidateInput(query, queryParams);

  const result = await querybuilder("task", data, ["teamId"]);

  result.dbQuery.where["teamId"] = req.userInTeam?.teamId;

  const semiTasks = await taskService.getTasks(
    req.userInTeam?.teamId as string,
    result.dbQuery,
    JSON.stringify(result.dbQuery)
  );

  const tasks = tasksFormatter(semiTasks, req.userInTeam?.id as string);

  return res.status(200).json({
    status: "success",
    data: { tasks },
    maxPage: result.maxPage,
  });
});

export const getTask = catchReqAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
  const teamId = req.params.teamId;
  const task = await taskService.getTask(taskId, teamId);

  res.status(200).json({
    status: "success",
    data: {
      task: {
        ...task,
        forMe: req.userInTeam?.id == task.assignedToId ? true : false,
      },
    },
  });
});

export const updateTask = catchReqAsync(async (req, res, next) => {
  const taskId = req.params.taskId;

  const data = ValidateInput(req.body, updateTaskSchema);

  data.attachedFile = data.attachedFile
    ? imagePathExtender(data.attachedFile, req.params.teamId)
    : undefined;

  const updatedTask = await taskService.updateTask(data, taskId);

  if (data.attachedFile) {
    await fileRemover(req.task?.attachedFile as string);
    await fileuploader(req.file, data.attachedFile);
  }

  res.status(200).json({
    status: "success",
    data: { task: updatedTask },
  });
});

export const changeTaskStatus = catchReqAsync(async (req, res, next) => {
  const taskId = req.params.taskId;

  const data = ValidateInput(req.body, changeStatusSchema);

  const task = await taskService.updateTask(data, taskId);

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

export const deleteTask = catchReqAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
  const deletedTask = await taskService.deleteTask(taskId);

  if (deletedTask.attachedFile) {
    await fileRemover(deletedTask.attachedFile);
  }

  res.status(204).json({
    status: "success",
  });
});
