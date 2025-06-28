import { Request } from "express";
import { ITask, ITaskCategory, ITeam, IUserInTeam } from "./entitiesTypes";
export interface IRequest extends Request {
  team?: ITeam | undefined;
  userInTeam?: IUserInTeam | undefined;
  taskCategory?: ITaskCategory | undefined;
  task?: ITask | undefined;
}
