import teamService from "../services/team.service";
import { catchReqAsync } from "../helpers/catchAsync";
import appError from "../helpers/appError";
import { IUser, IUserInTeam } from "../types/entitiesTypes";
import {
  changeRoleSchema,
  CreateTeamSchema,
  default_teamLogo,
  updateTeamSchema,
} from "../types/teamTypes";
import { z } from "zod";
import ValidateInput, { validateId } from "../helpers/ValidateInput";
import { fileRemover, fileuploader } from "../helpers/image.handle";
import { teamObjectFormatter } from "../helpers/objectFormatter";

export const createTeam = catchReqAsync(async (req, res, next) => {
  const data = ValidateInput(req.body, CreateTeamSchema);

  const team = await teamService.createTeam(req.user as IUser, data);

  if (team.teamLogo != default_teamLogo) {
    await fileuploader(req.file, team.teamLogo as string);
  }

  if (data.members) {
    const members: String[] = JSON.parse(data.members);
    const rows: IUserInTeam[] = members.map((row) => {
      return { userId: row, teamId: team.id } as IUserInTeam;
    });

    await teamService.addMembers(rows);
  }

  res.status(201).json({
    status: "success",
    data: team,
  });
});

export const getMyTeams = catchReqAsync(async (req, res, next) => {
  const teams = await teamService.getMyTeams(req.user?.id as string);

  res.status(200).json({
    status: "success",
    data: {
      teams,
    },
  });
});
export const getTeam = catchReqAsync(async (req, res, next) => {
  const { teamId } = req.params;

  const team = await teamService.getTeam(teamId, {
    userInTeams: {
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            photo: true,
          },
        },
      },
    },
  });
  const formatted = teamObjectFormatter(team, req.user?.id as string);

  res.status(200).json({
    message: "success",
    data: { team: formatted },
  });
});

export const updateMyTeam = catchReqAsync(async (req, res, next) => {
  const data = ValidateInput(req.body, updateTeamSchema);

  const team = await teamService.updateTeam(data, req.team?.id as string);

  if (req.team?.teamLogo !== team.teamLogo) {
    await fileuploader(req.file, team.teamLogo as string);
    if (req.team?.teamLogo !== default_teamLogo)
      await fileRemover(req.team?.teamLogo as string);
  }

  res.status(200).json({
    status: "success",
    data: {
      team,
    },
  });
});

export const joinTeam = catchReqAsync(async (req, res, next) => {
  const { code } = req.params;
  if (z.string().min(10).max(10).safeParse(code).success === false) {
    return next(new appError("code must be a valid string", 400));
  }

  const relation = await teamService.joinTeam(req.user as IUser, code);

  res.status(201).json({
    status: "success",
    data: { relation },
  });
});

export const changeRole = catchReqAsync(async (req, res, next) => {
  req.body.relationId = req.params.relationId;
  const data = ValidateInput(req.body, changeRoleSchema);

  if (req.userInTeam?.id === data.relationId) {
    return next(new appError("you can't change your role", 400));
  }
  const userRelation = await teamService.changeRole(data);
  res.status(200).json({
    status: "success",
    data: { userRole: userRelation },
  });
});

export const kickUserFromTeam = catchReqAsync(async (req, res, next) => {
  const { relationId } = req.params;

  if (z.string().uuid().safeParse(relationId).success === false) {
    return next(new appError("relationId must be a valid uuid", 400));
  }

  if (req.userInTeam?.id === relationId) {
    return next(new appError("you can't kick yourself", 400));
  }

  const userRelation = await teamService.kickUserFromTeam(relationId);

  res.status(200).json({
    status: "success",
    data: { userRole: userRelation },
  });
});

export const leaveTeam = catchReqAsync(async (req, res, next) => {
  if (req.userInTeam?.role == "OWNER") {
    return next(
      new appError("you can't leave without transfering the ownership", 400)
    );
  }
  await teamService.kickUserFromTeam(req.userInTeam?.id as string);

  res.status(200).json({
    status: "success",
    message: "done",
  });
});

export const transferOwnership = catchReqAsync(async (req, res, next) => {
  const { relationId } = req.body;

  if (validateId(relationId)) {
    return next(new appError("invalid user Id", 400));
  }

  await teamService.transferOwnership(req.user as any, relationId);

  res.status(200).json({
    status: "success",
    message: " the owner have been transfer",
  });
});

export const deleteTeam = catchReqAsync(async (req, res, next) => {
  const team = await teamService.deleteTeam(req.params?.teamId as string);

  if (team.teamLogo != default_teamLogo) {
    await fileRemover(team.teamLogo as string);
  }
  res.status(204).json({
    status: "success",
  });
});
