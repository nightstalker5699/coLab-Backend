import client from "../middlewares/prisma/user.middleware";
import appError from "../helpers/appError";
import { createCommentType, updateCommentType } from "../types/commentTypes";

const commentClient = client.comment;

export class commentService {
  static async createComment(data: createCommentType) {
    const comment = await commentClient.create({
      data,
    });

    return comment;
  }

  static async getComment(id: string) {
    const comment = await commentClient.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new appError("there is comment with that ID", 404);
    }

    return comment;
  }
  static async updateComment(
    data: updateCommentType,
    id: string,
    userId: string
  ) {
    const comment = await commentClient.update({
      where: {
        id,
        userId,
      },
      data,
    });
    return comment;
  }

  static async deleteComment(id: string, userId: string) {
    const comment = await commentClient.delete({ where: { id, userId } });

    return comment;
  }
}
