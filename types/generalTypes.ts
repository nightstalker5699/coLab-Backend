import { Request } from "express";
import {
  IComment,
  ITask,
  ITaskCategory,
  ITeam,
  IUserInTeam,
} from "./entitiesTypes";
export interface IRequest extends Request {
  team?: ITeam | undefined;
  userInTeam?: IUserInTeam | undefined;
  taskCategory?: ITaskCategory | undefined;
  task?: ITask | undefined;
  comment?: IComment | undefined;
}

export interface QueryParams {
  filter?: string;
  sort?: string;
  page?: number;
  size?: number;
}
