import { catchReqAsync } from "../helpers/catchAsync";
import {
  fileRemover,
  fileuploader,
  imagePathExtender,
} from "../helpers/image.handle";
import ValidateInput from "../helpers/ValidateInput";
import { commentService } from "../services/comment.service";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../types/commentTypes";

export const createComment = catchReqAsync(async (req, res, next) => {
  req.body.userId = req.userInTeam?.id;
  req.body.taskId = req.params.taskId;

  const data = ValidateInput(req.body, createCommentSchema);

  data.attachedFile = data.attachedFile
    ? imagePathExtender(data.attachedFile, req.params.teamId + "/comments")
    : undefined;
  const comment = await commentService.createComment(data);

  if (data.attachedFile) {
    await fileuploader(req.file, data.attachedFile);
  }

  res.status(200).json({
    status: "success",
    data: { comment },
  });
});

export const updateComment = catchReqAsync(async (req, res, next) => {
  const commentId = req.params.commentId;

  const data = ValidateInput(req.body, updateCommentSchema);

  let oldComment;

  if (data.attachedFile) {
    data.attachedFile = imagePathExtender(
      data.attachedFile,
      req.params.teamId + "/comments"
    );
    oldComment = await commentService.getComment(commentId);
  }

  const newComment = await commentService.updateComment(
    data,
    commentId,
    req.userInTeam?.id as string
  );

  if (data.attachedFile) {
    await fileuploader(req.file, data.attachedFile);
    if (oldComment?.attachedFile) {
      await fileRemover(oldComment.attachedFile);
    }
  }

  return res.status(200).json({
    message: "success",
    data: { comment: newComment },
  });
});

export const deleteComment = catchReqAsync(async (req, res, next) => {
  const comment = await commentService.deleteComment(
    req.params.commentId,
    req.userInTeam?.id as string
  );

  if (comment.attachedFile) {
    await fileRemover(comment.attachedFile);
  }

  res.status(204).json({
    status: "success",
  });
});
