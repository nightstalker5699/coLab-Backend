import { Priority, Status } from "@prisma/client";
import { create } from "domain";
import { TypeOf, z } from "zod";

export const createTaskSchema = z.object({
  taskName: z.string().max(50, "you can't use more than 50 characters"),
  taskDescription: z
    .string()
    .max(255, "you can't use more than 255 characters"),
  taskDeadline: z.coerce
    .date()
    .min(new Date(Date.now()), "you must set deadline later than this"),
  attachedFile: z.string().url().optional(),
  taskStatus: z.enum(Object.values(Status) as [Status, ...Status[]]).optional(),
  taskPriority: z
    .enum(Object.values(Priority) as [Priority, ...Priority[]])
    .optional(),
  taskCategoryId: z.string().uuid().optional(),
  assignedById: z.string().uuid(),
  assignedToId: z.string().uuid().optional(),
  teamId: z.string().uuid(),
});

export const taskFilterSchema = z.object({
  taskCategoryId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  teamId: z.string().uuid(),
});

export type createTaskType = z.infer<typeof createTaskSchema>;

export type taskFilterType = z.infer<typeof taskFilterSchema>;
