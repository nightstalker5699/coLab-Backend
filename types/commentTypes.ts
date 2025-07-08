import { z } from "zod";

export const createCommentSchema = z.object({
  userId: z.string().uuid(),
  taskId: z.string().uuid(),
  content: z.string().max(255, "you can't write more than 255 letters"),
  attachedFile: z.string().url().optional(),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .max(255, "you can't write more than 255 letters")
    .optional(),
  attachedFile: z.string().url().optional(),
});

export type createCommentType = z.infer<typeof createCommentSchema>;

export type updateCommentType = z.infer<typeof updateCommentSchema>;
