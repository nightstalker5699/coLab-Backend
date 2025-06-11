import { Request } from "express";
import { ITeam, IUserInTeam } from "./entitiesTypes";
export interface IRequest extends Request {
  team?: ITeam | undefined;
  userInTeam?: IUserInTeam | undefined;
}
