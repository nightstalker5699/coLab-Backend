import { z } from "zod";

export const createTaskCategorySchema = z.object({
  categoryName: z
    .string()
    .max(50, "you can't use names with more than 50 characters"),
  categoryColor: z
    .string()
    .max(20, "you can't use color with more than 20 characters"),
  teamId: z.string().uuid("invalid team ID"),
});

export const updateTaskCategorySchema = z.object({
  categoryName: z
    .string()
    .max(50, "you can't use names with more than 50 characters")
    .optional(),
  categoryColor: z
    .string()
    .max(20, "you can't use color with more than 20 characters")
    .optional(),
});

export type createCategoryType = z.infer<typeof createTaskCategorySchema>;

export type updateCategoryType = z.infer<typeof updateTaskCategorySchema>;
